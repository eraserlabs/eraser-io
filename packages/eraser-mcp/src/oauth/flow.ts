import * as crypto from 'crypto';
import { DEFAULT_OAUTH_CONFIG, CALLBACK_PORT } from './config';
import { generatePKCE } from './pkce';
import { startCallbackServer } from './callback-server';
import {
  loadCredentials,
  saveCredentials,
  clearCredentials,
  isTokenExpired,
} from './token-storage';
import type { StoredCredentials, TokenResponse } from './types';

/** The API URL used for scoping stored credentials. */
const CREDENTIAL_KEY = DEFAULT_OAUTH_CONFIG.resource;

function openBrowser(url: string): void {
  const { exec } = require('child_process');
  const platform = process.platform;

  let command: string;
  if (platform === 'darwin') {
    command = `open "${url}"`;
  } else if (platform === 'win32') {
    command = `start "" "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }

  exec(command, (err: Error | null) => {
    if (err) {
      console.error(`Failed to open browser: ${err.message}`);
      console.error(`Please open this URL manually:\n${url}`);
    }
  });
}

async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    code_verifier: codeVerifier,
    client_id: DEFAULT_OAUTH_CONFIG.clientId,
    redirect_uri: DEFAULT_OAUTH_CONFIG.redirectUri,
    resource: DEFAULT_OAUTH_CONFIG.resource,
  });

  const response = await fetch(DEFAULT_OAUTH_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${text}`);
  }

  return (await response.json()) as TokenResponse;
}

async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: DEFAULT_OAUTH_CONFIG.clientId,
    resource: DEFAULT_OAUTH_CONFIG.resource,
  });

  const response = await fetch(DEFAULT_OAUTH_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  return (await response.json()) as TokenResponse;
}

export async function performLogin(): Promise<StoredCredentials> {
  const { codeVerifier, codeChallenge } = generatePKCE();
  const state = crypto.randomBytes(16).toString('hex');

  const authUrl = new URL(DEFAULT_OAUTH_CONFIG.authorizationEndpoint);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', DEFAULT_OAUTH_CONFIG.clientId);
  authUrl.searchParams.set('redirect_uri', DEFAULT_OAUTH_CONFIG.redirectUri);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('scope', DEFAULT_OAUTH_CONFIG.scopes.join(' '));
  authUrl.searchParams.set('resource', DEFAULT_OAUTH_CONFIG.resource);
  authUrl.searchParams.set('state', state);

  console.error(`Opening browser for authentication...`);
  console.error(`If the browser doesn't open, visit:\n${authUrl.toString()}\n`);

  // Start the callback server before opening the browser
  const callbackPromise = startCallbackServer(state);

  // Open browser
  openBrowser(authUrl.toString());

  // Wait for callback
  const { code } = await callbackPromise;

  console.error('Exchanging authorization code for tokens...');
  const tokens = await exchangeCodeForTokens(code, codeVerifier);

  const credentials: StoredCredentials = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
    scope: tokens.scope,
  };

  saveCredentials(credentials, CREDENTIAL_KEY);
  console.error('Login successful! Credentials saved.\n');

  return credentials;
}

export async function ensureValidToken(): Promise<string> {
  let credentials = loadCredentials(CREDENTIAL_KEY);

  if (!credentials) {
    credentials = await performLogin();
    return credentials.accessToken;
  }

  if (isTokenExpired(credentials)) {
    try {
      console.error('Refreshing access token...');
      const tokens = await refreshAccessToken(credentials.refreshToken);

      credentials = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + tokens.expires_in * 1000,
        scope: tokens.scope,
      };

      saveCredentials(credentials, CREDENTIAL_KEY);
    } catch {
      console.error('Token refresh failed, initiating new login...');
      clearCredentials(CREDENTIAL_KEY);
      credentials = await performLogin();
    }
  }

  return credentials.accessToken;
}

/**
 * After the API returns 401, try refresh_token before wiping credentials or
 * opening the browser. Use this instead of invalidateCredentials() + ensureValidToken()
 * so refresh_token in ~/.eraser/ is preserved until refresh actually fails.
 */
export async function recoverAuthAfter401(): Promise<string> {
  const credentials = loadCredentials(CREDENTIAL_KEY);

  if (!credentials) {
    const loggedIn = await performLogin();
    return loggedIn.accessToken;
  }

  try {
    console.error('Refreshing access token (server rejected previous access token)...');
    const tokens = await refreshAccessToken(credentials.refreshToken);
    const updated: StoredCredentials = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
      scope: tokens.scope,
    };
    saveCredentials(updated, CREDENTIAL_KEY);
    return updated.accessToken;
  } catch {
    console.error('Token refresh failed after 401, clearing credentials and re-authenticating...');
    clearCredentials(CREDENTIAL_KEY);
    const loggedIn = await performLogin();
    return loggedIn.accessToken;
  }
}

/**
 * Clears stored OAuth credentials (e.g. explicit logout). Prefer recoverAuthAfter401
 * when the server returns 401 so refresh_token can be used first.
 */
export function invalidateCredentials(): void {
  clearCredentials(CREDENTIAL_KEY);
}

export function logout(): void {
  clearCredentials(CREDENTIAL_KEY);
  console.error('Logged out successfully.\n');
}

export async function whoami(): Promise<void> {
  const credentials = loadCredentials(CREDENTIAL_KEY);

  if (!credentials) {
    console.error('Not logged in. Run `eraser-mcp login` to authenticate.\n');
    return;
  }

  if (isTokenExpired(credentials)) {
    console.error('Token expired. Run `eraser-mcp login` to re-authenticate.\n');
    return;
  }

  console.error('Logged in to Eraser MCP.');
  console.error(`Scopes: ${credentials.scope}`);
  console.error(`Token expires: ${new Date(credentials.expiresAt).toLocaleString()}\n`);
}
