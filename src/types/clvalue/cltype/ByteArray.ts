import { concat } from '@ethersproject/bytes';
import { CLType, TypeID, TypeName } from './CLType';
import { toBytesU32 } from '../../ByteConverters';

/**
 * Represents a fixed-size ByteArray type within the Casper type system.
 * This class allows for defining a ByteArray with a specific size, and includes methods
 * to handle its serialization, string representation, and conversion to JSON format.
 */
export class CLTypeByteArray implements CLType {
  public size: number;

  /**
   * Initializes a new instance of the CLTypeByteArray class.
   * @param size - Specifies the fixed size of the byte array.
   */
  constructor(size: number) {
    this.size = size;
  }

  /**
   * Converts the CLTypeByteArray instance into a byte representation.
   * This includes the type ID and the size of the byte array.
   * @returns A Uint8Array that represents the CLTypeByteArray.
   */
  public toBytes(): Uint8Array {
    return concat([Uint8Array.from([this.getTypeID()]), toBytesU32(this.size)]);
  }

  /**
   * Provides a human-readable string representation of the CLTypeByteArray.
   * @returns A string in the format "ByteArray: size".
   */
  public toString(): string {
    return `${this.getName()}: ${this.size}`;
  }

  /**
   * Retrieves the unique type identifier (TypeID) for the ByteArray.
   * @returns TypeID for ByteArray.
   */
  public getTypeID(): TypeID {
    return TypeID.ByteArray;
  }

  /**
   * Retrieves the name of this type as defined in the Casper system.
   * @returns TypeName for ByteArray.
   */
  public getName(): TypeName {
    return TypeName.ByteArray;
  }

  /**
   * Gets the fixed size of the byte array.
   * @returns The size of the byte array.
   */
  public getSize(): number {
    return this.size;
  }

  /**
   * Converts the CLTypeByteArray instance to a JSON-compatible representation.
   * The JSON object contains a single key-value pair, where the key is "ByteArray"
   * and the value is the size of the array.
   * @returns An object with the ByteArray size.
   */
  public toJSON(): { [key: string]: number } {
    return { [this.getName()]: this.size };
  }

  /**
   * Constructs a CLTypeByteArray instance from a JSON representation.
   * @param source - The JSON input containing the size of the ByteArray.
   * @returns A new CLTypeByteArray instance.
   * @throws Will throw an error if the input type is not a number.
   */
  public static fromJSON(source: any): CLTypeByteArray {
    if (typeof source !== 'number') {
      throw new Error('Invalid JSON parsing to ByteArray type');
    }
    return new CLTypeByteArray(source);
  }
}
