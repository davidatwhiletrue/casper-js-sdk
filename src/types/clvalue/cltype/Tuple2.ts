import { concat } from '@ethersproject/bytes';

import { TypeID, TypeName, CLType } from './CLType';
import { CLTypeParser } from './Parser';

/**
 * Represents a Tuple2 type in the CasperLabs type system.
 * This class implements the CLType interface for Tuple2 types, which are tuples containing two elements.
 */
export class CLTypeTuple2 implements CLType {
  /**
   * The CLType of the first element in the Tuple2.
   */
  inner1: CLType;

  /**
   * The CLType of the second element in the Tuple2.
   */
  inner2: CLType;

  /**
   * Constructs a new CLTypeTuple2 instance.
   * @param inner1 - The CLType of the first element in the Tuple2.
   * @param inner2 - The CLType of the second element in the Tuple2.
   */
  constructor(inner1: CLType, inner2: CLType) {
    this.inner1 = inner1;
    this.inner2 = inner2;
  }

  /**
   * Converts the CLTypeTuple2 to its byte representation.
   * @returns A Uint8Array representing the CLTypeTuple2, including its type ID and the bytes of its inner types.
   */
  public toBytes(): Uint8Array {
    return concat([
      Uint8Array.from([this.getTypeID()]),
      this.inner1.toBytes(),
      this.inner2.toBytes()
    ]);
  }

  /**
   * Returns a string representation of the CLTypeTuple2.
   * @returns A string in the format "Tuple2 (innerType1, innerType2)".
   */
  public toString(): string {
    return `${this.getName()} (${this.inner1.toString()}, ${this.inner2.toString()})`;
  }

  /**
   * Gets the type ID of the CLTypeTuple2.
   * @returns The TypeID for Tuple2.
   */
  public getTypeID(): TypeID {
    return TypeID.Tuple2;
  }

  /**
   * Gets the name of the CLTypeTuple2.
   * @returns The TypeName for Tuple2.
   */
  public getName(): TypeName {
    return TypeName.Tuple2;
  }

  /**
   * Converts the CLTypeTuple2 to a JSON representation.
   * @returns An object with a "Tuple2" key containing an array with the two inner types.
   */
  public toJSON(): { [key: string]: CLType[] } {
    return { [this.getName()]: [this.inner1.toJSON(), this.inner2.toJSON()] };
  }

  /**
   * Creates a CLTypeTuple2 instance from a JSON representation.
   * @param source - The JSON representation of the CLTypeTuple2.
   * @returns A new CLTypeTuple2 instance.
   * @throws Error if the JSON structure is invalid or the inner types are invalid.
   */
  public static fromJSON(source: any): CLTypeTuple2 {
    if (!Array.isArray(source) || source.length !== 2) {
      throw new Error(
        'invalid tuple2 type format, should be array of 2 elements'
      );
    }
    const inner1 = CLTypeParser.fromInterface(source[0]);
    const inner2 = CLTypeParser.fromInterface(source[1]);

    if (!inner1 || !inner2) {
      throw new Error('Invalid inner types in Tuple2 JSON format');
    }

    return new CLTypeTuple2(inner1, inner2);
  }
}
