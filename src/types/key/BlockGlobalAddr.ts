import { jsonMember, jsonObject } from 'typedjson';
import { IResultWithBytes } from '../clvalue';

/**
 * Enum representing the types of block global addresses.
 */
export enum BlockGlobalAddrTag {
  BlockTime = 0,
  MessageCount = 1
}

/**
 * Custom error class for BlockGlobalAddrTag related errors.
 */
export class BlockGlobalAddrTagError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BlockGlobalAddrTagError';
  }
}

/**
 * Validates and returns the BlockGlobalAddrTag for a given tag number.
 * @param tag - The tag number to validate.
 * @returns The corresponding BlockGlobalAddrTag.
 * @throws BlockGlobalAddrTagError if the tag is invalid.
 */
export function getBlockGlobalAddrTag(tag: number): BlockGlobalAddrTag {
  if (
    tag === BlockGlobalAddrTag.BlockTime ||
    tag === BlockGlobalAddrTag.MessageCount
  ) {
    return tag;
  }
  throw new BlockGlobalAddrTagError('Invalid BlockGlobalAddrTag');
}

const BlockTimePrefix = 'time-';
const MessageCountPrefix = 'message-count-';
const PrefixNameBlockGlobal = 'block-global-';

/**
 * Represents a block global address in the system.
 */
@jsonObject
export class BlockGlobalAddr {
  /**
   * The block time object, if this is a block time address.
   */
  @jsonMember({ name: 'BlockTime', constructor: Object })
  blockTime?: object;

  /**
   * The message count object, if this is a message count address.
   */
  @jsonMember({ name: 'MessageCount', constructor: Object })
  messageCount?: object;

  /**
   * Creates a new BlockGlobalAddr instance.
   * @param blockTime - The block time object.
   * @param messageCount - The message count object.
   */
  constructor(blockTime?: object, messageCount?: object) {
    this.blockTime = blockTime;
    this.messageCount = messageCount;
  }

  /**
   * Creates a BlockGlobalAddr from a string representation.
   * @param source - The string representation of the block global address.
   * @returns A new BlockGlobalAddr instance.
   * @throws Error if the format is invalid.
   */
  static fromString(source: string): BlockGlobalAddr {
    if (source.startsWith(BlockTimePrefix)) {
      return new BlockGlobalAddr({}, undefined);
    } else if (source.startsWith(MessageCountPrefix)) {
      return new BlockGlobalAddr(undefined, {});
    }
    throw new Error('Invalid BlockGlobalAddr format');
  }

  /**
   * Returns a prefixed string representation of the BlockGlobalAddr.
   * @returns The prefixed string representation.
   */
  toPrefixedString(): string {
    const prefix = this.blockTime ? BlockTimePrefix : MessageCountPrefix;
    const emptyHash = '0'.repeat(64);
    return `${PrefixNameBlockGlobal}${prefix}${emptyHash}`;
  }

  /**
   * Creates a BlockGlobalAddr from a byte array.
   * @param bytes - The byte array.
   * @returns A new BlockGlobalAddr instance.
   * @throws Error if the BlockGlobalAddr type is unexpected.
   */
  static fromBytes(bytes: Uint8Array): IResultWithBytes<BlockGlobalAddr> {
    const tagByte = bytes[0];
    const tag = getBlockGlobalAddrTag(tagByte);

    if (tag === BlockGlobalAddrTag.BlockTime) {
      return { result: new BlockGlobalAddr({}, undefined), bytes };
    } else if (tag === BlockGlobalAddrTag.MessageCount) {
      return { result: new BlockGlobalAddr(undefined, {}), bytes };
    }

    throw new Error('Unexpected BlockGlobalAddr type');
  }

  /**
   * Converts the BlockGlobalAddr to a byte array.
   * @returns The byte array representation of the BlockGlobalAddr.
   */
  toBytes(): Uint8Array {
    const tag = this.messageCount
      ? BlockGlobalAddrTag.MessageCount
      : BlockGlobalAddrTag.BlockTime;
    return Uint8Array.of(tag);
  }

  /**
   * Creates a BlockGlobalAddr from its JSON representation.
   * @param json - The JSON string.
   * @returns A new BlockGlobalAddr instance.
   */
  public static fromJSON(json: string): BlockGlobalAddr {
    return this.fromString(json);
  }

  /**
   * Converts the BlockGlobalAddr to its JSON representation.
   * @returns The JSON string representation.
   */
  public toJSON(): string {
    return this.toPrefixedString();
  }
}
