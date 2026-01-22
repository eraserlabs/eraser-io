#!/usr/bin/env node
/**
 * Eraser MCP stdio adapter
 *
 * This adapter allows MCP clients (like Cursor, Claude Desktop) to communicate
 * with the Eraser API via stdio transport.
 *
 * Usage:
 *   ERASER_API_TOKEN=your-token npx @eraserlabs/eraser-mcp
 *
 * Or configure in .cursor/mcp.json:
 *   {
 *     "mcpServers": {
 *       "eraser": {
 *         "command": "npx",
 *         "args": ["@eraserlabs/eraser-mcp"],
 *         "env": { "ERASER_API_TOKEN": "your-token" }
 *       }
 *     }
 *   }
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { mcpTools } from './tools';

const API_URL = process.env.ERASER_API_URL || 'https://app.eraser.io/api/mcp';
const ERASER_OUTPUT_DIR = process.env.ERASER_OUTPUT_DIR || '.eraser/scratchpad';
const API_TOKEN = process.env.ERASER_API_TOKEN;

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

// Server capabilities and info for MCP handshake
const SERVER_INFO = {
  name: 'eraser-mcp',
  version: '1.0.0',
};

const SERVER_CAPABILITIES = {
  tools: {},
};

// Convert mcpTools to MCP tool list format
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

/**
 * Extracts the title from diagram code (looks for a line starting with "title ").
 * Normalizes it to a valid filename.
 */
function extractTitleFromCode(code: string | undefined): string | undefined {
  if (!code) {
    return undefined;
  }

  const lines = code.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().startsWith('title ')) {
      const title = trimmed.slice(6).trim(); // Remove "title " prefix
      // Normalize to filename: lowercase, replace spaces/special chars with hyphens
      return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens
    }
  }
  return undefined;
}

/**
 * Downloads an image from a URL and saves it locally.
 * Returns the local file path if successful, undefined otherwise.
 */
async function saveImageLocally(
  imageUrl: string,
  diagramCode?: string
): Promise<string | undefined> {
  try {
    const outputDir = path.resolve(process.cwd(), ERASER_OUTPUT_DIR);

    // Ensure output directory exists
    await fs.promises.mkdir(outputDir, { recursive: true });

    // Generate filename from title or timestamp
    const title = extractTitleFromCode(diagramCode);
    const timestamp = Date.now();
    const filename = title ? `${title}-${timestamp}.png` : `diagram-${timestamp}.png`;
    const localPath = path.join(outputDir, filename);

    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return undefined;
    }

    // Save to disk
    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.promises.writeFile(localPath, buffer);

    return localPath;
  } catch {
    // Silently fail - local saving is a nice-to-have
    return undefined;
  }
}

async function handleRequest(request: JsonRpcRequest): Promise<void> {
  const id = request.id ?? null;

  // Handle MCP protocol methods locally
  if (request.method === 'initialize') {
    sendResponse({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: SERVER_CAPABILITIES,
        serverInfo: SERVER_INFO,
      },
    });
    return;
  }

  if (request.method === 'notifications/initialized') {
    // This is a notification, no response needed
    return;
  }

  if (request.method === 'tools/list') {
    sendResponse({
      jsonrpc: '2.0',
      id,
      result: {
        tools: getToolsList(),
      },
    });
    return;
  }

  // For tools/call, forward to the API
  if (request.method === 'tools/call') {
    if (!API_TOKEN) {
      sendError(id, -32000, 'ERASER_API_TOKEN environment variable is required');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const text = await response.text();
        sendError(id, -32000, `HTTP ${response.status}: ${text}`);
        return;
      }

      const rpcResponse = (await response.json()) as JsonRpcResponse;

      // Try to save the image locally if there's an imageUrl in the result
      if (rpcResponse.result) {
        const result = rpcResponse.result as { content?: Array<{ type: string; text: string }> };
        if (result.content?.[0]?.type === 'text' && result.content[0].text) {
          try {
            const renderResult = JSON.parse(result.content[0].text) as RenderResult;
            if (renderResult.imageUrl) {
              // Extract diagram code from request params for title extraction
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      sendError(id, -32000, `Request failed: ${message}`);
    }
    return;
  }

  // Unknown method
  sendError(id, -32601, `Method not found: ${request.method}`);
}

function main(): void {
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

  // Prevent unhandled promise rejections from crashing
  process.on('unhandledRejection', (error) => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    sendError(null, -32000, `Unhandled error: ${message}`);
  });
}

main();
