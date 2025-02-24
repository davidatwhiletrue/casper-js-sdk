import { jsonMember, jsonObject } from 'typedjson';
import { toBytesNumber } from '../ByteConverters';

/**
 * Represents an Era in the system.
 * An Era is a distinct period in the blockchain, typically used for consensus, validator rotations, and reward distributions.
 */
@jsonObject
export class Era {
  /**
   * The numeric identifier of the Era.
   */
  @jsonMember({ constructor: Number })
  public value: number;

  /**
   * Creates a new Era instance.
   * @param value - The numeric identifier of the Era.
   */
  constructor(value: number) {
    this.value = value;
  }

  /**
   * Converts the Era instance to its JSON representation.
   * @returns A string representation of the Era's numeric value.
   */
  toJSON(): string {
    return this.value.toString();
  }

  /**
   * Creates an Era instance from its JSON representation.
   * @param json - The JSON string representation of the Era.
   * @returns A new Era instance.
   * @throws Error if the JSON string cannot be parsed as a valid number.
   */
  static fromJSON(json: string): Era {
    const value = parseInt(json, 10);
    if (isNaN(value)) {
      throw new Error(`Invalid Era value: ${json}`);
    }
    return new Era(value);
  }

  /**
   * Creates an Era instance from a byte array.
   * @param bytes - The byte array representing the Era value as a 32-bit unsigned integer.
   * @returns A new Era instance.
   */
  static fromBytes(bytes: Uint8Array): Era {
    const value = new DataView(bytes.buffer).getUint32(0, true);
    return new Era(value);
  }

  /**
   * Converts the Era instance to a byte array.
   * @returns A Uint8Array representation of the Era value as a 32-bit unsigned integer.
   */
  toBytes(): Uint8Array {
    return toBytesNumber(64, false)(this.value);
  }
}
