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
 * Represents a Result type in the Casper type system.
 * This class implements the CLType interface, allowing for Result types with defined Ok and Err types.
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
   * Initializes a new instance of the CLTypeResult class.
   * @param innerOk - The CLType of the Ok value.
   * @param innerErr - The CLType of the Err value.
   */
  constructor(innerOk: CLType, innerErr: CLType) {
    this.innerOk = innerOk;
    this.innerErr = innerErr;
  }

  /**
   * Converts the CLTypeResult instance to its byte representation.
   * This includes the type ID for Result, followed by the byte representations of the Ok and Err types.
   * @returns A Uint8Array representing the CLTypeResult.
   */
  public toBytes(): Uint8Array {
    return concat([
      Uint8Array.from([this.getTypeID()]),
      this.innerOk.toBytes(),
      this.innerErr.toBytes()
    ]);
  }

  /**
   * Provides a string representation of the CLTypeResult.
   * @returns A string in the format "(Result: Ok(okType), Err(errType))".
   */
  public toString(): string {
    return `(${this.getName()}: Ok(${this.innerOk.getName()}), Err(${this.innerErr.getName()}))`;
  }

  /**
   * Retrieves the type ID of the CLTypeResult.
   * @returns The TypeID associated with Result.
   */
  public getTypeID(): TypeID {
    return TypeID.Result;
  }

  /**
   * Retrieves the name of the CLTypeResult.
   * @returns The TypeName for Result.
   */
  public getName(): TypeName {
    return TypeName.Result;
  }

  /**
   * Converts the CLTypeResult instance to a JSON-compatible representation.
   * The JSON object includes a "Result" key containing the JSON representations of the Ok and Err types.
   * @returns A JSON object representing the Result type and its Ok and Err types.
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
   * Parses JSON input to determine the Ok and Err types for the Result.
   * @param source - The JSON representation of the CLTypeResult.
   * @returns A new CLTypeResult instance with parsed Ok and Err types.
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
