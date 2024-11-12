import { concat } from '@ethersproject/bytes';

import { TypeID, TypeName, CLType } from './CLType';
import { CLTypeParser } from './Parser';

/**
 * Error thrown when the JSON format for a Result type is invalid.
 */
export const ErrInvalidResultJsonFormat = new Error(
  'invalid json format for Result type'
);

/**
 * Represents a Result type in the CasperLabs type system.
 * This class implements the CLType interface for Result types.
 */
export class CLTypeResult implements CLType {
  /**
   * The CLType of the Ok value in the Result.
   */
  innerOk: CLType;

  /**
   * The CLType of the Err value in the Result.
   */
  innerErr: CLType;

  /**
   * Constructs a new CLTypeResult instance.
   * @param innerOk - The CLType of the Ok value.
   * @param innerErr - The CLType of the Err value.
   */
  constructor(innerOk: CLType, innerErr: CLType) {
    this.innerOk = innerOk;
    this.innerErr = innerErr;
  }

  /**
   * Converts the CLTypeResult to its byte representation.
   * @returns A Uint8Array representing the CLTypeResult, including its type ID and the bytes of its Ok and Err types.
   */
  public toBytes(): Uint8Array {
    return concat([
      Uint8Array.from([this.getTypeID()]),
      this.innerOk.toBytes(),
      this.innerErr.toBytes()
    ]);
  }

  /**
   * Returns a string representation of the CLTypeResult.
   * @returns A string in the format "(Result: Ok(okType), Err(errType))".
   */
  public toString(): string {
    return `(${this.getName()}: Ok(${this.innerOk.getName()}), Err(${this.innerErr.getName()}))`;
  }

  /**
   * Gets the type ID of the CLTypeResult.
   * @returns The TypeID for Result.
   */
  public getTypeID(): TypeID {
    return TypeID.Result;
  }

  /**
   * Gets the name of the CLTypeResult.
   * @returns The TypeName for Result.
   */
  public getName(): TypeName {
    return TypeName.Result;
  }

  /**
   * Converts the CLTypeResult to a JSON representation.
   * @returns An object with a "Result" key containing the Ok and Err types.
   */
  public toJSON(): { [key: string]: { ok: CLType; err: CLType } } {
    return {
      [this.getName()]: {
        ok: this.innerOk.toJSON(),
        err: this.innerErr.toJSON()
      }
    };
  }

  /**
   * Creates a CLTypeResult instance from a JSON representation.
   * @param source - The JSON representation of the CLTypeResult.
   * @returns A new CLTypeResult instance.
   * @throws {ErrInvalidResultJsonFormat} If the JSON structure is invalid.
   */
  public static fromJSON(source: any): CLTypeResult {
    if (typeof source !== 'object' || source === null) {
      throw ErrInvalidResultJsonFormat;
    }

    const okData = source.ok;
    if (okData === undefined) {
      throw ErrInvalidResultJsonFormat;
    }
    const innerOk = CLTypeParser.fromInterface(okData);

    const errData = source.err;
    if (errData === undefined) {
      throw ErrInvalidResultJsonFormat;
    }
    const innerErr = CLTypeParser.fromInterface(errData);

    return new CLTypeResult(innerOk, innerErr);
  }
}
