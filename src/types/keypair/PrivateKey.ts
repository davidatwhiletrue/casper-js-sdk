import { concat } from '@ethersproject/bytes';

import { PublicKey } from './PublicKey';
import { PrivateKey as Ed25519PrivateKey } from './ed25519/PrivateKey';
import { PrivateKey as Secp256k1PrivateKey } from './secp256k1/PrivateKey';

/**
 * Interface representing the structure of a private key, with methods for
 * obtaining the public key, signing messages, and exporting to PEM format.
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
 * Enum representing supported cryptographic key algorithms.
 */
enum KeyAlgorithm {
  ED25519,
  SECP256K1
}

/**
 * Represents a private key with associated public key and cryptographic algorithm.
 */
export class PrivateKey {
  /** The cryptographic algorithm used for the key. */
  private alg: KeyAlgorithm;

  /** The public key associated with this private key. */
  private pub: PublicKey;

  /** The internal private key implementation. */
  private priv: PrivateKeyInternal;

  /**
   * Creates an instance of PrivateKey.
   * @param alg - The cryptographic algorithm.
   * @param pub - The associated public key.
   * @param priv - The private key implementation.
   */
  constructor(alg: KeyAlgorithm, pub: PublicKey, priv: PrivateKeyInternal) {
    this.alg = alg;
    this.pub = pub;
    this.priv = priv;
  }

  /**
   * Gets the public key associated with this private key.
   * @returns The associated PublicKey instance.
   */
  public get publicKey(): PublicKey {
    return this.pub;
  }

  /**
   * Exports the private key to PEM format.
   * @returns A PEM-encoded string of the private key.
   */
  public toPem(): string {
    return this.priv.toPem();
  }

  /**
   * Signs a message using the private key and includes the algorithm byte in the signature.
   * @param msg - The message to sign.
   * @returns A promise resolving to the signature bytes with the algorithm byte.
   */
  public async sign(msg: Uint8Array): Promise<Uint8Array> {
    const signature = await this.priv.sign(msg);
    const algBytes = Uint8Array.of(this.alg);
    return concat([algBytes, signature]);
  }

  /**
   * Signs a message without including the algorithm byte.
   * @param msg - The message to sign.
   * @returns A promise resolving to the raw signature bytes.
   */
  public async rawSign(msg: Uint8Array): Promise<Uint8Array> {
    return this.priv.sign(msg);
  }

  /**
   * Generates a new private key with the specified algorithm.
   * @param algorithm - The cryptographic algorithm to use.
   * @returns A promise resolving to a new PrivateKey instance.
   */
  public static async generate(algorithm: KeyAlgorithm): Promise<PrivateKey> {
    const priv = await PrivateKeyFactory.createPrivateKey(algorithm);
    const pubBytes = await priv.publicKeyBytes();
    const algBytes = Uint8Array.of(algorithm);
    const pub = PublicKey.fromBuffer(concat([algBytes, pubBytes]));
    return new PrivateKey(algorithm, pub, priv);
  }

  /**
   * Creates a private key from a PEM-encoded string.
   * @param content - The PEM-encoded string.
   * @param algorithm - The cryptographic algorithm to use.
   * @returns A promise resolving to a PrivateKey instance.
   */
  public static async fromPem(
    content: string,
    algorithm: KeyAlgorithm
  ): Promise<PrivateKey> {
    const priv = await PrivateKeyFactory.createPrivateKeyFromPem(
      content,
      algorithm
    );
    const pubBytes = await priv.publicKeyBytes();
    const algBytes = Uint8Array.of(algorithm);
    const pub = PublicKey.fromBuffer(concat([algBytes, pubBytes]));
    return new PrivateKey(algorithm, pub, priv);
  }

  /**
   * Creates a private key from a hexadecimal string.
   * @param key - The hexadecimal string of the private key.
   * @param algorithm - The cryptographic algorithm to use.
   * @returns A promise resolving to a PrivateKey instance.
   */
  public static async fromHex(
    key: string,
    algorithm: KeyAlgorithm
  ): Promise<PrivateKey> {
    const priv = await PrivateKeyFactory.createPrivateKeyFromHex(
      key,
      algorithm
    );
    const pubBytes = await priv.publicKeyBytes();
    const algBytes = Uint8Array.of(algorithm);
    const pub = PublicKey.fromBuffer(concat([algBytes, pubBytes]));
    return new PrivateKey(algorithm, pub, priv);
  }
}

/**
 * Factory class for creating instances of PrivateKeyInternal using different formats and algorithms.
 */
class PrivateKeyFactory {
  /**
   * Creates a new private key using the specified algorithm.
   * @param algorithm - The cryptographic algorithm to use.
   * @returns A promise resolving to a PrivateKeyInternal instance.
   * @throws Error if the algorithm is unsupported.
   */
  public static async createPrivateKey(
    algorithm: KeyAlgorithm
  ): Promise<PrivateKeyInternal> {
    switch (algorithm) {
      case KeyAlgorithm.ED25519:
        return Ed25519PrivateKey.generate();
      case KeyAlgorithm.SECP256K1:
        return Secp256k1PrivateKey.generate();
      default:
        throw new Error(`Unsupported key algorithm: ${algorithm}`);
    }
  }

  /**
   * Creates a PrivateKeyInternal instance from a PEM-encoded string.
   * @param content - The PEM-encoded string.
   * @param algorithm - The cryptographic algorithm to use.
   * @returns A promise resolving to a PrivateKeyInternal instance.
   * @throws Error if the algorithm is unsupported.
   */
  public static async createPrivateKeyFromPem(
    content: string,
    algorithm: KeyAlgorithm
  ): Promise<PrivateKeyInternal> {
    switch (algorithm) {
      case KeyAlgorithm.ED25519:
        return Ed25519PrivateKey.fromPem(content);
      case KeyAlgorithm.SECP256K1:
        return Secp256k1PrivateKey.fromPem(content);
      default:
        throw new Error(`Unsupported key algorithm: ${algorithm}`);
    }
  }

  /**
   * Creates a PrivateKeyInternal instance from a hexadecimal string.
   * @param key - The hexadecimal string of the private key.
   * @param algorithm - The cryptographic algorithm to use.
   * @returns A promise resolving to a PrivateKeyInternal instance.
   * @throws Error if the algorithm is unsupported.
   */
  public static async createPrivateKeyFromHex(
    key: string,
    algorithm: KeyAlgorithm
  ): Promise<PrivateKeyInternal> {
    switch (algorithm) {
      case KeyAlgorithm.ED25519:
        return Ed25519PrivateKey.fromHex(key);
      case KeyAlgorithm.SECP256K1:
        return Secp256k1PrivateKey.fromHex(key);
      default:
        throw new Error(`Unsupported key algorithm: ${algorithm}`);
    }
  }
}
