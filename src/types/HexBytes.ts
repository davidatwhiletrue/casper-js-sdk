import { jsonObject, jsonMember } from 'typedjson';

/**
 * Represents a collection of bytes stored as a `Uint8Array` with methods
 * to convert to/from hexadecimal and JSON.
 */
@jsonObject
export class HexBytes {
  /**
   * The raw byte data stored in a `Uint8Array`.
   */
  @jsonMember(Uint8Array)
  bytes: Uint8Array;

  /**
   * Creates a new instance of `HexBytes`.
   *
   * @param bytes The byte data as a `Uint8Array`.
   */
  constructor(bytes: Uint8Array) {
    this.bytes = bytes;
  }

  /**
   * Converts the stored bytes into a hexadecimal string.
   *
   * @returns The hexadecimal string representation of the byte data.
   */
  toHex(): string {
    return Array.from(this.bytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Converts the stored bytes to a JSON string representation.
   * This method returns the hexadecimal string of the byte data.
   *
   * @returns The hexadecimal string as a JSON string.
   */
  toJSON(): string {
    return this.toHex();
  }

  /**
   * Creates a `HexBytes` instance from a hexadecimal string.
   *
   * @param hexString The hexadecimal string to convert.
   * @returns A new `HexBytes` instance.
   */
  static fromHex(hexString: string): HexBytes {
    const bytes = new Uint8Array(
      hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
    return new HexBytes(bytes);
  }

  /**
   * Creates a `HexBytes` instance from a JSON string.
   * The JSON string should be a hexadecimal string.
   *
   * @param json The JSON string to convert.
   * @returns A new `HexBytes` instance.
   */
  static fromJSON(json: string): HexBytes {
    return HexBytes.fromHex(json);
  }

  /**
   * Returns a string representation of the byte data as hexadecimal.
   *
   * @returns A string representing the byte data in hexadecimal format.
   */
  toString(): string {
    return this.toHex();
  }
}
