import { jsonObject, jsonMember } from 'typedjson';
import { Hash } from './Hash';

/**
 * The prefix used for addressable entity hashes.
 */
const PrefixAddressableEntity = 'addressable-entity-';

/**
 * Represents an addressable entity hash in the Casper network.
 * Extends the Hash class with additional functionality specific to addressable entity hashes.
 */
@jsonObject
export class AddressableEntityHash extends Hash {
  /**
   * The prefix of the original hash string, if any.
   */
  @jsonMember({ constructor: String })
  originPrefix: string;

  /**
   * Creates a new AddressableEntityHash instance.
   * @param hashBytes - The byte array representing the hash.
   * @param originPrefix - The prefix of the original hash string. Defaults to PrefixAddressableEntity.
   */
  constructor(
    hashBytes: Uint8Array,
    originPrefix: string = PrefixAddressableEntity
  ) {
    super(hashBytes);
    this.originPrefix = originPrefix;
  }

  /**
   * Creates an AddressableEntityHash instance from a hexadecimal string.
   * @param source - The hexadecimal string representation of the hash.
   * @returns A new AddressableEntityHash instance.
   */
  static fromHex(source: string): AddressableEntityHash {
    const originPrefix = source.startsWith(PrefixAddressableEntity)
      ? PrefixAddressableEntity
      : '';
    const hexBytes = Hash.fromHex(source.replace(originPrefix, ''));
    return new AddressableEntityHash(hexBytes.toBytes(), originPrefix);
  }

  /**
   * Returns the addressable entity hash as a prefixed string.
   * @returns The hash with the 'addressable-entity-' prefix.
   */
  toPrefixedString(): string {
    return `${PrefixAddressableEntity}${this.toHex()}`;
  }

  /**
   * Converts the AddressableEntityHash to its JSON representation.
   * @returns A string representation of the AddressableEntityHash, including the original prefix.
   */
  toJSON(): string {
    return `${this.originPrefix}${this.toHex()}`;
  }

  /**
   * Creates an AddressableEntityHash instance from its JSON representation.
   * @param json - The JSON string representation of the AddressableEntityHash.
   * @returns A new AddressableEntityHash instance.
   */
  static fromJSON(json: string): AddressableEntityHash {
    return AddressableEntityHash.fromHex(json);
  }
}
