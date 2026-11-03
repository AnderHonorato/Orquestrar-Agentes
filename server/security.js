import { createHash, timingSafeEqual } from 'node:crypto';
export function isAuthorized(headers, configuredToken = process.env.STUDIO_ACCESS_TOKEN) {
  if (typeof configuredToken !== 'string' || configuredToken.length < 16) return false;
  const candidate = headers['x-studio-token'];
  if (typeof candidate !== 'string' || candidate.length > 512) return false;
  const hash = value => createHash('sha256').update(value).digest();
  return timingSafeEqual(hash(candidate), hash(configuredToken));
}
export function isSameOrigin(headers) {
  if (!headers.origin) return true;
  try {
    const origin = new URL(headers.origin);
    return ['http:', 'https:'].includes(origin.protocol) && origin.host === headers.host;
  } catch { return false; }
}
export function publicAccessStatus() {
  return process.env.STUDIO_ACCESS_TOKEN?.length >= 16 ? 'protegido' : 'somente-leitura';
}