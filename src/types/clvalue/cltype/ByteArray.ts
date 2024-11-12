import { concat } from '@ethersproject/bytes';

import { CLType, TypeID, TypeName } from './CLType';
import { toBytesU32 } from '../../ByteConverters';

/**
 * Represents a ByteArray type in the CasperLabs type system.
 * This type is used for fixed-size byte arrays.
 */
export class CLTypeByteArray implements CLType {
  public size: number;

  /**
   * Constructs a new CLTypeByteArray instance.
   * @param size - The size of the byte array.
   */
  constructor(size: number) {
    this.size = size;
  }

  /**
   * Converts the CLTypeByteArray to its byte representation.
   * @returns A Uint8Array representing the CLTypeByteArray, including its type ID and size.
   */
  public toBytes(): Uint8Array {
    return concat([Uint8Array.from([this.getTypeID()]), toBytesU32(this.size)]);
  }

  /**
   * Returns a string representation of the CLTypeByteArray.
   * @returns A string in the format "ByteArray: size".
   */
  public toString(): string {
    return `${this.getName()}: ${this.size}`;
  }

  /**
   * Gets the type ID of the CLTypeByteArray.
   * @returns The TypeID for ByteArray.
   */
  public getTypeID(): TypeID {
    return TypeID.ByteArray;
  }

  /**
   * Gets the name of the CLTypeByteArray.
   * @returns The TypeName for ByteArray.
   */
  public getName(): TypeName {
    return TypeName.ByteArray;
  }

  /**
   * Gets the size of the byte array.
   * @returns The size of the byte array.
   */
  public getSize(): number {
    return this.size;
  }

  /**
   * Converts the CLTypeByteArray to a JSON representation.
   * @returns An object with a single key-value pair, where the key is "ByteArray" and the value is the size.
   */
  public toJSON(): { [key: string]: number } {
    return { [this.getName()]: this.size };
  }

  /**
   * Creates a CLTypeByteArray instance from a JSON representation.
   * @param source - The JSON representation of the CLTypeByteArray.
   * @returns A new CLTypeByteArray instance.
   * @throws Will throw an error if the source is not a number.
   */
  public static fromJSON(source: any): CLTypeByteArray {
    if (typeof source !== 'number') {
      throw new Error('Invalid JSON parsing to ByteArray type');
    }
    return new CLTypeByteArray(source);
  }
}
