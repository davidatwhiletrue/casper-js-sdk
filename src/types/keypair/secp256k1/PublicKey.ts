import * as secp256k1 from '@noble/secp256k1';
import { sha256 } from '@noble/hashes/sha256';

/** The expected size of a secp256k1 public key in bytes. */
const PublicKeySize = 33;

/**
 * Represents a secp256k1 public key, providing methods to retrieve bytes
 * and verify signatures.
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
   * Retrieves the byte array of the public key in compressed format.
   * @returns A compressed `Uint8Array` representation of the public key.
   */
  bytes(): Uint8Array {
    return secp256k1.Point.fromHex(this.key).toRawBytes(true);
  }

  /**
   * Verifies a signature for a given message.
   * @param message - The message that was signed.
   * @param signature - The signature to verify.
   * @returns A promise that resolves to `true` if the signature is valid, or `false` otherwise.
   */
  async verifySignature(
    message: Uint8Array,
    signature: Uint8Array
  ): Promise<boolean> {
    let compactSignature: Uint8Array;

    if (signature.length === 64) {
      // Use raw (R || S) format
      compactSignature = signature;
    } else {
      try {
        const parsedSig = secp256k1.Signature.fromDER(signature);
        compactSignature = parsedSig.toCompactRawBytes();
      } catch (error) {
        console.error('Failed to parse DER signature:', error);
        return false;
      }
    }

    const hash = sha256(message);

    return secp256k1.verify(compactSignature, hash, this.key);
  }

  /**
   * Creates a PublicKey instance from a byte array.
   * @param data - The byte array representing the public key.
   * @returns A promise that resolves to a new PublicKey instance.
   * @throws Error if the public key size is incorrect or if the key is invalid.
   */
  static async fromBytes(data: Uint8Array): Promise<PublicKey> {
    if (data.length !== PublicKeySize) {
      throw new Error(`Can't parse public key with wrong size: ${data.length}`);
    }

    let key;
    try {
      const point = secp256k1.Point.fromHex(data);
      const compressedKey = point.toRawBytes(true);
      key = compressedKey;
    } catch (error) {
      throw new Error('Invalid public key');
    }

    return new PublicKey(key);
  }
}
