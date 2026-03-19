import type { OAuthConfig } from './types';

const BASE_URL = process.env.ERASER_API_URL?.replace('/api/mcp', '') || 'https://app.eraser.io';

export const DEFAULT_OAUTH_CONFIG: OAuthConfig = {
  authorizationEndpoint: `${BASE_URL}/api/oauth/authorize`,
  tokenEndpoint: `${BASE_URL}/api/oauth/token`,
  clientId: 'eraser-mcp-cli',
  redirectUri: 'http://127.0.0.1:9876/callback',
  scopes: ['mcp:read', 'mcp:write', 'mcp:generate', 'mcp:render'],
  resource: `${BASE_URL}/api/mcp`,
};

export const CALLBACK_PORT = 9876;
