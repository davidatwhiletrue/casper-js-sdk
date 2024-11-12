import { concat } from '@ethersproject/bytes';

import { jsonMember, jsonObject } from 'typedjson';
import { EntityAddr } from './EntityAddr';
import { Hash } from './Hash';
import { IResultWithBytes } from '../clvalue';

/** Prefix for topics in MessageAddr. */
const TopicPrefix = 'topic-';

/** Prefix for messages in MessageAddr. */
const PrefixNameMessage = 'message-';

/** Prefix for addressable entities in MessageAddr. */
const PrefixNameAddressableEntity = 'entity-';

/**
 * Represents a message address within the system, identified by an entity address,
 * a topic name hash, and an optional message index.
 */
@jsonObject
export class MessageAddr {
  /**
   * Creates an instance of MessageAddr.
   * @param entityAddr - The address of the associated entity.
   * @param topicNameHash - The hash of the topic name.
   * @param messageIndex - Optional index of the message.
   */
  constructor(
    entityAddr: EntityAddr,
    topicNameHash: Hash,
    messageIndex?: number
  ) {
    this.entityAddr = entityAddr;
    this.topicNameHash = topicNameHash;
    this.messageIndex = messageIndex;
  }

  /** The address of the associated entity. */
  @jsonMember({ name: 'EntityAddr', constructor: EntityAddr })
  public entityAddr: EntityAddr;

  /** The hash of the topic name. */
  @jsonMember({ name: 'TopicNameHash', constructor: Hash })
  public topicNameHash: Hash;

  /** The optional index of the message. */
  @jsonMember({ name: 'MessageIndex', constructor: Number })
  public messageIndex?: number;

  /**
   * Creates a MessageAddr instance from a string representation.
   * @param source - The string representation of the MessageAddr.
   * @returns A new MessageAddr instance.
   * @throws Error if the format is invalid.
   */
  static fromString(source: string): MessageAddr {
    let messageIndex: number | undefined;

    if (!source.startsWith(TopicPrefix)) {
      const lastHyphen = source.lastIndexOf('-');
      const rawId = source.substring(lastHyphen + 1);
      source = source.substring(0, lastHyphen);

      const idx = parseInt(rawId, 10);
      if (isNaN(idx)) {
        throw new Error('Invalid MessageAddr format: invalid index.');
      }
      messageIndex = idx;
    } else {
      source = source.slice(TopicPrefix.length);
    }

    const topicNameHashStr = source.substring(source.lastIndexOf('-') + 1);
    const topicNameHash = Hash.fromHex(topicNameHashStr);

    const entityAddrStr = source
      .substring(0, source.lastIndexOf('-'))
      .replace(PrefixNameAddressableEntity, '');
    const entityAddr = EntityAddr.fromPrefixedString(entityAddrStr);

    return new MessageAddr(entityAddr, topicNameHash, messageIndex);
  }

  /**
   * Converts the MessageAddr to a prefixed string representation.
   * @returns A prefixed string representation of the MessageAddr.
   */
  toPrefixedString(): string {
    let result = PrefixNameMessage;
    if (!this.messageIndex) {
      result += TopicPrefix;
    }
    result += this.entityAddr.toPrefixedString();
    result += '-' + this.topicNameHash.toHex();

    if (this.messageIndex !== undefined) {
      result += `-${this.messageIndex}`;
    }

    return result;
  }

  /**
   * Converts the MessageAddr to a JSON-compatible string.
   * @returns A JSON string representation of the MessageAddr.
   */
  toJSON(): string {
    return this.toPrefixedString();
  }

  /**
   * Creates a MessageAddr instance from a byte array.
   * @param bytes - The byte array representing the MessageAddr.
   * @returns A new MessageAddr instance.
   */
  static fromBytes(bytes: Uint8Array): IResultWithBytes<MessageAddr> {
    const entityAddr = EntityAddr.fromBytes(bytes);
    const topicNameHash = Hash.fromBytes(bytes);

    let messageIndex: number | undefined;
    if (bytes.length > 0) {
      const messageIndexArray = bytes.slice(bytes.length - 4);
      messageIndex = new DataView(messageIndexArray.buffer).getUint32(0, true);
    }

    return {
      result: new MessageAddr(
        entityAddr?.result,
        topicNameHash?.result,
        messageIndex
      ),
      bytes: concat([entityAddr.bytes, topicNameHash.bytes])
    };
  }

  /**
   * Converts the MessageAddr to a byte array representation.
   * @returns A Uint8Array representing the MessageAddr.
   */
  toBytes(): Uint8Array {
    const entityBytes = this.entityAddr.toBytes();
    const topicBytes = this.topicNameHash.toBytes();
    const result = new Uint8Array(
      entityBytes.length +
        topicBytes.length +
        (this.messageIndex !== undefined ? 4 : 0)
    );

    result.set(entityBytes);
    result.set(topicBytes, entityBytes.length);

    if (this.messageIndex !== undefined) {
      const indexBuffer = new Uint8Array(4);
      new DataView(indexBuffer.buffer).setUint32(0, this.messageIndex, true);
      result.set(indexBuffer, entityBytes.length + topicBytes.length);
    }

    return result;
  }
}
