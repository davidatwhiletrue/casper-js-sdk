import { BigNumber, BigNumberish } from '@ethersproject/bignumber';

import { CLTypeInt32, Int32ByteSize } from './cltype';
import { CLValue, IResultWithBytes } from './CLValue';
import { toBytesI32 } from '../ByteConverters';

/**
 * Represents a 32-bit signed integer value in the CasperLabs type system.
 */
export class CLValueInt32 {
  private value: BigNumberish;

  /**
   * Constructs a new CLValueInt32 instance.
   * @param value - The value to initialize the CLValueInt32 with. Should be a 32-bit integer.
   */
  constructor(value: BigNumberish) {
    this.value = value;
  }

  /**
   * Returns the byte representation of the Int32 value.
   * @returns A Uint8Array representing the bytes of the Int32 value in little-endian format.
   */
  public bytes(): Uint8Array {
    return toBytesI32(this.value);
  }

  /**
   * Returns a string representation of the Int32 value.
   * @returns The string representation of the value.
   */
  public toString(): string {
    return this.value.toString();
  }

  /**
   * Returns the number value of the Int32.
   * @returns The number representation of the value.
   */
  public getValue(): BigNumberish {
    return this.value;
  }

  /**
   * Creates a new CLValue instance with an Int32 value.
   * @param val - The value to initialize the Int32 with. Should be a 32-bit integer.
   * @returns A new CLValue instance with CLTypeInt32 and a CLValueInt32.
   */
  public static newCLInt32(val: BigNumberish): CLValue {
    const res = new CLValue(CLTypeInt32);
    res.i32 = new CLValueInt32(val);
    return res;
  }

  /**
   * Creates a CLValueInt32 instance from a Uint8Array.
   * @param source - The Uint8Array containing the byte representation of the Int32 value.
   * @returns A new CLValueInt32 instance.
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
