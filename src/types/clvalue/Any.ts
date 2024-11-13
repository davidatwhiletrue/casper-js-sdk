import { CLTypeAny } from './cltype';
import { CLValue } from './CLValue';

/**
 * Represents an 'Any' value in the Casper type system.
 * This type can store any arbitrary data as a byte array, making it highly flexible.
 */
export class CLValueAny {
  private data: Uint8Array;

  /**
   * Initializes a new instance of the CLValueAny class.
   * @param data - The Uint8Array to be stored as the 'Any' value.
   */
  constructor(data: Uint8Array) {
    this.data = data;
  }

  /**
   * Retrieves the byte representation of the 'Any' value.
   * @returns A Uint8Array representing the stored data.
   */
  public bytes(): Uint8Array {
    return this.data;
  }

  /**
   * Provides a string representation of the 'Any' value.
   * The byte array is decoded as a UTF-8 string.
   * @returns A string decoded from the stored byte array.
   */
  public toString(): string {
    return new TextDecoder().decode(this.data);
  }

  /**
   * Creates a new CLValue instance containing an 'Any' value.
   * @param data - The Uint8Array to be stored within the CLValue.
   * @returns A new CLValue instance encapsulating the 'Any' value.
   */
  public static newCLAny(data: Uint8Array): CLValue {
    const res = new CLValue(CLTypeAny);
    res.any = new CLValueAny(data);
    return res;
  }
}
