import { jsonObject, jsonMember } from 'typedjson';
import { Buffer } from 'buffer';
import { concat } from '@ethersproject/bytes';

import { PublicKey as Ed25519PublicKey } from './ed25519/PublicKey';
import { PublicKey as Secp256k1PublicKey } from './secp256k1/PublicKey';
import { Hash, AccountHash } from '../key';
import { Conversions } from '../Conversions';
import { IResultWithBytes } from '../clvalue';
import { byteHash } from '../ByteConverters';

/** Error thrown when the signature is empty. */
const ErrEmptySignature = new Error('empty signature');

/** Error thrown when the public key algorithm is invalid. */
const ErrInvalidPublicKeyAlgo = new Error('invalid public key algorithm');

/** Error thrown when the signature is invalid. */
const ErrInvalidSignature = new Error('invalid signature');

/** Error thrown when the public key is empty. */
const ErrEmptyPublicKey = new Error('empty public key');

/**
 * Enum representing the supported cryptographic algorithms for public keys.
 */
enum KeyAlgorithm {
  ED25519 = 1,
  SECP256K1 = 2
}

/**
 * Interface representing the internal structure of a public key, which includes
 * methods for obtaining bytes and verifying signatures.
 */
interface PublicKeyInternal {
  /** Returns the bytes of the public key. */
  bytes(): Uint8Array;

  /**
   * Verifies a signature for a given message.
   * @param message - The message to verify.
   * @param sig - The signature to verify.
   * @returns A promise that resolves to a boolean indicating the validity of the signature.
   */
  verifySignature(message: Uint8Array, sig: Uint8Array): Promise<boolean>;
}

/**
 * Represents a public key with a cryptographic algorithm and key data.
 * Provides utilities for serialization, verification, and obtaining an associated account hash.
 */
@jsonObject
export class PublicKey {
  /** The cryptographic algorithm used for the key. */
  @jsonMember({ constructor: Number })
  cryptoAlg: KeyAlgorithm;

  /** The key data associated with the public key. */
  key: PublicKeyInternal | null;

  /**
   * Creates an instance of PublicKey.
   * @param cryptoAlg - The cryptographic algorithm used by the key.
   * @param key - The actual key data.
   */
  constructor(cryptoAlg: KeyAlgorithm, key: PublicKeyInternal) {
    this.cryptoAlg = cryptoAlg;
    this.key = key;
  }

  /**
   * Returns the byte representation of the public key.
   * @returns A Uint8Array of the public key bytes.
   */
  bytes(): Uint8Array {
    if (!this.key) {
      return new Uint8Array();
    }

    const cryptoAlgBytes = new Uint8Array([this.cryptoAlg]);
    const keyBytes = this.key.bytes();

    return concat([cryptoAlgBytes, keyBytes]);
  }

  /**
   * Converts the public key to a hexadecimal string.
   * @returns A hex string representation of the public key.
   */
  toHex(): string {
    const bytes = this.bytes();
    return Conversions.encodeBase16(bytes);
  }

  /**
   * Serializes the public key to a JSON-compatible string.
   * @returns A JSON string representation of the public key.
   */
  toJSON(): string {
    return this.toHex();
  }

  /**
   * Converts the public key to a string representation.
   * @returns A string representation of the public key in hexadecimal.
   */
  toString(): string {
    return this.toHex();
  }

  /**
   * Creates a PublicKey instance from a JSON string.
   * @param json - The JSON string.
   * @returns A new PublicKey instance.
   */
  static fromJSON(json: string): PublicKey {
    return PublicKey.fromHex(json);
  }

  /**
   * Creates a PublicKey instance from a hexadecimal string.
   * @param source - The hexadecimal string.
   * @returns A new PublicKey instance.
   */
  static fromHex(source: string): PublicKey {
    const buffer = Buffer.from(source, 'hex');
    return PublicKey.fromBuffer(buffer);
  }

  /**
   * Creates a PublicKey instance from an ArrayBuffer.
   * @param buffer - The ArrayBuffer.
   * @returns A new PublicKey instance.
   * @throws Error if the public key algorithm is invalid.
   */
  public static fromBuffer(buffer: ArrayBuffer): PublicKey {
    const byteArray = new Uint8Array(buffer);
    const alg = byteArray[0] as KeyAlgorithm;
    const keyData = byteArray.slice(1);

    let key: PublicKeyInternal;
    switch (alg) {
      case KeyAlgorithm.ED25519:
        key = new Ed25519PublicKey(keyData);
        break;
      case KeyAlgorithm.SECP256K1:
        key = new Secp256k1PublicKey(keyData);
        break;
      default:
        throw ErrInvalidPublicKeyAlgo;
    }

    return new PublicKey(alg, key);
  }

  /**
   * Generates an account hash for the public key, used to uniquely identify an account.
   * @returns An AccountHash representing the account associated with this public key.
   */
  accountHash(): AccountHash {
    if (!this.key) {
      return new AccountHash(new Hash(new Uint8Array(0)));
    }

    const algString = KeyAlgorithm[this.cryptoAlg].toLowerCase();
    const algBytes = new TextEncoder().encode(algString);
    const separatorByte = new Uint8Array([0]);
    const keyBytes = this.key.bytes();

    const bytesToHash = concat([algBytes, separatorByte, keyBytes]);

    const blakeHash = byteHash(bytesToHash);
    const hash = Hash.fromBuffer(Buffer.from(blakeHash));
    return new AccountHash(hash, 'account-hash');
  }

  /**
   * Verifies a signature for a given message.
   * @param message - The message to verify.
   * @param sig - The signature to verify.
   * @returns A promise that resolves to a boolean indicating the validity of the signature.
   * @throws Error if the signature or public key is empty, or if the signature is invalid.
   */
  async verifySignature(
    message: Uint8Array,
    sig: Uint8Array
  ): Promise<boolean> {
    if (sig.length <= 1) throw ErrEmptySignature;
    if (!this.key) throw ErrEmptyPublicKey;

    const sigWithoutAlgByte = sig.slice(1);
    const signature = await this.key.verifySignature(
      message,
      sigWithoutAlgByte
    );

    if (!signature) throw ErrInvalidSignature;

    return signature;
  }

  /**
   * Checks equality between two PublicKey instances.
   * @param other - The other PublicKey instance to compare.
   * @returns True if the two PublicKey instances are equal; otherwise, false.
   */
  equals(other: PublicKey): boolean {
    return this.toHex() === other.toHex();
  }

  /**
   * Creates a new PublicKey instance from a hex string.
   * @param source - The hex string.
   * @returns A new PublicKey instance.
   */
  static newPublicKey(source: string): PublicKey {
    const data = Buffer.from(source, 'hex');
    return this.fromBytes(data)?.result;
  }

  /**
   * Creates a PublicKey instance from a byte array.
   * @param source - The byte array.
   * @returns A new PublicKey instance.
   * @throws Error if the public key algorithm is invalid.
   */
  static fromBytes(source: Uint8Array): IResultWithBytes<PublicKey> {
    const alg = source[0];
    const keyData = source.slice(1);
    let key: PublicKeyInternal | null = null;
    let expectedPublicKeySize;

    switch (alg) {
      case KeyAlgorithm.ED25519:
        key = new Ed25519PublicKey(keyData);
        expectedPublicKeySize = 32;
        break;
      case KeyAlgorithm.SECP256K1:
        key = new Secp256k1PublicKey(keyData);
        expectedPublicKeySize = 33;
        break;
      default:
        throw ErrInvalidPublicKeyAlgo;
    }

    const bytes = source.subarray(1, expectedPublicKeySize + 1);

    return { result: new PublicKey(alg, key), bytes };
  }
}

/**
 * Represents a list of public keys, with utility methods for checking membership and managing keys.
 */
export class PublicKeyList {
  private keys: PublicKey[];

  /**
   * Creates an instance of PublicKeyList.
   * @param keys - An optional array of PublicKey instances.
   */
  constructor(keys: PublicKey[] = []) {
    this.keys = keys;
  }

  /**
   * Checks if a given PublicKey is present in the list.
   * @param target - The PublicKey to check for.
   * @returns True if the target PublicKey is in the list; otherwise, false.
   */
  contains(target: PublicKey): boolean {
    return this.keys.some(key => key.equals(target));
  }
}
