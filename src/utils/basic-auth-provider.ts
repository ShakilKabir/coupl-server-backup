export function createBasicAuth(): { Authorization: string } {
    const username = process.env.TREASURY_PRIME_API_KEY_ID;
    const password = process.env.TREASURY_PRIME_API_SECRET_KEY;
    const basicAuth = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  
    return { Authorization: basicAuth };
  }