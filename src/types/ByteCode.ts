import { jsonMember, jsonObject } from 'typedjson';
import { HexBytes } from './HexBytes';

/**
 * Represents the system's bytecode with its type and raw bytes.
 */
@jsonObject
export class SystemByteCode {
  /**
   * The type of the bytecode, represented as a string.
   */
  @jsonMember({
    constructor: String
  })
  kind: string;

  /**
   * The raw bytecode data in hexadecimal format.
   */
  @jsonMember({
    constructor: HexBytes,
    deserializer: json => HexBytes.fromJSON(json),
    serializer: (value: HexBytes) => value.toJSON()
  })
  bytes: HexBytes;

  /**
   * Creates an instance of SystemByteCode.
   * @param kind - The type of the bytecode.
   * @param bytes - The bytecode data in hexadecimal format.
   */
  constructor(kind: string, bytes: HexBytes) {
    this.kind = kind;
    this.bytes = bytes;
  }

  /**
   * Checks if the bytecode kind is empty or undefined.
   * @returns `true` if the kind is "Empty" or not set; otherwise, `false`.
   */
  public isEmpty(): boolean {
    return this.kind === 'Empty' || !this.kind;
  }

  /**
   * Checks if the bytecode kind is of type "V1CasperWasm".
   * @returns `true` if the kind is "V1CasperWasm"; otherwise, `false`.
   */
  public isV1CasperWasm(): boolean {
    return this.kind === 'V1CasperWasm';
  }

  /**
   * Returns a string representation of the bytecode kind.
   * @returns The kind of the bytecode as a string.
   */
  public toString(): string {
    return this.kind;
  }
}
