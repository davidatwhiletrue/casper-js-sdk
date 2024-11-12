import { concat } from '@ethersproject/bytes';

import { Hash } from './Hash';
import { PrefixName } from './Key';
import { IResultWithBytes } from '../clvalue';

/**
 * Enum representing the types of byte code.
 */
enum ByteCodeKind {
  EmptyKind = 0,
  V1CasperWasmKind = 1
}

const EmptyPrefix = 'empty-';
const V1WasmPrefix = 'v1-wasm-';

/**
 * Custom error class for ByteCode related errors.
 */
class ByteCodeError extends Error {
  static ErrInvalidByteCodeFormat = new ByteCodeError(
    'Invalid ByteCode format'
  );
  static ErrInvalidByteCodeKind = new ByteCodeError('Invalid ByteCodeKind');

  constructor(message: string) {
    super(message);
    this.name = 'ByteCodeError';
  }
}

/**
 * Represents a byte code in the system.
 */
export class ByteCode {
  private V1CasperWasm?: Hash;
  private isEmpty: boolean;

  /**
   * Creates a new ByteCode instance.
   * @param V1CasperWasm - The V1 Casper WASM hash.
   * @param isEmpty - Whether the byte code is empty.
   */
  constructor(V1CasperWasm?: Hash, isEmpty = false) {
    this.V1CasperWasm = V1CasperWasm;
    this.isEmpty = isEmpty;
  }

  /**
   * Creates a ByteCode from its JSON representation.
   * @param data - The JSON string representation of the ByteCode.
   * @returns A new ByteCode instance.
   * @throws ByteCodeError.ErrInvalidByteCodeFormat if the format is invalid.
   */
  static fromJSON(data: string): ByteCode {
    if (data.startsWith(V1WasmPrefix)) {
      return new ByteCode(Hash.fromHex(data.replace(V1WasmPrefix, '')));
    } else if (data.startsWith(EmptyPrefix)) {
      return new ByteCode(undefined, true);
    } else {
      throw ByteCodeError.ErrInvalidByteCodeFormat;
    }
  }

  /**
   * Converts the ByteCode to its JSON representation.
   * @returns The JSON string representation of the ByteCode.
   */
  toJSON(): string {
    return this.toPrefixedString();
  }

  /**
   * Checks if the ByteCode is empty.
   * @returns True if the ByteCode is empty, false otherwise.
   */
  isEmptyCode(): boolean {
    return this.isEmpty;
  }

  /**
   * Returns a prefixed string representation of the ByteCode.
   * @returns The prefixed string representation.
   * @throws Error if the ByteCode type is unexpected.
   */
  toPrefixedString(): string {
    if (this.V1CasperWasm) {
      return PrefixName.ByteCode + V1WasmPrefix + this.V1CasperWasm.toHex();
    } else if (this.isEmpty) {
      const emptyHash = Hash.fromBytes(new Uint8Array(Hash.ByteHashLen).fill(0))
        ?.result;
      return PrefixName.ByteCode + EmptyPrefix + emptyHash.toHex();
    } else {
      throw new Error('Unexpected ByteCode type');
    }
  }

  /**
   * Creates a ByteCode from a byte array.
   * @param bytes - The byte array.
   * @returns A new ByteCode instance.
   * @throws ByteCodeError.ErrInvalidByteCodeFormat if the format is invalid.
   */
  static fromBytes(bytes: Uint8Array): IResultWithBytes<ByteCode> {
    const tag = bytes[0];
    const kind = this.newByteCodeKindFromByte(tag);
    switch (kind) {
      case ByteCodeKind.EmptyKind:
        return { result: new ByteCode(undefined, true), bytes };
      case ByteCodeKind.V1CasperWasmKind:
        const wasmHash = Hash.fromBytes(
          bytes.subarray(1, Hash.ByteHashLen + 1)
        );
        return {
          result: new ByteCode(wasmHash?.result),
          bytes: wasmHash?.bytes
        };
      default:
        throw ByteCodeError.ErrInvalidByteCodeFormat;
    }
  }

  /**
   * Converts a byte to a ByteCodeKind.
   * @param tag - The byte to convert.
   * @returns The corresponding ByteCodeKind.
   * @throws ByteCodeError.ErrInvalidByteCodeKind if the byte doesn't correspond to a valid ByteCodeKind.
   */
  static newByteCodeKindFromByte(tag: number): ByteCodeKind {
    if (tag in ByteCodeKind) {
      return tag as ByteCodeKind;
    }
    throw ByteCodeError.ErrInvalidByteCodeKind;
  }

  /**
   * Converts the ByteCode to a byte array.
   * @returns The byte array representation of the ByteCode.
   * @throws Error if the ByteCode type is unexpected.
   */
  toBytes(): Uint8Array {
    if (this.V1CasperWasm) {
      const kindBytes = new Uint8Array([ByteCodeKind.V1CasperWasmKind]);
      const wasmBytes = this.V1CasperWasm.toBytes();

      return concat([kindBytes, wasmBytes]);
    } else if (this.isEmpty) {
      return new Uint8Array([ByteCodeKind.EmptyKind]);
    } else {
      throw new Error('Unexpected ByteCode type');
    }
  }
}
