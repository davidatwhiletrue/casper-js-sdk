import { CLTypeUnit } from './cltype';
import { CLValue, IResultWithBytes } from './CLValue';

/**
 * Represents a Unit value in the CasperLabs type system.
 * A Unit value is similar to 'null' or 'void' in other languages.
 */
export class CLValueUnit {
  private obj: null;

  /**
   * Constructs a new CLValueUnit instance.
   */
  constructor() {
    this.obj = null;
  }

  /**
   * Returns the byte representation of the Unit value.
   * For Unit type, this is always an empty array.
   *
   * @returns An empty Uint8Array.
   */
  public bytes(): Uint8Array {
    return Uint8Array.from([]);
  }

  /**
   * Returns a string representation of the Unit value.
   *
   * @returns The string 'null' to represent the Unit value.
   */
  public toString(): string {
    return 'null'; // Representation for a 'nil' or 'Unit' type
  }

  /**
   * Returns the value of the Unit type.
   *
   * @returns Always returns null.
   */
  public getValue(): null {
    return this.obj;
  }

  /**
   * Creates a new CLValue instance with a Unit value.
   *
   * @returns A new CLValue instance with CLTypeUnit and a CLValueUnit.
   */
  public static newCLUnit(): CLValue {
    const res = new CLValue(CLTypeUnit);
    res.unit = new CLValueUnit();
    return res;
  }

  /**
   * Creates a CLValueUnit instance from a byte array.
   *
   * @param source - The source Uint8Array.
   * @returns A new CLValueUnit instance.
   * @throws Will throw an error if the source is not empty.
   */
  public static fromBytes(source: Uint8Array): IResultWithBytes<CLValueUnit> {
    if (source.byteLength > 0) {
      throw new Error('Byte source for Unit type should be empty');
    }

    return { result: new CLValueUnit(), bytes: source };
  }
}
