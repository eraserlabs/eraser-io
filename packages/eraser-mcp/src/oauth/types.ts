export interface OAuthConfig {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  resource: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface StoredCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string;
}

export interface PKCEPair {
  codeVerifier: string;
  codeChallenge: string;
}
