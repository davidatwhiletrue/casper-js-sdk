import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { CLTypeUInt64, Int64ByteSize } from './cltype';
import { CLValue, IResultWithBytes } from './CLValue';
import { toBytesU64 } from '../ByteConverters';

/**
 * Represents a 64-bit unsigned integer value in the CasperLabs type system.
 */
export class CLValueUInt64 {
  private value: BigNumberish;

  /**
   * Constructs a new CLValueUInt64 instance.
   * @param value - The value to initialize the CLValueUInt64 with. Can be any BigNumberish type.
   */
  constructor(value: BigNumberish) {
    this.value = value;
  }

  /**
   * Returns the byte representation of the UInt64 value.
   * @returns A Uint8Array representing the bytes of the UInt64 value in little-endian format.
   */
  public bytes(): Uint8Array {
    return toBytesU64(this.value);
  }

  /**
   * Returns a string representation of the UInt64 value.
   * @returns The string representation of the value.
   */
  public toString(): string {
    return this.value.toString();
  }

  /**
   * Returns the bigint value of the UInt64.
   * @returns The bigint representation of the value.
   */
  public getValue(): BigNumberish {
    return this.value;
  }

  /**
   * Creates a new CLValue instance with a UInt64 value.
   * @param val - The value to initialize the UInt64 with. Can be any BigNumberish type.
   * @returns A new CLValue instance with CLTypeUInt64 and a CLValueUInt64.
   */
  public static newCLUint64(val: BigNumberish): CLValue {
    const res = new CLValue(CLTypeUInt64);
    res.ui64 = new CLValueUInt64(val);
    return res;
  }

  /**
   * Creates a CLValueUInt64 instance from a Uint8Array.
   * @param source - The Uint8Array containing the byte representation of the UInt64 value.
   * @returns A new CLValueUInt64 instance.
   * @throws Will throw an error if the source array is smaller than Int64ByteSize.
   */
  public static fromBytes(source: Uint8Array): IResultWithBytes<CLValueUInt64> {
    if (source.length < Int64ByteSize) {
      throw new Error('buffer size is too small');
    }
    const u64Bytes = Uint8Array.from(source.subarray(0, 8));
    const u64 = BigNumber.from(u64Bytes.slice().reverse());

    return { result: new CLValueUInt64(u64), bytes: source.subarray(8) };
  }
}
