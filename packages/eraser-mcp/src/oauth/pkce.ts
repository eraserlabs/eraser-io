import * as crypto from 'crypto';
import type { PKCEPair } from './types';

export function generatePKCE(): PKCEPair {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  return { codeVerifier, codeChallenge };
}
