import { BigNumber } from '@ethersproject/bignumber';

import { fromBytesUInt512 } from './UintBig';
import { CLValue, IResultWithBytes } from './CLValue';
import { CLTypeUInt512 } from './cltype';
import { toBytesU512 } from '../ByteConverters';

/**
 * Represents a 512-bit unsigned integer value in the Casper type system.
 */
export class CLValueUInt512 {
  public val: BigNumber;
  public isStringFmt: boolean;

  /**
   * Initializes a new instance of the CLValueUInt512 class.
   * @param val - The value to initialize the CLValueUInt512 with. Accepts a BigNumber or a string.
   */
  constructor(val: BigNumber | string) {
    this.val = BigNumber.from(val);
    this.isStringFmt = typeof val === 'string';
  }

  /**
   * Converts the UInt512 value to its byte representation.
   * @returns A Uint8Array representing the bytes of the UInt512 value.
   */
  public bytes(): Uint8Array {
    return toBytesU512(this.val);
  }

  /**
   * Provides a string representation of the UInt512 value.
   * @returns The string representation of the value.
   */
  public toString(): string {
    return this.val.toString();
  }

  /**
   * Retrieves the BigNumber value of the UInt512.
   * @returns The BigNumber representation of the value.
   */
  public value(): BigNumber {
    return this.val;
  }

  /**
   * Returns a JSON representation of the UInt512 value.
   * @returns A string if the value was originally provided as a string, otherwise a number.
   */
  public toJSON(): string | number {
    return this.isStringFmt ? this.toString() : this.val.toNumber();
  }

  /**
   * Creates a CLValueUInt512 instance from a JSON representation.
   * @param json - The JSON representation of the UInt512 value. Can be a string or a number.
   * @returns A new CLValueUInt512 instance.
   * @throws Will throw an error if the input is not a valid integer or is negative.
   */
  public static fromJSON(json: string | number): CLValueUInt512 {
    const num = BigNumber.from(json);

    if (!num.mod(1).isZero() || num.isNegative()) {
      throw new Error(`Invalid integer string: ${json}`);
    }

    const isStringFmt = typeof json === 'string';
    const result = new CLValueUInt512(num);
    result.isStringFmt = isStringFmt;
    return result;
  }

  /**
   * Creates a CLValueUInt512 instance from a Uint8Array.
   * Parses the byte array to retrieve the UInt512 value.
   * @param source - The Uint8Array containing the byte representation of the UInt512 value.
   * @returns An object containing the new CLValueUInt512 instance and any remaining bytes.
   */
  public static fromBytes(
    source: Uint8Array
  ): IResultWithBytes<CLValueUInt512> {
    return fromBytesUInt512(source);
  }

  /**
   * Creates a new CLValue instance with a UInt512 value.
   * @param val - The value to initialize the UInt512 with. Can be a BigNumber or a string.
   * @returns A new CLValue instance containing CLTypeUInt512 and a CLValueUInt512.
   */
  public static newCLUInt512(val: BigNumber | string): CLValue {
    const res = new CLValue(CLTypeUInt512);
    res.ui512 = new CLValueUInt512(val);
    return res;
  }
}

/**
 * Deserializes an array of rewards into a Map.
 * @param arr - The array to be deserialized, where each element is a tuple containing a key and an array of rewards.
 * @returns A Map where each key corresponds to an array of CLValueUInt512 rewards.
 * @throws Will throw an error if duplicate keys are detected.
 */
export const deserializeRewards = (arr: any) => {
  const parsed = new Map(
    Array.from(arr, ([key, value]) => {
      const valuesArray = value.map((item: any) =>
        CLValueUInt512.fromJSON(item)
      );
      return [key, valuesArray];
    })
  );

  if (parsed.size !== Array.from(arr).length) {
    throw Error(`Duplicate key exists.`);
  }

  return parsed;
};

/**
 * Serializes a Map of rewards into an array format suitable for JSON storage.
 * @param map - A Map where each key corresponds to an array of CLValueUInt512 rewards.
 * @returns An array where each element is a tuple containing a key and an array of rewards in JSON format.
 */
export const serializeRewards = (map: Map<string, CLValueUInt512[]>) => {
  return Array.from(map, ([key, value]) => {
    const serializedValue = value.map(item => item.toJSON());
    return [key, serializedValue];
  });
};
