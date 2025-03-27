import { concat } from '@ethersproject/bytes';
import { TypeID, TypeName, CLType } from './CLType';
import { CLTypeParser } from './Parser';

/**
 * Represents an Option type in the Casper type system.
 * This class implements the CLType interface, allowing for optional values with specified inner types.
 */
export class CLTypeOption implements CLType {
  /**
   * The inner CLType that this Option may contain.
   */
  public inner: CLType;

  /**
   * Initializes a new instance of the CLTypeOption class.
   * @param inner - The CLType of the value that this Option can contain.
   */
  constructor(inner: CLType) {
    this.inner = inner;
  }

  /**
   * Converts the CLTypeOption instance to its byte representation.
   * This includes the type ID for Option followed by the byte representation of the inner type.
   * @returns A Uint8Array representing the CLTypeOption.
   */
  public toBytes(): Uint8Array {
    return concat([Uint8Array.from([this.getTypeID()]), this.inner.toBytes()]);
  }

  /**
   * Provides a string representation of the CLTypeOption.
   * @returns A string in the format "(Option: innerType)".
   */
  public toString(): string {
    return `(${this.getName()}: ${this.inner.getName()})`;
  }

  /**
   * Retrieves the type ID of the CLTypeOption.
   * @returns The TypeID associated with Option.
   */
  public getTypeID(): TypeID {
    return TypeID.Option;
  }

  /**
   * Retrieves the name of the CLTypeOption.
   * @returns The TypeName for Option.
   */
  public getName(): TypeName {
    return TypeName.Option;
  }

  /**
   * Converts the CLTypeOption instance to a JSON-compatible representation.
   * The JSON object includes a single key-value pair, where the key is "Option" and the value is the JSON representation of the inner type.
   * @returns A JSON object representing the option type and its inner type.
   */
  public toJSON(): { [key: string]: CLType } {
    return { [this.getName()]: this.inner.toJSON() };
  }

  /**
   * Creates a CLTypeOption instance from a JSON representation.
   * Parses JSON input to determine the inner type of the option.
   * @param source - The JSON representation of the CLTypeOption.
   * @returns A new CLTypeOption instance with the parsed inner type.
   */
  public static fromJSON(source: any): CLTypeOption {
    const inner = CLTypeParser.fromInterface(source);
    return new CLTypeOption(inner);
  }
}
