import * as ed25519 from '@noble/ed25519';
import { PrivateKeyInternal } from "../PrivateKey";

/**
 * Represents an Ed25519 private key, supporting key generation, signing, and PEM encoding.
 * Provides methods for creating instances from byte arrays, hexadecimal strings, and PEM format.
 */
export class PrivateKey implements PrivateKeyInternal {
  /** Size of the PEM prefix for Ed25519 private keys. */
  static PemFramePrivateKeyPrefixSize = 16;

  /** The raw bytes of the private key. */
  private key: Uint8Array;

  /**
   * Creates an instance of PrivateKey.
   * @param key - The private key bytes.
   */
  constructor(key: Uint8Array) {
    this.key = key;
  }

  /**
   * Generates a new random Ed25519 private key.
   * @returns A promise that resolves to a new PrivateKey instance.
   */
  static async generate(): Promise<PrivateKey> {
    const keyPair = ed25519.utils.randomPrivateKey();
    return new PrivateKey(keyPair);
  }

  /**
   * Retrieves the byte array of the associated public key.
   * @returns A promise that resolves to the public key bytes.
   */
  async publicKeyBytes(): Promise<Uint8Array> {
    return ed25519.getPublicKey(this.key);
  }

  toBytes(): Uint8Array {
    return this.key;
  }

  /**
   * Signs a message using the private key.
   * @param message - The message to sign.
   * @returns A promise that resolves to the signature bytes.
   */
  async sign(message: Uint8Array): Promise<Uint8Array> {
    return ed25519.sign(message, this.key);
  }

  /**
   * Creates a PrivateKey instance from a byte array.
   * Validates that the byte array matches the expected length for an Ed25519 private key.
   * @param key - The byte array representing the private key.
   * @returns A new PrivateKey instance.
   * @throws Error if the byte array length is not 64.
   */
  static fromBytes(key: Uint8Array): PrivateKey {
    if (key.length !== 64) {
      throw new Error(`Invalid key size: expected 64 bytes, got ${key.length}`);
    }
    return new PrivateKey(key);
  }

  /**
   * Creates a PrivateKey instance from a hexadecimal string.
   * Converts the hexadecimal string to bytes and validates the length.
   * @param keyHex - The hexadecimal string representing the private key.
   * @returns A new PrivateKey instance.
   * @throws Error if the hex string length is not 128 characters.
   */
  static fromHex(keyHex: string): PrivateKey {
    if (keyHex.length !== 128) {
      throw new Error(
        `Invalid hex string length: expected 128 characters, got ${keyHex.length}`
      );
    }
    const keyBytes = Buffer.from(keyHex, 'hex');
    return PrivateKey.fromBytes(keyBytes);
  }

  /**
   * Exports the private key to PEM format, with a standardized prefix and suffix.
   * @returns A PEM-encoded string of the private key.
   */
  toPem(): string {
    const seed = this.key.slice(0, 32);

    const prefix = Buffer.alloc(PrivateKey.PemFramePrivateKeyPrefixSize);
    const fullKey = Buffer.concat([prefix, Buffer.from(seed)]);

    const pemString = fullKey.toString('base64');
    return `-----BEGIN PRIVATE KEY-----\n${pemString}\n-----END PRIVATE KEY-----`;
  }

  /**
   * Creates a PrivateKey instance from a PEM-encoded string.
   * Parses the PEM content to extract the private key bytes.
   * @param content - The PEM string representing the private key.
   * @returns A new PrivateKey instance.
   * @throws Error if the content cannot be properly parsed.
   */
  static fromPem(content: string): PrivateKey {
    const base64Content = content
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\n/g, '');
    const fullKey = Buffer.from(base64Content, 'base64');

    const data = fullKey.slice(PrivateKey.PemFramePrivateKeyPrefixSize);

    const seed = data.slice(-32);
    const privateEdDSA = ed25519.utils.randomPrivateKey();
    privateEdDSA.set(seed);

    return new PrivateKey(privateEdDSA);
  }
}
