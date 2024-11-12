import { concat } from '@ethersproject/bytes';

import { TypeID, TypeName, CLType } from './CLType';
import { CLTypeParser } from './Parser';

/**
 * Represents an Option type in the CasperLabs type system.
 * This class implements the CLType interface for Option types.
 */
export class CLTypeOption implements CLType {
  /**
   * The inner CLType that this Option can contain.
   */
  public inner: CLType;

  /**
   * Constructs a new CLTypeOption instance.
   * @param inner - The CLType of the value that this Option can contain.
   */
  constructor(inner: CLType) {
    this.inner = inner;
  }

  /**
   * Converts the CLTypeOption to its byte representation.
   * @returns A Uint8Array representing the CLTypeOption, including its type ID and the bytes of its inner type.
   */
  public toBytes(): Uint8Array {
    return concat([Uint8Array.from([this.getTypeID()]), this.inner.toBytes()]);
  }

  /**
   * Returns a string representation of the CLTypeOption.
   * @returns A string in the format "(Option: innerType)".
   */
  public toString(): string {
    return `(${this.getName()}: ${this.inner.getName()})`;
  }

  /**
   * Gets the type ID of the CLTypeOption.
   * @returns The TypeID for Option.
   */
  public getTypeID(): TypeID {
    return TypeID.Option;
  }

  /**
   * Gets the name of the CLTypeOption.
   * @returns The TypeName for Option.
   */
  public getName(): TypeName {
    return TypeName.Option;
  }

  /**
   * Converts the CLTypeOption to a JSON representation.
   * @returns An object with a single key-value pair, where the key is "Option" and the value is the JSON representation of the inner type.
   */
  public toJSON(): { [key: string]: CLType } {
    return { [this.getName()]: this.inner.toJSON() };
  }

  /**
   * Creates a CLTypeOption instance from a JSON representation.
   * @param source - The JSON representation of the CLTypeOption.
   * @returns A new CLTypeOption instance.
   */
  public static fromJSON(source: any): CLTypeOption {
    const inner = CLTypeParser.fromInterface(source);
    return new CLTypeOption(inner);
  }
}
