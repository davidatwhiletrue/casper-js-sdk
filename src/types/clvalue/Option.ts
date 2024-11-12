import { concat } from '@ethersproject/bytes';

import { CLTypeOption } from './cltype';
import { CLValue, IResultWithBytes } from './CLValue';
import { CLValueParser } from './Parser';
import { CLValueUInt8 } from './Uint8';

/**
 * Represents an optional value in the CasperLabs type system.
 * An option can either contain a value or be empty.
 */
export class CLValueOption {
  public type?: CLTypeOption;
  public inner: CLValue | null;

  /**
   * Constructs a new CLValueOption instance.
   * @param inner - The CLValue contained in the option, or null if empty.
   * @param type - The CLTypeOption representing the type of the option.
   */
  constructor(inner: CLValue | null, type?: CLTypeOption) {
    this.type = type;
    this.inner = inner;
  }

  /**
   * Returns the byte representation of the option.
   * @returns A Uint8Array representing the bytes of the option.
   * If the option is empty, it returns [0]. Otherwise, it returns [1] followed by the inner value's bytes.
   */
  public bytes(): Uint8Array {
    if (this.isEmpty()) {
      return Uint8Array.from([0]);
    }
    const innerBytes = this.inner!.bytes();
    return concat([Uint8Array.from([1]), innerBytes]);
  }

  /**
   * Returns a string representation of the option.
   * @returns An empty string if the option is empty, otherwise the string representation of the inner value.
   */
  public toString(): string {
    if (this.isEmpty()) {
      return '';
    }
    return this.inner!.toString();
  }

  /**
   * Checks if the option is empty.
   * @returns true if the option is empty, false otherwise.
   */
  public isEmpty(): boolean {
    return this.inner === null;
  }

  /**
   * Returns the inner value of the option.
   * @returns The inner CLValue if the option is not empty, null otherwise.
   */
  public value(): CLValue | null {
    return this.inner;
  }

  /**
   * Creates a new CLValue instance with an Option value.
   * @param inner - The CLValue to be contained in the option.
   * @returns A new CLValue instance with CLTypeOption and a CLValueOption.
   */
  public static newCLOption(inner: CLValue): CLValue {
    const optionType = new CLTypeOption(inner.type);
    const clValue = new CLValue(optionType);
    clValue.option = new CLValueOption(inner, optionType);
    return clValue;
  }

  /**
   * Creates a CLValueOption instance from a Uint8Array.
   * @param source - The Uint8Array containing the byte representation of the Option value.
   * @param clType - The CLTypeOption representing the type of the option.
   * @returns A new CLValueOption instance or null if parsing fails.
   */
  public static fromBytes(
    source: Uint8Array,
    clType: CLTypeOption
  ): IResultWithBytes<CLValueOption> {
    const { result: u8, bytes: u8Bytes } = CLValueUInt8.fromBytes(source);
    const optionTag = u8.getValue();

    if (optionTag === 0) {
      return { result: new CLValueOption(null, clType), bytes: u8Bytes };
    }

    const inner = CLValueParser.fromBytesByType(u8Bytes, clType.inner);

    return {
      result: new CLValueOption(inner.result, clType),
      bytes: inner.bytes
    };
  }
}
