import { jsonObject } from 'typedjson';
import { Hash } from './Hash';

/**
 * Represents an account hash in the Casper network.
 * Extends the Hash class with additional functionality specific to account hashes.
 */
@jsonObject
export class AccountHash extends Hash {
  /**
   * The prefix of the original hash string, if any.
   */
  private originPrefix: string;

  /**
   * Creates a new AccountHash instance.
   * @param hash - The underlying Hash object.
   * @param originPrefix - The prefix of the original hash string, if any.
   */
  constructor(hash: Hash, originPrefix = '') {
    super(hash.toBytes());
    this.originPrefix = originPrefix;
  }

  /**
   * Creates an AccountHash instance from a string representation.
   * @param source - The string representation of the account hash.
   * @returns A new AccountHash instance.
   */
  public static fromString(source: string): AccountHash {
    let originPrefix = '';
    if (source.length === 66 && source.startsWith('00')) {
      originPrefix = '00';
    } else if (source.startsWith(PrefixNameAccount)) {
      originPrefix = PrefixNameAccount;
    }

    const hexString = source.slice(originPrefix.length);
    const hash = Hash.fromHex(hexString);
    return new AccountHash(hash, originPrefix);
  }

  /**
   * Returns the account hash as a prefixed string.
   * @returns The account hash with the 'account-hash-' prefix.
   */
  public toPrefixedString(): string {
    return PrefixNameAccount + this.toHex();
  }

  /**
   * Converts the AccountHash to its JSON representation.
   * @returns A string representation of the AccountHash, including the original prefix.
   */
  public toJSON(): string {
    return this.originPrefix + this.toHex();
  }

  /**
   * Creates an AccountHash instance from its JSON representation.
   * @param data - The JSON string representation of the AccountHash.
   * @returns A new AccountHash instance.
   * @throws {Error} If the input is not a valid JSON string.
   */
  public static fromJSON(data: string): AccountHash {
    const parsed = JSON.parse(data);
    if (typeof parsed !== 'string') {
      throw new Error('Invalid JSON data for AccountHash');
    }
    return AccountHash.fromString(data);
  }
}

/**
 * The prefix used for account hash strings.
 */
const PrefixNameAccount = 'account-hash-';
