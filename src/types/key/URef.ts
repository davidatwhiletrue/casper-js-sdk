import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';
import { IResultWithBytes } from '../clvalue';
import { Conversions } from '../Conversions';
import { concat } from '@ethersproject/bytes';

/**
 * Enum representing the access permissions of a URef.
 */
export enum UrefAccess {
  None = 0,
  Read,
  Write,
  Add,
  ReadWrite,
  ReadAdd,
  AddWrite,
  ReadAddWrite
}

/** Error thrown when the URef format is incorrect. */
export const ErrIncorrectUrefFormat = new Error('incorrect uref format');

/** Prefix for URef strings. */
export const PrefixNameURef = 'uref-';

/** Length of a URef hash in bytes. */
export const ByteHashLen = 32;

/**
 * Represents an Unforgeable Reference (URef) with associated access permissions.
 */
@jsonObject
export class URef {
  /** The data (hash) of the URef. */
  @jsonArrayMember(Number)
  data: Uint8Array;

  /** The access permissions for the URef. */
  @jsonMember({ constructor: Number })
  access: UrefAccess;

  /**
   * Creates an instance of URef.
   * @param data - The data (hash) of the URef.
   * @param access - The access permissions for the URef.
   * @throws Error if the data length is not equal to `ByteHashLen`.
   */
  constructor(data: Uint8Array, access: UrefAccess) {
    if (data.length !== ByteHashLen) {
      throw new Error(`Invalid URef data length; expected ${ByteHashLen}`);
    }

    if (!Object.values(UrefAccess).includes(access)) {
      throw new Error('Unsuported AccessRights');
    }

    this.data = data;
    this.access = access;
  }

  /**
   * Converts the URef to a byte array representation.
   * @returns A Uint8Array representing the URef.
   */
  bytes(): Uint8Array {
    const accessBytes = new Uint8Array([this.access]);
    return concat([this.data, accessBytes]);
  }

  /**
   * Converts the URef to a prefixed string representation.
   * @returns A string with the URef prefix, data in hex, and access in hex format.
   */
  toPrefixedString(): string {
    return [PrefixNameURef.replace('-', ''), this.toString()].join('-');
  }

  toString(): string {
    return [
      Conversions.encodeBase16(this.data),
      new Array(3).join('0').slice((3 || 2) * -1) + this.access.toString(8)
    ].join('-');
  }

  /**
   * Sets the access permissions for the URef.
   * @param access - The new access permission to set.
   */
  setAccess(access: UrefAccess) {
    this.access = access;
  }

  /**
   * Converts the URef to a JSON-compatible string.
   * @returns A JSON string representation of the URef.
   */
  toJSON(): string {
    return this.toPrefixedString();
  }

  /**
   * Creates a URef from a JSON string.
   * @param data - The JSON string representation of the URef.
   * @returns A new URef instance.
   */
  static fromJSON(data: string): URef {
    return URef.fromString(data);
  }

  /**
   * Parses a URef from a string representation.
   * @param source - The string containing the URef data.
   * @returns A new URef instance.
   * @throws ErrIncorrectUrefFormat if the format is invalid.
   */
  static fromString(source: string): URef {
    if (!source.startsWith(`${PrefixNameURef}`)) {
      throw new Error("Prefix is not 'uref-'");
    }

    const parts = source.substring(`${PrefixNameURef}`.length).split('-', 2);

    if (parts.length !== 2) {
      throw ErrIncorrectUrefFormat;
    }
    const data = Conversions.decodeBase16(parts[0]);
    const access = parseInt(parts[1], 8);
    return new URef(data, access as UrefAccess);
  }

  /**
   * Creates a URef from a byte array.
   * @param bytes - The byte array representing the URef.
   * @returns A new URef instance.
   * @throws Error if the byte array length is invalid.
   */
  static fromBytes(bytes: Uint8Array): IResultWithBytes<URef> {
    if (bytes.length !== ByteHashLen + 1) {
      throw new Error('Invalid URef bytes length');
    }
    const data = bytes.subarray(0, ByteHashLen);
    const access = bytes[ByteHashLen];
    return {
      result: new URef(data, access as UrefAccess),
      bytes: bytes.subarray(ByteHashLen + 1)
    };
  }

  /**
   * Returns the byte array representation of the URef, used as a driver value.
   * @returns A Uint8Array representing the URef.
   */
  toDriverValue(): Uint8Array {
    return this.bytes();
  }

  /**
   * Creates a URef from an ArrayBuffer.
   * @param arrayBuffer - The ArrayBuffer containing the URef data.
   * @returns A new URef instance.
   * @throws Error if the ArrayBuffer size is too small.
   */
  public static fromBuffer(arrayBuffer: ArrayBuffer): URef {
    const dataView = new DataView(arrayBuffer);

    if (dataView.byteLength < ByteHashLen + 1) {
      throw new Error('ArrayBuffer size is too small');
    }

    const data = new Uint8Array(arrayBuffer.slice(0, ByteHashLen));
    const access = dataView.getUint8(ByteHashLen);

    return new URef(data, access);
  }
}
