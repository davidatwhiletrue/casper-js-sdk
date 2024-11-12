import { concat } from '@ethersproject/bytes';

import { CLType, TypeID, TypeName } from './CLType';
import { CLTypeParser } from './Parser';

/**
 * Represents a List type in the CasperLabs type system.
 * This class implements the CLType interface for List types.
 */
export class CLTypeList implements CLType {
  /**
   * The type of elements contained in the list.
   */
  public elementsType: CLType;

  /**
   * Constructs a new CLTypeList instance.
   * @param elementsType - The CLType of elements in the list.
   */
  constructor(elementsType: CLType) {
    this.elementsType = elementsType;
  }

  /**
   * Converts the CLTypeList to its byte representation.
   * @returns A Uint8Array representing the CLTypeList, including its type ID and the bytes of its element type.
   */
  public toBytes(): Uint8Array {
    return concat([
      Uint8Array.from([this.getTypeID()]),
      this.elementsType.toBytes()
    ]);
  }

  /**
   * Returns a string representation of the CLTypeList.
   * @returns A string in the format "(List of [element type])".
   */
  public toString(): string {
    return `(${this.getName()} of ${this.elementsType.toString()})`;
  }

  /**
   * Gets the type ID of the CLTypeList.
   * @returns The TypeID for List.
   */
  public getTypeID(): TypeID {
    return TypeID.List;
  }

  /**
   * Gets the name of the CLTypeList.
   * @returns The TypeName for List.
   */
  public getName(): TypeName {
    return TypeName.List;
  }

  /**
   * Converts the CLTypeList to a JSON representation.
   * @returns An object with a single key-value pair, where the key is "List" and the value is the JSON representation of the element type.
   */
  public toJSON(): { [key: string]: CLType } {
    return { [this.getName()]: this.elementsType.toJSON() };
  }

  /**
   * Creates a CLTypeList instance from a JSON representation.
   * @param source - The JSON representation of the CLTypeList.
   * @returns A new CLTypeList instance.
   */
  public static fromJSON(source: any): CLTypeList {
    const inner = CLTypeParser.fromInterface(source);
    return new CLTypeList(inner);
  }
}
