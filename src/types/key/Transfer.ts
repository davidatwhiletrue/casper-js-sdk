import { jsonMember, jsonObject } from 'typedjson';
import { Hash } from './Hash';

/** Prefix for transfer hashes in TransferHash. */
export const PrefixNameTransfer = 'transfer-';

/**
 * Represents a transfer hash, extending the Hash class, with an additional prefix for transfer entities.
 */
@jsonObject
export class TransferHash extends Hash {
  /**
   * The origin prefix used to identify transfer-related hashes.
   */
  @jsonMember({ name: 'originPrefix', constructor: String })
  originPrefix: string = PrefixNameTransfer;

  /**
   * Creates an instance of TransferHash.
   * @param source - A hex string or Uint8Array representing the hash.
   */
  constructor(source: string | Uint8Array) {
    if (typeof source === 'string') {
      const { hashBytes, originPrefix } = TransferHash.initializeFromSource(
        source
      );
      // @ts-ignore
      super(hashBytes);
      this.originPrefix = originPrefix;
    } else {
      super(source);
    }
  }

  /**
   * Initializes the TransferHash from a source string.
   * @param source - The source string representing the transfer hash.
   * @returns An object containing the hash bytes and the origin prefix.
   */
  private static initializeFromSource(
    source: string
  ): { hashBytes: Uint8Array; originPrefix: string } {
    const originPrefix = source.startsWith(PrefixNameTransfer)
      ? PrefixNameTransfer
      : '';
    const hashHex = source.replace(originPrefix, '');
    return {
      hashBytes: Uint8Array.from(Buffer.from(hashHex, 'hex')),
      originPrefix
    };
  }

  /**
   * Converts the TransferHash to a prefixed string representation.
   * @returns A string representation of the TransferHash with its prefix.
   */
  toPrefixedString(): string {
    return `${this.originPrefix}${this.toHex()}`;
  }

  /**
   * Converts the TransferHash to a JSON-compatible string.
   * @returns A JSON string representation of the TransferHash.
   */
  toJSON(): string {
    return this.toPrefixedString();
  }

  /**
   * Creates a TransferHash instance from a JSON string.
   * @param json - The JSON string representing the TransferHash.
   * @returns A new TransferHash instance.
   */
  static fromJSON(json: string): TransferHash {
    return new TransferHash(json);
  }
}
