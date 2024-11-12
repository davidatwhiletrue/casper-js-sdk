import { jsonMember, jsonObject } from 'typedjson';
import { EntityAddr } from './EntityAddr';
import { PrefixName } from './Key';
import { IResultWithBytes } from '../clvalue';

/**
 * Represents a named key address, identified by a base entity address and a name.
 */
@jsonObject
export class NamedKeyAddr {
  /**
   * The base address of the entity.
   */
  @jsonMember({ name: 'BaseAddr', constructor: EntityAddr })
  baseAddr: EntityAddr;

  /**
   * The bytes representing the name associated with the address.
   */
  @jsonMember({ name: 'NameBytes', constructor: Uint8Array })
  nameBytes: Uint8Array;

  /**
   * Creates an instance of NamedKeyAddr.
   * @param baseAddr - The base address of the entity.
   * @param nameBytes - The bytes representing the name.
   */
  constructor(baseAddr: EntityAddr, nameBytes: Uint8Array) {
    this.baseAddr = baseAddr;
    this.nameBytes = nameBytes;
  }

  /**
   * Creates a NamedKeyAddr instance from a string representation.
   * @param source - The string representation of the NamedKeyAddr.
   * @returns A new NamedKeyAddr instance.
   * @throws Error if the name bytes length is not valid.
   */
  static fromString(source: string): NamedKeyAddr {
    const nameBytesData = source.substring(source.lastIndexOf('-') + 1);
    const baseAddrSource = source
      .substring(0, source.lastIndexOf('-'))
      .replace(PrefixName.AddressableEntity, '');

    const nameBytes = Buffer.from(nameBytesData, 'hex');
    if (nameBytes.length !== 32) {
      throw new Error('Invalid NameBytes length, expected 32 bytes.');
    }

    const baseAddr = EntityAddr.fromPrefixedString(baseAddrSource);
    return new NamedKeyAddr(baseAddr, nameBytes);
  }

  /**
   * Converts the NamedKeyAddr to a prefixed string representation.
   * @returns A prefixed string representation of the NamedKeyAddr.
   */
  toPrefixedString(): string {
    return `${
      PrefixName.NamedKey
    }${this.baseAddr.toPrefixedString()}-${Buffer.from(this.nameBytes).toString(
      'hex'
    )}`;
  }

  /**
   * Converts the NamedKeyAddr to a JSON-compatible string.
   * @returns A JSON string representation of the NamedKeyAddr.
   */
  toJSON(): string {
    return this.toPrefixedString();
  }

  /**
   * Creates a NamedKeyAddr instance from a byte array.
   * @param bytes - The byte array representing the NamedKeyAddr.
   * @returns A new NamedKeyAddr instance.
   * @throws Error if the byte array is shorter than expected.
   */
  static fromBytes(bytes: Uint8Array): IResultWithBytes<NamedKeyAddr> {
    const baseAddr = EntityAddr.fromBytes(bytes);

    if (bytes.length < 32) {
      throw new Error('It does not contain enough bytes for NameBytes.');
    }
    const nameBytes = bytes.slice(0, 32);
    return {
      result: new NamedKeyAddr(baseAddr?.result, nameBytes),
      bytes: baseAddr?.bytes
    };
  }

  /**
   * Converts the NamedKeyAddr to a byte array representation.
   * @returns A Uint8Array representing the NamedKeyAddr.
   */
  toBytes(): Uint8Array {
    return Buffer.concat([this.baseAddr.toBytes(), this.nameBytes]);
  }
}
