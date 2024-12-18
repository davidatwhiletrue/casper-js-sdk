import { BigNumber } from '@ethersproject/bignumber';

import { fromBytesUInt256 } from './UintBig';
import { CLValue, IResultWithBytes } from './CLValue';
import { CLTypeUInt256 } from './cltype';
import { toBytesU256 } from '../ByteConverters';

/**
 * Represents a 256-bit unsigned integer value in the Casper type system.
 */
export class CLValueUInt256 {
  private val: BigNumber;

  /**
   * Initializes a new instance of the CLValueUInt256 class.
   * @param val - The value to initialize the CLValueUInt256 with. Accepts a BigNumber or a string.
   */
  constructor(val: BigNumber | string) {
    this.val = BigNumber.from(val);
  }

  /**
   * Converts the UInt256 value to its byte representation.
   * @returns A Uint8Array representing the bytes of the UInt256 value.
   */
  public bytes(): Uint8Array {
    return toBytesU256(this.val);
  }

  /**
   * Provides a string representation of the UInt256 value.
   * @returns The string representation of the value.
   */
  public toString(): string {
    return this.val.toString();
  }

  /**
   * Retrieves the BigNumber value of the UInt256.
   * @returns The BigNumber representation of the value.
   */
  public getValue(): BigNumber {
    return this.val;
  }

  /**
   * Creates a new CLValue instance with a UInt256 value.
   * @param val - The value to initialize the UInt256 with. Can be a BigNumber or a string.
   * @returns A new CLValue instance containing CLTypeUInt256 and a CLValueUInt256.
   */
  public static newCLUInt256(val: BigNumber | string): CLValue {
    const res = new CLValue(CLTypeUInt256);
    res.ui256 = new CLValueUInt256(val);
    return res;
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
   * Creates a CLValueUInt256 instance from a Uint8Array.
   * Parses the byte array to retrieve the UInt256 value.
   * @param source - The Uint8Array containing the byte representation of the UInt256 value.
   * @returns An object containing the new CLValueUInt256 instance and any remaining bytes.
   */
  public static fromBytes(
    source: Uint8Array
  ): IResultWithBytes<CLValueUInt256> {
    return fromBytesUInt256(source);
  }
}
