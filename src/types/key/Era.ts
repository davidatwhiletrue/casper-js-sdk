import { jsonMember, jsonObject } from 'typedjson';

/**
 * Represents an Era in the system.
 * An Era is a period of time in the blockchain, typically used for consensus and reward distribution.
 */
@jsonObject
export class Era {
  /**
   * The numeric value of the Era.
   */
  @jsonMember({ constructor: Number })
  public value: number;

  /**
   * Creates a new Era instance.
   * @param value - The numeric value of the Era.
   */
  constructor(value: number) {
    this.value = value;
  }

  /**
   * Converts the Era to its JSON representation.
   * @returns A string representation of the Era's value.
   */
  toJSON(): string {
    return this.value.toString();
  }

  /**
   * Creates an Era from its JSON representation.
   * @param json - The JSON string representation of the Era.
   * @returns A new Era instance.
   * @throws Error if the JSON string cannot be parsed to a valid number.
   */
  static fromJSON(json: string): Era {
    const value = parseInt(json, 10);
    if (isNaN(value)) {
      throw new Error(`Invalid Era value: ${json}`);
    }
    return new Era(value);
  }

  /**
   * Creates an Era from a byte array.
   * @param bytes - The byte array representing the Era.
   * @returns A new Era instance.
   */
  static fromBytes(bytes: Uint8Array): Era {
    const value = new DataView(bytes.buffer).getUint32(0, true);
    return new Era(value);
  }

  /**
   * Converts the Era to a byte array.
   * @returns A Uint8Array representation of the Era.
   */
  toBytes(): Uint8Array {
    const buffer = new ArrayBuffer(8);
    new DataView(buffer).setUint32(0, this.value, true);
    return new Uint8Array(buffer);
  }
}
