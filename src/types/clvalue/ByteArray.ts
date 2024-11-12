import { CLTypeByteArray } from './cltype';
import { CLValue, IResultWithBytes } from './CLValue';

/**
 * Represents a byte array value in the CasperLabs type system.
 */
export class CLValueByteArray {
  private data: Uint8Array;

  /**
   * Constructs a new CLValueByteArray instance.
   * @param data - The Uint8Array to be stored in the CLValueByteArray.
   */
  constructor(data: Uint8Array) {
    this.data = data;
  }

  /**
   * Returns the byte representation of the byte array.
   * @returns A Uint8Array representing the bytes of the byte array.
   */
  public bytes(): Uint8Array {
    return this.data;
  }

  /**
   * Returns a hexadecimal string representation of the byte array.
   * @returns A string representing the byte array in hexadecimal format.
   */
  public toString(): string {
    return Array.from(this.data, byte =>
      byte.toString(16).padStart(2, '0')
    ).join('');
  }

  /**
   * Creates a new CLValue instance with a ByteArray value.
   * @param val - The Uint8Array to be stored in the CLValue.
   * @returns A new CLValue instance containing the ByteArray.
   */
  public static newCLByteArray(val: Uint8Array): CLValue {
    const byteArrayType = new CLTypeByteArray(val.length);
    const clValueByteArray = new CLValue(byteArrayType);

    clValueByteArray.byteArray = new CLValueByteArray(val);
    return clValueByteArray;
  }

  /**
   * Creates a CLValueByteArray instance from a Uint8Array.
   * @param data - The Uint8Array containing the byte representation of the ByteArray value.
   * @param clType - The CLTypeByteArray representing the type of the ByteArray.
   * @returns A new CLValueByteArray instance.
   */
  public static fromBytes(
    data: Uint8Array,
    clType: CLTypeByteArray
  ): IResultWithBytes<CLValueByteArray> {
    const byteArray = data.subarray(0, clType.size);
    return {
      result: new CLValueByteArray(byteArray),
      bytes: data.subarray(clType.size)
    };
  }
}
