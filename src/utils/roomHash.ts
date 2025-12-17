/**
 * Utility functions to encode and decode room IDs for URL security
 * This prevents exposing sequential database IDs in URLs
 * Uses base64url encoding with a simple XOR obfuscation
 */

// Simple obfuscation key (in production, use env variable)
const OBFUSCATION_KEY = 0x5A3C; // Random number for XOR

/**
 * Encodes a room ID into a URL-safe string
 * @param roomId - The numeric room ID
 * @returns A URL-safe encoded string
 */
export function encodeRoomId(roomId: number): string {
  // XOR with obfuscation key for simple scrambling
  const obfuscated = roomId ^ OBFUSCATION_KEY;

  // Convert to base36 for shorter URLs
  const encoded = obfuscated.toString(36);

  return encoded;
}

/**
 * Decodes a URL-safe string back to a room ID
 * @param encoded - The encoded string
 * @returns The room ID or null if invalid
 */
export function decodeRoomId(encoded: string): number | null {
  try {
    // Parse from base36
    const obfuscated = parseInt(encoded, 36);

    if (isNaN(obfuscated)) {
      return null;
    }

    // XOR again to get original (XOR is reversible)
    const roomId = obfuscated ^ OBFUSCATION_KEY;

    return roomId;
  } catch (e) {
    return null;
  }
}

/**
 * Legacy function for compatibility - maps to encodeRoomId
 * @deprecated Use encodeRoomId instead
 */
export function registerRoomHash(roomId: number): string {
  return encodeRoomId(roomId);
}

/**
 * Legacy function for compatibility - maps to decodeRoomId
 * @deprecated Use decodeRoomId instead
 */
export function getRoomIdFromHash(hash: string): number | null {
  return decodeRoomId(hash);
}

/**
 * Clears the hash mapping cache (no-op for backwards compatibility)
 * @deprecated No longer needed with XOR encoding
 */
export function clearHashCache(): void {
  // No-op - not needed with reversible encoding
}

/**
 * Registers multiple rooms at once (no-op for backwards compatibility)
 * @deprecated No longer needed with XOR encoding
 */
export function registerMultipleRooms(_roomIds: number[]): void {
  // No-op - not needed with reversible encoding
}
