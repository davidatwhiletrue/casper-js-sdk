import { BigNumber, BigNumberish } from '@ethersproject/bignumber';

import { CLTypeInt32, Int32ByteSize } from './cltype';
import { CLValue, IResultWithBytes } from './CLValue';
import { toBytesI32 } from '../ByteConverters';

/**
 * Represents a 32-bit signed integer value in the Casper type system.
 * This class provides methods for handling 32-bit integers, including byte conversion and CLValue integration.
 */
export class CLValueInt32 {
  private value: BigNumberish;

  /**
   * Initializes a new instance of the CLValueInt32 class.
   * @param value - The 32-bit integer value to be stored in the CLValueInt32.
   */
  constructor(value: BigNumberish) {
    this.value = value;
  }

  /**
   * Converts the Int32 value to its byte representation in little-endian format.
   * @returns A Uint8Array representing the bytes of the Int32 value.
   */
  public bytes(): Uint8Array {
    return toBytesI32(this.value);
  }

  /**
   * Provides a string representation of the Int32 value.
   * @returns The string representation of the stored value.
   */
  public toString(): string {
    return this.value.toString();
  }

  /**
   * Converts the instance to a JSON-compatible string.
   *
   * @returns {string} The string representation of the instance.
   */
  public toJSON(): string {
    return this.toString();
  }

  /**
   * Retrieves the numeric value of the Int32.
   * @returns The numeric representation of the value.
   */
  public getValue(): BigNumberish {
    return this.value;
  }

  /**
   * Creates a new CLValue instance with an Int32 value.
   * @param val - The 32-bit integer to be encapsulated in a CLValue.
   * @returns A new CLValue instance containing CLTypeInt32 and a CLValueInt32.
   */
  public static newCLInt32(val: BigNumberish): CLValue {
    const res = new CLValue(CLTypeInt32);
    res.i32 = new CLValueInt32(val);
    return res;
  }

  /**
   * Creates a CLValueInt32 instance from a Uint8Array.
   * Interprets the first 4 bytes of the array as a 32-bit integer in little-endian format.
   * @param source - The Uint8Array containing the byte representation of the Int32 value.
   * @returns An object containing the new CLValueInt32 instance and any remaining bytes.
   * @throws Will throw an error if the source array is smaller than Int32ByteSize.
   */
  public static fromBytes(source: Uint8Array): IResultWithBytes<CLValueInt32> {
    if (source.length < Int32ByteSize) {
      throw new Error('buffer size is too small');
    }
    const i32Bytes = Uint8Array.from(source.subarray(0, 4));
    const i32 = BigNumber.from(i32Bytes.slice().reverse());

    return { result: new CLValueInt32(i32), bytes: source.subarray(4) };
  }
}
