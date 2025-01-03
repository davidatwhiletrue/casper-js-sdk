import { BigNumber, BigNumberish } from '@ethersproject/bignumber';

/**
 * Abstract class representing a numeric value in the Casper type system.
 * Provides common methods and properties for numeric types.
 */
export abstract class CLValueNumeric {
  protected value: BigNumber;

  /**
   * The constructor is protected to ensure this class cannot be instantiated directly.
   * Subclasses can call this constructor using `super`.
   */
  protected constructor(value: BigNumberish) {
    this.value = BigNumber.from(value);
  }

  /**
   * Converts the numeric value to its byte representation.
   * Must be implemented by subclasses.
   */
  public abstract bytes(): Uint8Array;

  /**
   * Provides a string representation of the numeric value.
   * @returns The string representation of the value.
   */
  public toString(): string {
    return this.value.toString();
  }

  /**
   * Converts the numeric value to a JavaScript number.
   * @returns The numeric value as a JavaScript number.
   */
  public toNumber(): number {
    return this.value.toNumber();
  }

  /**
   * Converts the instance to a JSON-compatible string.
   * @returns {string} The string representation of the instance.
   */
  public toJSON(): string {
    return this.toString();
  }

  /**
   * Retrieves the numeric value.
   * @returns The numeric representation of the value.
   */
  public getValue(): BigNumber {
    return this.value;
  }
}
