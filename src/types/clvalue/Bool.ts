import { CLTypeBool } from './cltype';
import { CLValue, IResultWithBytes } from './CLValue';

/**
 * Represents a boolean value in the CasperLabs type system.
 */
export class CLValueBool {
  private value: boolean;

  /**
   * Constructs a new CLValueBool instance.
   * @param value - The boolean value to be stored.
   */
  constructor(value: boolean) {
    this.value = value;
  }

  /**
   * Returns the byte representation of the boolean value.
   * @returns A Uint8Array with a single byte: 1 for true, 0 for false.
   */
  public bytes(): Uint8Array {
    return new Uint8Array([this.value ? 1 : 0]);
  }

  /**
   * Returns a string representation of the boolean value.
   * @returns The string 'true' or 'false'.
   */
  public toString(): string {
    return this.value ? 'true' : 'false';
  }

  /**
   * Returns the boolean value.
   * @returns The stored boolean value.
   */
  public getValue(): boolean {
    return this.value;
  }

  /**
   * Creates a new CLValue instance with a boolean value.
   * @param val - The boolean value to be stored in the CLValue.
   * @returns A new CLValue instance containing the boolean value.
   */
  public static fromBoolean(val: boolean): CLValue {
    const res = new CLValue(CLTypeBool);
    res.bool = new CLValueBool(val);
    return res;
  }

  /**
   * Creates a CLValueBool instance from a Uint8Array.
   * @param source - The Uint8Array containing the byte representation of the boolean value.
   * @returns A new CLValueBool instance.
   * @throws Will throw an error if the source array is empty.
   */
  public static fromBytes(source: Uint8Array): IResultWithBytes<CLValueBool> {
    if (source.length === 0) {
      throw new Error('Empty byte array');
    }

    if (source[0] === 1) {
      return { result: new CLValueBool(true), bytes: source.subarray(1) };
    } else if (source[0] === 0) {
      return { result: new CLValueBool(false), bytes: source.subarray(1) };
    } else {
      throw new Error('Invalid bool value');
    }
  }
}
