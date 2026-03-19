import * as http from 'http';
import { URL } from 'url';
import { CALLBACK_PORT } from './config';

/** Escape user-controlled OAuth error strings before embedding in HTML. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const SUCCESS_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Eraser MCP - Authorization Complete</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: #f6f6f6;
    }
    .container {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 { color: #2a2b2b; margin-bottom: 16px; }
    p { color: #666; }
    .checkmark { font-size: 48px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="checkmark">✓</div>
    <h1>Authorization Complete</h1>
    <p>You can close this window and return to your terminal.</p>
  </div>
</body>
</html>
`;

const ERROR_HTML = (rawMessage: string) => {
  const message = escapeHtml(rawMessage);
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Eraser MCP - Authorization Failed</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: #f6f6f6;
    }
    .container {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 { color: #e72f6e; margin-bottom: 16px; }
    p { color: #666; }
    .error-icon { font-size: 48px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="error-icon">✗</div>
    <h1>Authorization Failed</h1>
    <p>${message}</p>
  </div>
</body>
</html>
`;
};

export interface CallbackResult {
  code: string;
  state: string;
}

export function startCallbackServer(expectedState: string): Promise<CallbackResult> {
  return new Promise((resolve, reject) => {
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
        timeoutHandle = null;
      }
    };

    const server = http.createServer((req, res) => {
      const url = new URL(req.url || '/', `http://127.0.0.1:${CALLBACK_PORT}`);

      if (url.pathname !== '/callback') {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');

      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(ERROR_HTML(errorDescription || error));
        server.close();
        cleanup();
        reject(new Error(errorDescription || error));
        return;
      }

      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(ERROR_HTML('Missing authorization code'));
        server.close();
        cleanup();
        reject(new Error('Missing authorization code'));
        return;
      }

      if (state !== expectedState) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(ERROR_HTML('Invalid state parameter'));
        server.close();
        cleanup();
        reject(new Error('Invalid state parameter - possible CSRF attack'));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(SUCCESS_HTML);
      server.close();
      cleanup();
      resolve({ code, state });
    });

    server.on('error', (err) => {
      cleanup();
      reject(new Error(`Failed to start callback server: ${err.message}`));
    });

    server.listen(CALLBACK_PORT, '127.0.0.1', () => {
      // Server is listening
    });

    // Timeout after 5 minutes
    timeoutHandle = setTimeout(() => {
      server.close();
      reject(new Error('Authorization timed out'));
    }, 5 * 60 * 1000);
  });
}
