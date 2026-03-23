import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import type { StoredCredentials } from './types';

const CREDENTIALS_DIR = path.join(os.homedir(), '.eraser');

/**
 * Returns a credentials file path scoped to the given API base URL so that
 * production, staging, and local-dev tokens never overwrite each other.
 */
function credentialsFilePath(apiUrl: string): string {
  const hash = crypto.createHash('sha256').update(apiUrl).digest('hex').slice(0, 12);
  return path.join(CREDENTIALS_DIR, `credentials-${hash}.json`);
}

export function loadCredentials(apiUrl: string): StoredCredentials | null {
  try {
    const file = credentialsFilePath(apiUrl);
    if (!fs.existsSync(file)) {
      return null;
    }
    const data = fs.readFileSync(file, 'utf-8');
    return JSON.parse(data) as StoredCredentials;
  } catch {
    return null;
  }
}

export function saveCredentials(credentials: StoredCredentials, apiUrl: string): void {
  fs.mkdirSync(CREDENTIALS_DIR, { recursive: true });
  fs.writeFileSync(credentialsFilePath(apiUrl), JSON.stringify(credentials, null, 2), {
    mode: 0o600,
  });
}

export function clearCredentials(apiUrl: string): void {
  try {
    fs.unlinkSync(credentialsFilePath(apiUrl));
  } catch {
    // File doesn't exist, that's fine
  }
}

export function isTokenExpired(credentials: StoredCredentials): boolean {
  // Consider expired if less than 5 minutes remaining
  return Date.now() > credentials.expiresAt - 5 * 60 * 1000;
}
