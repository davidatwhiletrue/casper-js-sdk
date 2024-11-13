import { concat } from '@ethersproject/bytes';
import { CLType, TypeID, TypeName } from './CLType';
import { CLTypeParser } from './Parser';

/**
 * Represents a List type in the Casper type system.
 * This class implements the CLType interface specifically for List types, allowing lists of elements with a specified type.
 */
export class CLTypeList implements CLType {
  /**
   * The type of elements contained in the list.
   */
  public elementsType: CLType;

  /**
   * Initializes a new instance of the CLTypeList class.
   * @param elementsType - The CLType of the elements in the list.
   */
  constructor(elementsType: CLType) {
    this.elementsType = elementsType;
  }

  /**
   * Converts the CLTypeList instance to its byte representation.
   * This includes the type ID for List followed by the byte representation of the element type.
   * @returns A Uint8Array representing the CLTypeList.
   */
  public toBytes(): Uint8Array {
    return concat([
      Uint8Array.from([this.getTypeID()]),
      this.elementsType.toBytes()
    ]);
  }

  /**
   * Provides a string representation of the CLTypeList.
   * @returns A string in the format "(List of [element type])".
   */
  public toString(): string {
    return `(${this.getName()} of ${this.elementsType.toString()})`;
  }

  /**
   * Retrieves the type ID of the CLTypeList.
   * @returns The TypeID associated with List.
   */
  public getTypeID(): TypeID {
    return TypeID.List;
  }

  /**
   * Retrieves the name of the CLTypeList.
   * @returns The TypeName for List.
   */
  public getName(): TypeName {
    return TypeName.List;
  }

  /**
   * Converts the CLTypeList to a JSON-compatible representation.
   * The JSON object contains a single key-value pair, where the key is "List" and the value is the JSON representation of the element type.
   * @returns A JSON object representing the list type and its element type.
   */
  public toJSON(): { [key: string]: CLType } {
    return { [this.getName()]: this.elementsType.toJSON() };
  }

  /**
   * Creates a CLTypeList instance from a JSON representation.
   * @param source - The JSON representation of the CLTypeList.
   * @returns A new CLTypeList instance with the parsed element type.
   */
  public static fromJSON(source: any): CLTypeList {
    const inner = CLTypeParser.fromInterface(source);
    return new CLTypeList(inner);
  }
}
