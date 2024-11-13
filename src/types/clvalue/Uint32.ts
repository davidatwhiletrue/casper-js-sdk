import { BigNumber } from '@ethersproject/bignumber';

import { CLTypeUInt32, Int32ByteSize } from './cltype';
import { CLValue, IResultWithBytes } from './CLValue';
import { toBytesU32 } from '../ByteConverters';

/**
 * Represents a 32-bit unsigned integer value in the Casper type system.
 */
export class CLValueUInt32 {
  private value: BigNumber;

  /**
   * Initializes a new instance of the CLValueUInt32 class.
   * @param value - The value to initialize the CLValueUInt32 with.
   */
  constructor(value: BigNumber) {
    this.value = value;
  }

  /**
   * Converts the UInt32 value to its byte representation in little-endian format.
   * @returns A Uint8Array representing the bytes of the UInt32 value.
   */
  public bytes(): Uint8Array {
    return toBytesU32(this.value);
  }

  /**
   * Provides a string representation of the UInt32 value.
   * @returns The string representation of the value.
   */
  public toString(): string {
    return this.value.toString();
  }

  /**
   * Retrieves the numeric value of the UInt32.
   * @returns The BigNumber representation of the value.
   */
  public getValue(): BigNumber {
    return this.value;
  }

  /**
   * Creates a new CLValue instance with a UInt32 value.
   * @param val - The value to initialize the UInt32 with.
   * @returns A new CLValue instance containing CLTypeUInt32 and a CLValueUInt32.
   */
  public static newCLUInt32(val: BigNumber): CLValue {
    const res = new CLValue(CLTypeUInt32);
    res.ui32 = new CLValueUInt32(val);
    return res;
  }

  /**
   * Creates a CLValueUInt32 instance from a Uint8Array.
   * Parses the byte array to retrieve the UInt32 value.
   * @param source - The Uint8Array containing the byte representation of the UInt32 value.
   * @returns An object containing the new CLValueUInt32 instance and any remaining bytes.
   * @throws Error if the source array is too short for a UInt32 value.
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
   * Converts a BigNumber to its UInt32 byte representation.
   * @param val - The BigNumber value to convert.
   * @returns A Uint8Array representing the bytes of the UInt32 value.
   */
  public static sizeToBytes(val: BigNumber): Uint8Array {
    return new CLValueUInt32(val).bytes();
  }
}
