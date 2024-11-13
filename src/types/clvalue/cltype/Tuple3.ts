import { concat } from '@ethersproject/bytes';
import { TypeID, TypeName, CLType } from './CLType';
import { CLTypeParser } from './Parser';

/**
 * Represents a Tuple3 type in the Casper type system.
 * This class implements the CLType interface for tuples containing three elements.
 */
export class CLTypeTuple3 implements CLType {
  /**
   * The CLType of the first element in the Tuple3.
   */
  inner1: CLType;

  /**
   * The CLType of the second element in the Tuple3.
   */
  inner2: CLType;

  /**
   * The CLType of the third element in the Tuple3.
   */
  inner3: CLType;

  /**
   * Initializes a new instance of the CLTypeTuple3 class.
   * @param inner1 - The CLType of the first element in the Tuple3.
   * @param inner2 - The CLType of the second element in the Tuple3.
   * @param inner3 - The CLType of the third element in the Tuple3.
   */
  constructor(inner1: CLType, inner2: CLType, inner3: CLType) {
    this.inner1 = inner1;
    this.inner2 = inner2;
    this.inner3 = inner3;
  }

  /**
   * Converts the CLTypeTuple3 instance to its byte representation.
   * This includes the type ID for Tuple3 followed by the byte representations of the three inner types.
   * @returns A Uint8Array representing the CLTypeTuple3.
   */
  public toBytes(): Uint8Array {
    return concat([
      Uint8Array.from([this.getTypeID()]),
      this.inner1.toBytes(),
      this.inner2.toBytes(),
      this.inner3.toBytes()
    ]);
  }

  /**
   * Provides a string representation of the CLTypeTuple3.
   * @returns A string in the format "Tuple3 (innerType1, innerType2, innerType3)".
   */
  public toString(): string {
    return `${this.getName()} (${this.inner1.toString()}, ${this.inner2.toString()}, ${this.inner3.toString()})`;
  }

  /**
   * Retrieves the type ID of the CLTypeTuple3.
   * @returns The TypeID associated with Tuple3.
   */
  public getTypeID(): TypeID {
    return TypeID.Tuple3;
  }

  /**
   * Retrieves the name of the CLTypeTuple3.
   * @returns The TypeName for Tuple3.
   */
  public getName(): TypeName {
    return TypeName.Tuple3;
  }

  /**
   * Converts the CLTypeTuple3 instance to a JSON-compatible representation.
   * The JSON object contains a "Tuple3" key with an array that includes the three inner types.
   * @returns A JSON object representing the Tuple3 type and its inner types.
   */
  public toJSON(): { [key: string]: CLType[] } {
    return {
      [this.getName()]: [
        this.inner1.toJSON(),
        this.inner2.toJSON(),
        this.inner3.toJSON()
      ]
    };
  }

  /**
   * Creates a CLTypeTuple3 instance from a JSON representation.
   * Parses JSON input to determine the three inner types for the Tuple3.
   * @param source - The JSON representation of the CLTypeTuple3.
   * @returns A new CLTypeTuple3 instance with the parsed inner types.
   * @throws Error if the JSON structure is invalid or the inner types are not correctly specified.
   */
  public static fromJSON(source: any): CLTypeTuple3 {
    if (!Array.isArray(source) || source.length !== 3) {
      throw new Error(
        'invalid tuple3 type format, should be array of 3 elements'
      );
    }
    const inner1 = CLTypeParser.fromInterface(source[0]);
    const inner2 = CLTypeParser.fromInterface(source[1]);
    const inner3 = CLTypeParser.fromInterface(source[2]);

    if (!inner1 || !inner2 || !inner3) {
      throw new Error('Invalid inner types in Tuple3 JSON format');
    }

    return new CLTypeTuple3(inner1, inner2, inner3);
  }
}
