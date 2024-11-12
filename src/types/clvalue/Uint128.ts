import { BigNumber } from '@ethersproject/bignumber';

import { CLTypeUInt128 } from './cltype';
import { fromBytesUInt128 } from './UintBig';
import { CLValue, IResultWithBytes } from './CLValue';
import { toBytesU128 } from '../ByteConverters';

/**
 * Represents a 128-bit unsigned integer value in the CasperLabs type system.
 */
export class CLValueUInt128 {
  private val: BigNumber;

  /**
   * Constructs a new CLValueUInt128 instance.
   * @param val - The value to initialize the CLValueUInt128 with. Can be a BigNumber or a string.
   */
  constructor(val: BigNumber | string) {
    this.val = BigNumber.from(val);
  }

  /**
   * Returns the byte representation of the UInt128 value.
   * @returns A Uint8Array representing the bytes of the UInt128 value.
   */
  public bytes(): Uint8Array {
    return toBytesU128(this.val);
  }

  /**
   * Returns a string representation of the UInt128 value.
   * @returns The string representation of the value.
   */
  public toString(): string {
    return this.val.toString();
  }

  /**
   * Returns the BigNumber value of the UInt128.
   * @returns The BigNumber representation of the value.
   */
  public getValue(): BigNumber {
    return this.val;
  }

  /**
   * Creates a new CLValue instance with a UInt128 value.
   * @param val - The value to initialize the UInt128 with. Can be a BigNumber or a string.
   * @returns A new CLValue instance with CLTypeUInt128 and a CLValueUInt128.
   */
  public static newCLUInt128(val: BigNumber | string): CLValue {
    const res = new CLValue(CLTypeUInt128);
    res.ui128 = new CLValueUInt128(val);
    return res;
  }

  /**
   * Creates a CLValueUInt128 instance from a Uint8Array.
   * @param source - The Uint8Array containing the byte representation of the UInt128 value.
   * @returns A new CLValueUInt128 instance.
   */
  public static fromBytes(
    source: Uint8Array
  ): IResultWithBytes<CLValueUInt128> {
    return fromBytesUInt128(source);
  }
}
