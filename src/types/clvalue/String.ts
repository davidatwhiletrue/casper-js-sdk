import { CLTypeString } from './cltype';
import { CLValue, IResultWithBytes } from './CLValue';
import { CLValueUInt32 } from './Uint32';
import { fromBytesString } from '../ByteConverters';

/**
 * Represents a string value in the CasperLabs type system.
 */
export class CLValueString {
  private value: string;

  /**
   * Constructs a new CLValueString instance.
   * @param value - The string value to be represented.
   */
  constructor(value: string) {
    this.value = value;
  }

  /**
   * Returns the byte representation of the string value.
   * @returns A Uint8Array representing the bytes of the string, prefixed with its length.
   */
  public bytes(): Uint8Array {
    const sizeBytes = this.sizeToBytes(this.value.length);
    const valueBytes = new TextEncoder().encode(this.value);
    return new Uint8Array([...sizeBytes, ...valueBytes]);
  }

  private sizeToBytes(size: number): Uint8Array {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, size, true);
    return new Uint8Array(buffer);
  }

  /**
   * Returns the string value.
   * @returns The string value.
   */
  public toString(): string {
    return this.value;
  }

  /**
   * Creates a new CLValue instance with a string value.
   * @param val - The string value to be represented.
   * @returns A new CLValue instance with CLTypeString and a CLValueString.
   */
  public static newCLString(val: string): CLValue {
    const res = new CLValue(CLTypeString);
    res.stringVal = new CLValueString(val);
    return res;
  }

  /**
   * Creates a CLValueString instance from a Uint8Array.
   * @param source - The Uint8Array containing the byte representation of the string value.
   * @returns A new CLValueString instance.
   */
  public static fromBytes(source: Uint8Array): IResultWithBytes<CLValueString> {
    const uint32Value = CLValueUInt32.fromBytes(source);
    const size = uint32Value?.result?.getValue()?.toNumber();
    const value = fromBytesString(uint32Value?.bytes?.subarray(0, size));

    return {
      result: new CLValueString(value),
      bytes: uint32Value?.bytes?.subarray(size)
    };
  }
}
