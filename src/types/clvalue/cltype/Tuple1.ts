import { concat } from '@ethersproject/bytes';

import { TypeID, TypeName, CLType } from './CLType';
import { CLTypeParser } from './Parser';

/**
 * Represents a Tuple1 type in the CasperLabs type system.
 * This class implements the CLType interface for Tuple1 types, which are tuples containing a single element.
 */
export class CLTypeTuple1 implements CLType {
  /**
   * The CLType of the single element in the Tuple1.
   */
  inner: CLType;

  /**
   * Constructs a new CLTypeTuple1 instance.
   * @param inner - The CLType of the single element in the Tuple1.
   */
  constructor(inner: CLType) {
    this.inner = inner;
  }

  /**
   * Converts the CLTypeTuple1 to its byte representation.
   * @returns A Uint8Array representing the CLTypeTuple1, including its type ID and the bytes of its inner type.
   */
  public toBytes(): Uint8Array {
    return concat([Uint8Array.from([this.getTypeID()]), this.inner.toBytes()]);
  }

  /**
   * Returns a string representation of the CLTypeTuple1.
   * @returns A string in the format "Tuple1 (innerType)".
   */
  public toString(): string {
    return `${this.getName()} (${this.inner.toString()})`;
  }

  /**
   * Gets the type ID of the CLTypeTuple1.
   * @returns The TypeID for Tuple1.
   */
  public getTypeID(): TypeID {
    return TypeID.Tuple1;
  }

  /**
   * Gets the name of the CLTypeTuple1.
   * @returns The TypeName for Tuple1.
   */
  public getName(): TypeName {
    return TypeName.Tuple1;
  }

  /**
   * Converts the CLTypeTuple1 to a JSON representation.
   * @returns An object with a "Tuple1" key containing an array with the inner type.
   */
  public toJSON(): { [key: string]: CLType[] } {
    return { [this.getName()]: [this.inner.toJSON()] };
  }

  /**
   * Creates a CLTypeTuple1 instance from a JSON representation.
   * @param source - The JSON representation of the CLTypeTuple1.
   * @returns A new CLTypeTuple1 instance.
   * @throws Error if the JSON structure is invalid or the inner type is invalid.
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
