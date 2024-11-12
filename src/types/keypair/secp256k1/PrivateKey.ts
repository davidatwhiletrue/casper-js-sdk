import * as secp256k1 from '@noble/secp256k1';
import { sha256 } from '@noble/hashes/sha256';

/** PEM prefix for a private key. */
const PemPrivateKeyPrefix = '-----BEGIN PRIVATE KEY-----';

/** PEM suffix for a private key. */
const PemPrivateKeySuffix = '-----END PRIVATE KEY-----';

/**
 * Interface representing the structure and methods of a private key, including
 * functions to retrieve public key bytes, sign messages, and export to PEM format.
 */
interface PrivateKeyInternal {
  /** Retrieves the public key bytes. */
  publicKeyBytes(): Promise<Uint8Array>;

  /**
   * Signs a message using the private key.
   * @param message - The message to sign.
   * @returns A promise resolving to the signature bytes.
   */
  sign(message: Uint8Array): Promise<Uint8Array>;

  /** Converts the private key to PEM format. */
  toPem(): string;
}

/**
 * Represents a secp256k1 private key, supporting generation, signing, and PEM encoding.
 */
export class PrivateKey implements PrivateKeyInternal {
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
   * Generates a new random secp256k1 private key.
   * @returns A promise that resolves to a new PrivateKey instance.
   */
  static async generate(): Promise<PrivateKey> {
    const privateKey = secp256k1.utils.randomPrivateKey();
    return new PrivateKey(privateKey);
  }

  /**
   * Retrieves the byte array of the public key in compressed format.
   * @returns A promise that resolves to the compressed public key bytes.
   */
  async publicKeyBytes(): Promise<Uint8Array> {
    return secp256k1.getPublicKey(this.key, true);
  }

  /**
   * Retrieves the byte array of the public key in compressed format.
   * @returns A promise that resolves to the compressed public key bytes.
   */
  async getPublicKeyBytes(): Promise<Uint8Array> {
    return secp256k1.getPublicKey(this.key, true);
  }

  /**
   * Signs a message using the private key.
   * @param message - The message to sign.
   * @returns A promise that resolves to the signature bytes in compact format.
   */
  async sign(message: Uint8Array): Promise<Uint8Array> {
    const hash = sha256(message);
    return await secp256k1.sign(hash, this.key, { der: false });
  }

  /**
   * Creates a PrivateKey instance from a byte array.
   * @param key - The byte array representing the private key.
   * @returns A new PrivateKey instance.
   * @throws Error if the byte array length is not 32.
   */
  static fromBytes(key: Uint8Array): PrivateKey {
    if (key.length !== 32) {
      throw new Error(
        `Invalid private key length: expected 32 bytes, got ${key.length}`
      );
    }
    return new PrivateKey(key);
  }

  /**
   * Creates a PrivateKey instance from a hexadecimal string.
   * @param key - The hexadecimal string representing the private key.
   * @returns A new PrivateKey instance.
   * @throws Error if the hex length is not 64 characters or if decoding fails.
   */
  static fromHex(key: string): PrivateKey {
    if (key.length !== 64) {
      throw new Error(
        `Invalid private key hex length: expected 64 characters, got ${key.length}`
      );
    }

    let decoded;
    try {
      decoded = secp256k1.utils.hexToBytes(key);
    } catch (err) {
      throw new Error(`Failed to decode hex: ${err}`);
    }

    return PrivateKey.fromBytes(decoded);
  }

  /**
   * Exports the private key to PEM format.
   * @returns A PEM-encoded string of the private key.
   */
  toPem(): string {
    const keyBase64 = Buffer.from(this.key).toString('base64');
    return `${PemPrivateKeyPrefix}\n${keyBase64}\n${PemPrivateKeySuffix}`;
  }

  /**
   * Creates a PrivateKey instance from a PEM-encoded string.
   * @param content - The PEM string representing the private key.
   * @returns A new PrivateKey instance.
   * @throws Error if the content cannot be properly parsed.
   */
  static fromPem(content: string): PrivateKey {
    const base64Key = content
      .replace(PemPrivateKeyPrefix, '')
      .replace(PemPrivateKeySuffix, '')
      .replace(/\s+/g, '');
    const keyBuffer = Buffer.from(base64Key, 'base64');
    return new PrivateKey(new Uint8Array(keyBuffer));
  }
}
