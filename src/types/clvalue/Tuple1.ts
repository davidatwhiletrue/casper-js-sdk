import { CLTypeTuple1 } from './cltype';
import { CLValue, IResultWithBytes } from './CLValue';
import { CLValueParser } from './Parser';

/**
 * Represents a tuple of one CLValue in the CasperLabs type system.
 */
export class CLValueTuple1 {
  public innerType: CLTypeTuple1;
  private innerVal: CLValue;

  /**
   * Constructs a new CLValueTuple1 instance.
   * @param innerType - The CLTypeTuple1 representing the type of the tuple.
   * @param innerVal - The CLValue contained in the tuple.
   */
  constructor(innerType: CLTypeTuple1, innerVal: CLValue) {
    this.innerType = innerType;
    this.innerVal = innerVal;
  }

  /**
   * Returns the byte representation of the tuple.
   * @returns A Uint8Array representing the bytes of the inner CLValue.
   */
  public bytes(): Uint8Array {
    return this.innerVal.bytes();
  }

  /**
   * Returns a string representation of the tuple.
   * @returns A string representation of the tuple in the format "(value)".
   */
  public toString(): string {
    return `(${this.innerVal.toString()})`;
  }

  /**
   * Returns the value of the tuple.
   * @returns The CLValue contained in the tuple.
   */
  public value(): CLValue {
    return this.innerVal;
  }

  /**
   * Creates a new CLValue instance with a Tuple1 value.
   * @param val - The CLValue to be contained in the tuple.
   * @returns A new CLValue instance with CLTypeTuple1 and a CLValueTuple1.
   */
  public static newCLTuple1(val: CLValue): CLValue {
    const tupleType = new CLTypeTuple1(val.type);
    const clValue = new CLValue(tupleType);
    clValue.tuple1 = new CLValueTuple1(tupleType, val);
    return clValue;
  }

  /**
   * Creates a CLValueTuple1 instance from a Uint8Array.
   * @param source - The Uint8Array containing the byte representation of the Tuple1 value.
   * @param clType - The CLTypeTuple1 representing the type of the tuple.
   * @returns A new CLValueTuple1 instance.
   */
  public static fromBytes(
    source: Uint8Array,
    clType: CLTypeTuple1
  ): IResultWithBytes<CLValueTuple1> {
    const inner = CLValueParser.fromBytesByType(source, clType.inner);

    return {
      result: new CLValueTuple1(clType, inner?.result),
      bytes: inner?.bytes
    };
  }
}
