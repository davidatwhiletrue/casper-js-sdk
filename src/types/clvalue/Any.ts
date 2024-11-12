import { CLTypeAny } from './cltype';
import { CLValue } from './CLValue';

/**
 * Represents an 'Any' value in the CasperLabs type system.
 * This type can hold any arbitrary data as a byte array.
 */
export class CLValueAny {
  private data: Uint8Array;

  /**
   * Constructs a new CLValueAny instance.
   * @param data - The Uint8Array to be stored as the 'Any' value.
   */
  constructor(data: Uint8Array) {
    this.data = data;
  }

  /**
   * Returns the byte representation of the 'Any' value.
   * @returns A Uint8Array representing the stored data.
   */
  public bytes(): Uint8Array {
    return this.data;
  }

  /**
   * Returns a string representation of the 'Any' value.
   * @returns A string decoded from the stored byte array using UTF-8 encoding.
   */
  public toString(): string {
    return new TextDecoder().decode(this.data);
  }

  /**
   * Creates a new CLValue instance with an 'Any' value.
   * @param data - The Uint8Array to be stored in the CLValue.
   * @returns A new CLValue instance containing the 'Any' value.
   */
  public static newCLAny(data: Uint8Array): CLValue {
    const res = new CLValue(CLTypeAny);
    res.any = new CLValueAny(data);
    return res;
  }
}
