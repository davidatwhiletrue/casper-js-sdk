import { BigNumber, BigNumberish } from '@ethersproject/bignumber';

import { CLTypeInt64, Int64ByteSize } from './cltype';
import { CLValue, IResultWithBytes } from './CLValue';
import { toBytesI64 } from '../ByteConverters';

/**
 * Represents a 64-bit signed integer value in the CasperLabs type system.
 */
export class CLValueInt64 {
  private value: BigNumberish;

  /**
   * Constructs a new CLValueInt64 instance.
   * @param value - The value to initialize the CLValueInt64 with. Can be any BigNumberish type.
   */
  constructor(value: BigNumberish) {
    this.value = value;
  }

  /**
   * Returns the byte representation of the Int64 value.
   * @returns A Uint8Array representing the bytes of the Int64 value in little-endian format.
   */
  public bytes(): Uint8Array {
    return toBytesI64(this.value);
  }

  /**
   * Returns a string representation of the Int64 value.
   * @returns The string representation of the value.
   */
  public toString(): string {
    return this.value.toString();
  }

  /**
   * Returns the bigint value of the Int64.
   * @returns The bigint representation of the value.
   */
  public getValue(): BigNumberish {
    return this.value;
  }

  /**
   * Creates a new CLValue instance with an Int64 value.
   * @param val - The value to initialize the Int64 with. Can be any BigNumberish type.
   * @returns A new CLValue instance with CLTypeInt64 and a CLValueInt64.
   */
  public static newCLInt64(val: BigNumberish): CLValue {
    const res = new CLValue(CLTypeInt64);
    res.i64 = new CLValueInt64(val);
    return res;
  }

  /**
   * Creates a CLValueInt64 instance from a Uint8Array.
   * @param source - The Uint8Array containing the byte representation of the Int64 value.
   * @returns A new CLValueInt64 instance.
   * @throws Will throw an error if the source array is smaller than Int64ByteSize.
   */
  public static fromBytes(source: Uint8Array): IResultWithBytes<CLValueInt64> {
    if (source.length < Int64ByteSize) {
      throw new Error('buffer size is too small');
    }
    const bytes = Uint8Array.from(source.subarray(0, 8));
    const val = BigNumber.from(bytes.slice().reverse()).fromTwos(64);
    const resultButes = source.subarray(8);

    return { result: new CLValueInt64(val), bytes: resultButes };
  }
}
