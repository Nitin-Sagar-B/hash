/**
 * Hash a PIN string using SHA-256 via Web Crypto API
 * @param {string} pin - The PIN to hash
 * @returns {Promise<string>} - Hex string of the SHA-256 hash
 */
export async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a PIN against a stored hash
 * @param {string} pin - The PIN to verify
 * @param {string} storedHash - The stored SHA-256 hash to compare against
 * @returns {Promise<boolean>} - True if the PIN matches
 */
export async function verifyPin(pin, storedHash) {
  const inputHash = await hashPin(pin);
  return inputHash === storedHash;
}
