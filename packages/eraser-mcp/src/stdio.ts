#!/usr/bin/env node
/**
 * Eraser MCP stdio adapter
 *
 * This adapter allows MCP clients (like Cursor, Claude Desktop) to communicate
 * with the Eraser API via stdio transport.
 *
 * Usage:
 *   npx @eraserlabs/eraser-mcp              # Normal mode (authenticates via OAuth)
 *   npx @eraserlabs/eraser-mcp login        # Manually trigger login
 *   npx @eraserlabs/eraser-mcp logout       # Clear saved credentials
 *   npx @eraserlabs/eraser-mcp whoami       # Show current auth status
 *
 * For CI/CD and headless environments, set ERASER_API_TOKEN to bypass the OAuth flow:
 *   ERASER_API_TOKEN=your-token npx @eraserlabs/eraser-mcp
 *
 * Or configure in .cursor/mcp.json:
 *   {
 *     "mcpServers": {
 *       "eraser": {
 *         "command": "npx",
 *         "args": ["@eraserlabs/eraser-mcp"]
 *       }
 *     }
 *   }
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { mcpTools } from './tools';
import { ensureValidToken, invalidateCredentials, performLogin, logout, whoami } from './oauth/flow';

const API_URL = process.env.ERASER_API_URL || 'https://app.eraser.io/api/mcp';
const ERASER_OUTPUT_DIR = process.env.ERASER_OUTPUT_DIR || '.eraser/scratchpad';

// When set, use this token directly instead of the OAuth flow (for CI/CD and headless environments)
const ERASER_API_TOKEN = process.env.ERASER_API_TOKEN;

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: unknown;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

function sendResponse(response: JsonRpcResponse): void {
  process.stdout.write(JSON.stringify(response) + '\n');
}

function sendError(
  id: string | number | null,
  code: number,
  message: string,
  data?: unknown
): void {
  sendResponse({
    jsonrpc: '2.0',
    id,
    error: { code, message, data },
  });
}

const SERVER_INFO = {
  name: 'eraser-mcp',
  version: '1.0.0',
};

const SERVER_CAPABILITIES = {
  tools: {},
};

function getToolsList(): Array<{ name: string; description: string; inputSchema: unknown }> {
  return mcpTools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.jsonSchema,
  }));
}

interface RenderResult {
  imageUrl?: string;
  createEraserFileUrl?: string;
  localPath?: string;
  [key: string]: unknown;
}

function extractTitleFromCode(code: string | undefined): string | undefined {
  if (!code) {
    return undefined;
  }

  const lines = code.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().startsWith('title ')) {
      const title = trimmed.slice(6).trim();
      return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
  }
  return undefined;
}

async function saveImageLocally(
  imageUrl: string,
  diagramCode?: string
): Promise<string | undefined> {
  try {
    const outputDir = path.resolve(process.cwd(), ERASER_OUTPUT_DIR);
    await fs.promises.mkdir(outputDir, { recursive: true });

    const title = extractTitleFromCode(diagramCode);
    const timestamp = Date.now();
    const filename = title ? `${title}-${timestamp}.png` : `diagram-${timestamp}.png`;
    const localPath = path.join(outputDir, filename);

    const response = await fetch(imageUrl);
    if (!response.ok) {
      return undefined;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.promises.writeFile(localPath, buffer);

    return localPath;
  } catch {
    return undefined;
  }
}

let cachedAccessToken: string | null = null;
let mcpSessionId: string | null = null;
let sessionInitError: string | null = null;

async function getAccessToken(): Promise<string> {
  // API token mode: return directly, skip OAuth
  if (ERASER_API_TOKEN) {
    return ERASER_API_TOKEN;
  }
  if (!cachedAccessToken) {
    cachedAccessToken = await ensureValidToken();
  }
  return cachedAccessToken;
}

async function ensureServerSession(): Promise<void> {
  // API token mode: server handles team directly from the token — no session needed
  if (ERASER_API_TOKEN) {
    return;
  }

  if (mcpSessionId) {
    return;
  }

  const accessToken = await getAccessToken();
  const initRequest: JsonRpcRequest = {
    jsonrpc: '2.0',
    id: 'stdio-init',
    method: 'initialize',
    params: {
      protocolVersion: '2025-11-25',
      capabilities: {},
      clientInfo: { name: 'eraser-mcp-stdio', version: '1.0.0' },
    },
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(initRequest),
  });

  if (response.status === 401) {
    // Our stored token was rejected — clear it so the next call triggers fresh OAuth.
    cachedAccessToken = null;
    invalidateCredentials();
    throw new Error(
      'Not authenticated with Eraser. Run `npx @eraserlabs/eraser-mcp login` to sign in.'
    );
  }

  if (!response.ok) {
    throw new Error(`Server initialize failed: ${response.status}`);
  }

  sessionInitError = null;
  const sessionHeader = response.headers.get('Mcp-Session-Id');
  if (sessionHeader) {
    mcpSessionId = sessionHeader;
  }
}

async function handleRequest(request: JsonRpcRequest): Promise<void> {
  const id = request.id ?? null;

  if (request.method === 'initialize') {
    // Respond to the local client with our capabilities
    sendResponse({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2025-11-25',
        capabilities: SERVER_CAPABILITIES,
        serverInfo: SERVER_INFO,
      },
    });

    // Proactively establish server session (so tools/call has a session ready).
    // Capture any auth error so tool calls can surface it immediately.
    try {
      await ensureServerSession();
      sessionInitError = null;
    } catch (err) {
      sessionInitError = err instanceof Error ? err.message : 'Authentication failed';
    }
    return;
  }

  if (request.method === 'notifications/initialized') {
    return;
  }

  if (request.method === 'tools/list') {
    // Proxy to the remote server so identity tools (whoami, listTeams, selectTeam)
    // defined server-side are included in the response.
    try {
      if (sessionInitError) {
        sendError(id, -32000, sessionInitError);
        return;
      }
      await ensureServerSession();
      const accessToken = await getAccessToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };
      if (mcpSessionId) {
        headers['Mcp-Session-Id'] = mcpSessionId;
      }
      const response = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        // Fall back to local tool list if server is unreachable
        sendResponse({ jsonrpc: '2.0', id, result: { tools: getToolsList() } });
        return;
      }
      const rpcResponse = (await response.json()) as JsonRpcResponse;
      sendResponse(rpcResponse);
    } catch {
      sendResponse({ jsonrpc: '2.0', id, result: { tools: getToolsList() } });
    }
    return;
  }

  if (request.method === 'tools/call') {
    try {
      // If initialize-time auth failed, surface that error immediately rather than
      // retrying with the same invalid token.
      if (sessionInitError) {
        sendError(id, -32000, sessionInitError);
        return;
      }

      await ensureServerSession();
      const accessToken = await getAccessToken();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };
      if (mcpSessionId) {
        headers['Mcp-Session-Id'] = mcpSessionId;
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      // Check for updated session token (e.g., after selectTeam)
      const newSessionId = response.headers.get('Mcp-Session-Id');
      if (newSessionId) {
        mcpSessionId = newSessionId;
      }

      if (response.status === 401) {
        // Token might be invalid/expired; clear OAuth cache and re-establish session.
        // In API token mode, the token is immutable — nothing to refresh.
        if (ERASER_API_TOKEN) {
          const text = await response.text();
          sendError(id, -32000, `API token rejected (HTTP 401): ${text}`);
          return;
        }
        cachedAccessToken = null;
        mcpSessionId = null;
        invalidateCredentials();

        await ensureServerSession();
        const newToken = await getAccessToken();

        const retryHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newToken}`,
        };
        if (mcpSessionId) {
          retryHeaders['Mcp-Session-Id'] = mcpSessionId;
        }

        const retryResponse = await fetch(API_URL, {
          method: 'POST',
          headers: retryHeaders,
          body: JSON.stringify(request),
        });

        const retrySessionId = retryResponse.headers.get('Mcp-Session-Id');
        if (retrySessionId) {
          mcpSessionId = retrySessionId;
        }

        if (!retryResponse.ok) {
          const text = await retryResponse.text();
          sendError(id, -32000, `HTTP ${retryResponse.status}: ${text}`);
          return;
        }

        const rpcResponse = (await retryResponse.json()) as JsonRpcResponse;
        await processAndSendResponse(rpcResponse, request);
        return;
      }

      if (!response.ok) {
        const text = await response.text();
        sendError(id, -32000, `HTTP ${response.status}: ${text}`);
        return;
      }

      const rpcResponse = (await response.json()) as JsonRpcResponse;
      await processAndSendResponse(rpcResponse, request);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      sendError(id, -32000, `Request failed: ${message}`);
    }
    return;
  }

  sendError(id, -32601, `Method not found: ${request.method}`);
}

async function processAndSendResponse(
  rpcResponse: JsonRpcResponse,
  request: JsonRpcRequest
): Promise<void> {
  if (rpcResponse.result) {
    const result = rpcResponse.result as { content?: Array<{ type: string; text: string }> };
    if (result.content?.[0]?.type === 'text' && result.content[0].text) {
      try {
        const renderResult = JSON.parse(result.content[0].text) as RenderResult;
        if (renderResult.imageUrl) {
          const params = request.params as { arguments?: { code?: string } } | undefined;
          const diagramCode = params?.arguments?.code;

          const localPath = await saveImageLocally(renderResult.imageUrl, diagramCode);
          if (localPath) {
            renderResult.localPath = localPath;
            result.content[0].text = JSON.stringify(renderResult);
          }
        }
      } catch {
        // If parsing fails, just return the original response
      }
    }
  }

  sendResponse(rpcResponse);
}

function runStdioServer(): void {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on('line', (line) => {
    if (!line.trim()) {
      return;
    }

    try {
      const request = JSON.parse(line) as JsonRpcRequest;

      if (request.jsonrpc !== '2.0' || typeof request.method !== 'string') {
        sendError(request.id ?? null, -32600, 'Invalid Request');
        return;
      }

      void handleRequest(request);
    } catch {
      sendError(null, -32700, 'Parse error');
    }
  });

  rl.on('close', () => {
    process.exit(0);
  });

  process.on('unhandledRejection', (error) => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    sendError(null, -32000, `Unhandled error: ${message}`);
  });
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'login':
      await performLogin();
      break;
    case 'logout':
      logout();
      break;
    case 'whoami':
      await whoami();
      break;
    default:
      // Default: run as MCP stdio server
      runStdioServer();
      break;
  }
}

main().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
