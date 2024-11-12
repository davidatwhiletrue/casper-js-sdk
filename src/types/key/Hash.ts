import { jsonObject } from 'typedjson';
import { Conversions } from '../Conversions';
import { IResultWithBytes } from '../clvalue';

/**
 * Represents a cryptographic hash.
 * This class provides methods for creating, manipulating, and comparing hash values.
 */
@jsonObject
export class Hash {
  private hashBytes: Uint8Array;

  /** The length of the hash in bytes. */
  static ByteHashLen = 32;

  /** The length of the hash string representation in hexadecimal. */
  static StringHashLen = 64;

  /**
   * Creates a new Hash instance.
   * @param hashBytes - The byte array representing the hash.
   * @throws Error if the hash length is invalid.
   */
  constructor(hashBytes: Uint8Array) {
    if (hashBytes.length !== Hash.ByteHashLen) {
      throw new Error(
        `Invalid hash length, expected ${Hash.ByteHashLen} bytes.`
      );
    }
    this.hashBytes = hashBytes;
  }

  /**
   * Creates a Hash from a hexadecimal string.
   * @param source - The hexadecimal string representation of the hash.
   * @returns A new Hash instance.
   * @throws Error if the string length is invalid.
   */
  static fromHex(source: string): Hash {
    if (source.length !== Hash.StringHashLen) {
      throw new Error(
        `Invalid string length, expected ${Hash.StringHashLen} characters.`
      );
    }
    const bytes = Uint8Array.from(Buffer.from(source, 'hex'));
    return new Hash(bytes);
  }

  /**
   * Converts the Hash to a hexadecimal string.
   * @returns The hexadecimal string representation of the hash.
   */
  toHex(): string {
    return Conversions.encodeBase16(this.hashBytes);
  }

  /**
   * Converts the Hash to a byte array.
   * @returns The byte array representation of the hash.
   */
  toBytes(): Uint8Array {
    return this.hashBytes;
  }

  /**
   * Converts the Hash to its JSON representation.
   * @returns The JSON string representation of the hash.
   */
  toJSON(): string {
    return this.toHex();
  }

  /**
   * Creates a Hash from its JSON representation.
   * @param json - The JSON string representation of the hash.
   * @returns A new Hash instance.
   */
  static fromJSON(json: string): Hash {
    return Hash.fromHex(json);
  }

  /**
   * Creates a Hash from a byte array.
   * @param source - The byte array representing the hash.
   * @returns A new Hash instance.
   * @throws Error if the byte array length is invalid.
   */
  static fromBytes(source: Uint8Array): IResultWithBytes<Hash> {
    if (source.length !== Hash.ByteHashLen) {
      throw new Error('key length is not equal 32');
    }

    const hashBytes = source.subarray(0, Hash.ByteHashLen);
    return {
      result: new Hash(hashBytes),
      bytes: source.subarray(Hash.ByteHashLen)
    };
  }

  /**
   * Creates a Hash from a Buffer.
   * @param buffer - The Buffer containing the hash bytes.
   * @returns A new Hash instance.
   * @throws Error if the buffer length is less than the required hash length.
   */
  static fromBuffer(buffer: Buffer): Hash {
    if (buffer.length < Hash.ByteHashLen) {
      throw new Error('key length is not equal 32');
    }
    return new Hash(new Uint8Array(buffer.slice(0, Hash.ByteHashLen)));
  }

  /**
   * Compares this Hash with another Hash for equality.
   * @param other - The other Hash to compare with.
   * @returns True if the hashes are equal, false otherwise.
   */
  equals(other: Hash): boolean {
    if (this.hashBytes.length !== other.hashBytes.length) return false;
    return this.hashBytes.every(
      (byte, index) => byte === other.hashBytes[index]
    );
  }
}
