import { BigNumber } from '@ethersproject/bignumber';

import { fromBytesUInt256 } from './UintBig';
import { CLValue, IResultWithBytes } from './CLValue';
import { CLTypeUInt256 } from './cltype';
import { toBytesU256 } from '../ByteConverters';

/**
 * Represents a 256-bit unsigned integer value in the CasperLabs type system.
 */
export class CLValueUInt256 {
  private val: BigNumber;

  /**
   * Constructs a new CLValueUInt256 instance.
   * @param val - The value to initialize the CLValueUInt256 with. Can be a BigNumber or a string.
   */
  constructor(val: BigNumber | string) {
    this.val = BigNumber.from(val);
  }

  /**
   * Returns the byte representation of the UInt256 value.
   * @returns A Uint8Array representing the bytes of the UInt256 value.
   */
  public bytes(): Uint8Array {
    return toBytesU256(this.val);
  }

  /**
   * Returns a string representation of the UInt256 value.
   * @returns The string representation of the value.
   */
  public toString(): string {
    return this.val.toString();
  }

  /**
   * Returns the BigNumber value of the UInt256.
   * @returns The BigNumber representation of the value.
   */
  public getValue(): BigNumber {
    return this.val;
  }

  /**
   * Creates a new CLValue instance with a UInt256 value.
   * @param val - The value to initialize the UInt256 with. Can be a BigNumber or a string.
   * @returns A new CLValue instance with CLTypeUInt256 and a CLValueUInt256.
   */
  public static newCLUInt256(val: BigNumber | string): CLValue {
    const res = new CLValue(CLTypeUInt256);
    res.ui256 = new CLValueUInt256(val);
    return res;
  }

  /**
   * Creates a CLValueUInt256 instance from a Uint8Array.
   * @param source - The Uint8Array containing the byte representation of the UInt256 value.
   * @returns A new CLValueUInt256 instance.
   */
  public static fromBytes(
    source: Uint8Array
  ): IResultWithBytes<CLValueUInt256> {
    return fromBytesUInt256(source);
  }
}
