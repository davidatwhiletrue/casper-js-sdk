import { CLValue, IResultWithBytes } from './CLValue';
import { CLTypeUInt8 } from './cltype';
import { toBytesU8 } from '../ByteConverters';

/**
 * Represents an 8-bit unsigned integer value in the CasperLabs type system.
 */
export class CLValueUInt8 {
  private value: number;

  /**
   * Constructs a new CLValueUInt8 instance.
   * @param value - The value to initialize the CLValueUInt8 with. Should be an integer between 0 and 255.
   */
  constructor(value: number) {
    this.value = value;
  }

  /**
   * Returns the byte representation of the UInt8 value.
   * @returns A Uint8Array containing a single byte representing the UInt8 value.
   */
  public bytes(): Uint8Array {
    return toBytesU8(this.value);
  }

  /**
   * Returns a string representation of the UInt8 value.
   * @returns The string representation of the value.
   */
  public toString(): string {
    return this.value.toString();
  }

  /**
   * Returns the number value of the UInt8.
   * @returns The number representation of the value.
   */
  public getValue(): number {
    return this.value;
  }

  /**
   * Creates a new CLValue instance with a UInt8 value.
   * @param val - The value to initialize the UInt8 with. Should be an integer between 0 and 255.
   * @returns A new CLValue instance with CLTypeUInt8 and a CLValueUInt8.
   */
  public static newCLUint8(val: number): CLValue {
    const res = new CLValue(CLTypeUInt8);
    res.ui8 = new CLValueUInt8(val);
    return res;
  }

  /**
   * Creates a CLValueUInt8 instance from a Uint8Array.
   * @param source - The Uint8Array containing the byte representation of the UInt8 value.
   * @returns A new CLValueUInt8 instance.
   */
  public static fromBytes(source: Uint8Array): IResultWithBytes<CLValueUInt8> {
    if (source.length === 0) {
      throw new Error('Insufficient buffer length for UInt8');
    }

    return { result: new CLValueUInt8(source[0]), bytes: source.subarray(1) };
  }
}
