import 'server-only';

/**
 * Verifies the Authorization header against the stored API key.
 * @param authHeader The value of the Authorization header.
 * @returns `true` if the key is valid, `false` otherwise.
 */
export async function verifyApiKey(authHeader: string | undefined): Promise<boolean> {
  const validKey = process.env.STATUS_API_KEY;

  // 1. Ensure the API key is configured on the server
  if (!validKey || validKey.includes('your-secret-api-key-here')) {
    console.error('CRITICAL: STATUS_API_KEY environment variable is not set or is a placeholder.');
    return false;
  }
  
  // 2. Ensure the header exists and is in the correct format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  // 3. Extract and compare the token
  const token = authHeader.replace('Bearer ', '');
  return token === validKey;
}
