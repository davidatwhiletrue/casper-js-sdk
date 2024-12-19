import { BigNumber } from '@ethersproject/bignumber';

import { CLTypeUInt128 } from './cltype';
import { fromBytesUInt128 } from './UintBig';
import { CLValue, IResultWithBytes } from './CLValue';
import { toBytesU128 } from '../ByteConverters';

/**
 * Represents a 128-bit unsigned integer value in the Casper type system.
 */
export class CLValueUInt128 {
  private val: BigNumber;

  /**
   * Initializes a new instance of the CLValueUInt128 class.
   * @param val - The value to initialize the CLValueUInt128 with. Accepts a BigNumber or a string.
   */
  constructor(val: BigNumber | string) {
    this.val = BigNumber.from(val);
  }

  /**
   * Converts the UInt128 value to its byte representation.
   * @returns A Uint8Array representing the bytes of the UInt128 value.
   */
  public bytes(): Uint8Array {
    return toBytesU128(this.val);
  }

  /**
   * Provides a string representation of the UInt128 value.
   * @returns The string representation of the value.
   */
  public toString(): string {
    return this.val.toString();
  }

  /**
   * Retrieves the BigNumber value of the UInt128.
   * @returns The BigNumber representation of the value.
   */
  public getValue(): BigNumber {
    return this.val;
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
   * Creates a new CLValue instance with a UInt128 value.
   * @param val - The value to initialize the UInt128 with. Can be a BigNumber or a string.
   * @returns A new CLValue instance containing CLTypeUInt128 and a CLValueUInt128.
   */
  public static newCLUInt128(val: BigNumber | string): CLValue {
    const res = new CLValue(CLTypeUInt128);
    res.ui128 = new CLValueUInt128(val);
    return res;
  }

  /**
   * Creates a CLValueUInt128 instance from a Uint8Array.
   * Parses the byte array to retrieve the UInt128 value.
   * @param source - The Uint8Array containing the byte representation of the UInt128 value.
   * @returns An object containing the new CLValueUInt128 instance and any remaining bytes.
   */
  public static fromBytes(
    source: Uint8Array
  ): IResultWithBytes<CLValueUInt128> {
    return fromBytesUInt128(source);
  }
}
