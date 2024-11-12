import * as ed25519 from '@noble/ed25519';

/** Expected size of an Ed25519 public key in bytes. */
const PublicKeySize = 32;

/**
 * Represents an Ed25519 public key, supporting signature verification
 * and loading from byte arrays or PEM files.
 */
export class PublicKey {
  /** The raw bytes of the public key. */
  private key: Uint8Array;

  /**
   * Creates an instance of PublicKey.
   * @param key - The public key bytes.
   */
  constructor(key: Uint8Array) {
    this.key = key;
  }

  /**
   * Retrieves the byte array of the public key.
   * @returns A `Uint8Array` representing the public key.
   */
  bytes(): Uint8Array {
    return this.key;
  }

  /**
   * Verifies a signature for a given message.
   * @param message - The message that was signed.
   * @param signature - The signature to verify.
   * @returns A promise that resolves to `true` if the signature is valid, or `false` otherwise.
   */
  verifySignature(
    message: Uint8Array,
    signature: Uint8Array
  ): Promise<boolean> {
    return ed25519.verify(signature, message, this.key);
  }

  /**
   * Creates a PublicKey instance from a byte array.
   * @param data - The byte array representing the public key.
   * @returns A new PublicKey instance.
   * @throws Error if the byte array length is not equal to `PublicKeySize`.
   */
  static fromBytes(data: Uint8Array): PublicKey {
    if (data.length !== PublicKeySize) {
      throw new Error(`Can't parse wrong size of public key: ${data.length}`);
    }
    return new PublicKey(data);
  }
}
