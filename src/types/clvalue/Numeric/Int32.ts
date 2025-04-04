import { BigNumber, BigNumberish } from '@ethersproject/bignumber';

import { Int32ByteSize } from '../cltype';
import { IResultWithBytes } from '../CLValue';
import { toBytesI32 } from '../../ByteConverters';
import { CLValueNumeric } from './Abstract';

/**
 * Represents a 32-bit signed integer value in the Casper type system.
 * This class provides methods for handling 32-bit integers, including byte conversion and CLValue integration.
 */
export class CLValueInt32 extends CLValueNumeric {
  constructor(value: BigNumberish) {
    super(value);
  }

  /**
   * Converts the Int32 value to its byte representation in little-endian format.
   * @returns A Uint8Array representing the bytes of the Int32 value.
   */
  public bytes(): Uint8Array {
    return toBytesI32(this.value);
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
    const i32 = BigNumber.from(i32Bytes.slice().reverse()).fromTwos(32);

    return { result: new CLValueInt32(i32), bytes: source.subarray(4) };
  }
}
