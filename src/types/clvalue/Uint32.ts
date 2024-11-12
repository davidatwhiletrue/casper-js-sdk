import { BigNumber } from '@ethersproject/bignumber';

import { CLTypeUInt32, Int32ByteSize } from './cltype';
import { CLValue, IResultWithBytes } from './CLValue';
import { toBytesU32 } from '../ByteConverters';

/**
 * Represents a 32-bit unsigned integer value in the CasperLabs type system.
 */
export class CLValueUInt32 {
  private value: BigNumber;

  /**
   * Constructs a new CLValueUInt32 instance.
   * @param value - The value to initialize the CLValueUInt32 with.
   */
  constructor(value: BigNumber) {
    this.value = value;
  }

  /**
   * Returns the byte representation of the UInt32 value.
   * @returns A Uint8Array representing the bytes of the UInt32 value in little-endian format.
   */
  public bytes(): Uint8Array {
    return toBytesU32(this.value);
  }

  /**
   * Returns a string representation of the UInt32 value.
   * @returns The string representation of the value.
   */
  public toString(): string {
    return this.value.toString();
  }

  /**
   * Returns the number value of the UInt32.
   * @returns The number representation of the value.
   */
  public getValue(): BigNumber {
    return this.value;
  }

  /**
   * Creates a new CLValue instance with a UInt32 value.
   * @param val - The value to initialize the UInt32 with.
   * @returns A new CLValue instance with CLTypeUInt32 and a CLValueUInt32.
   */
  public static newCLUInt32(val: BigNumber): CLValue {
    const res = new CLValue(CLTypeUInt32);
    res.ui32 = new CLValueUInt32(val);
    return res;
  }

  /**
   * Creates a CLValueUInt32 instance from a Uint8Array.
   * @param source - The Uint8Array containing the byte representation of the UInt32 value.
   * @returns A new CLValueUInt32 instance.
   */
  public static fromBytes(source: Uint8Array): IResultWithBytes<CLValueUInt32> {
    if (source.length < Int32ByteSize) {
      throw new Error('Buffer size is too small for UInt32');
    }
    const u32Bytes = Uint8Array.from(source.subarray(0, 4));
    const u32 = BigNumber.from(u32Bytes.slice().reverse());

    return { result: new CLValueUInt32(u32), bytes: source.subarray(4) };
  }

  /**
   * Converts a number to its UInt32 byte representation.
   * @param val - The number to convert.
   * @returns A Uint8Array representing the bytes of the UInt32 value.
   */
  public static sizeToBytes(val: BigNumber): Uint8Array {
    return new CLValueUInt32(val).bytes();
  }
}
