import { concat } from '@ethersproject/bytes';
import { TypeID, TypeName, CLType } from './CLType';
import { CLTypeParser } from './Parser';

/**
 * Represents a Tuple1 type in the Casper type system.
 * This class implements the CLType interface for tuples containing a single element.
 */
export class CLTypeTuple1 implements CLType {
  /**
   * The CLType of the single element in the Tuple1.
   */
  inner: CLType;

  /**
   * Initializes a new instance of the CLTypeTuple1 class.
   * @param inner - The CLType of the single element in the Tuple1.
   */
  constructor(inner: CLType) {
    this.inner = inner;
  }

  /**
   * Converts the CLTypeTuple1 instance to its byte representation.
   * This includes the type ID for Tuple1 followed by the byte representation of the inner type.
   * @returns A Uint8Array representing the CLTypeTuple1.
   */
  public toBytes(): Uint8Array {
    return concat([Uint8Array.from([this.getTypeID()]), this.inner.toBytes()]);
  }

  /**
   * Provides a string representation of the CLTypeTuple1.
   * @returns A string in the format "Tuple1 (innerType)".
   */
  public toString(): string {
    return `${this.getName()} (${this.inner.toString()})`;
  }

  /**
   * Retrieves the type ID of the CLTypeTuple1.
   * @returns The TypeID associated with Tuple1.
   */
  public getTypeID(): TypeID {
    return TypeID.Tuple1;
  }

  /**
   * Retrieves the name of the CLTypeTuple1.
   * @returns The TypeName for Tuple1.
   */
  public getName(): TypeName {
    return TypeName.Tuple1;
  }

  /**
   * Converts the CLTypeTuple1 instance to a JSON-compatible representation.
   * The JSON object contains a "Tuple1" key with an array that includes the inner type.
   * @returns A JSON object representing the Tuple1 type and its inner type.
   */
  public toJSON(): { [key: string]: CLType[] } {
    return { [this.getName()]: [this.inner.toJSON()] };
  }

  /**
   * Creates a CLTypeTuple1 instance from a JSON representation.
   * Parses JSON input to determine the inner type for the Tuple1.
   * @param source - The JSON representation of the CLTypeTuple1.
   * @returns A new CLTypeTuple1 instance with the parsed inner type.
   * @throws Error if the JSON structure is invalid or the inner type is not correctly specified.
   */
  public static fromJSON(source: any): CLTypeTuple1 {
    if (!Array.isArray(source) || source.length !== 1) {
      throw new Error(
        'invalid tuple1 type format, should be array of 1 element'
      );
    }
    const inner = CLTypeParser.fromInterface(source[0]);

    if (!inner) {
      throw new Error('Invalid inner type in Tuple1 JSON format');
    }

    return new CLTypeTuple1(inner);
  }
}
