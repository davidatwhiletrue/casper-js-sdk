import { concat } from '@ethersproject/bytes';
import { jsonMember, jsonObject } from 'typedjson';

import { Hash } from './Hash';
import { IResultWithBytes } from '../clvalue';

/** Prefix for topics in MessageAddr. */
const TopicPrefix = 'topic-';

/** Prefix for messages in MessageAddr. */
const PrefixNameMessage = 'message-';

/**
 * Represents an addressable message within the system. The address is composed of an associated entity address,
 * a hashed topic name, and an optional message index. It offers various utilities for serialization, deserialization,
 * and converting the address into prefixed string and byte representations.
 */
@jsonObject
export class MessageAddr {
  /**
   * Creates an instance of MessageAddr.
   * @param hashAddr - The address of the associated entity.
   * @param topicNameHash - The hash of the topic name.
   * @param messageIndex - Optional index of the message.
   */
  constructor(hashAddr: Hash, topicNameHash: Hash, messageIndex?: number) {
    this.hashAddr = hashAddr;
    this.topicNameHash = topicNameHash;
    this.messageIndex = messageIndex;
  }

  /** The address of the associated entity. */
  @jsonMember({
    name: 'HashAddr',
    constructor: Hash,
    deserializer: json => {
      if (!json) return;
      return Hash.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  public hashAddr: Hash;

  /** The hash of the topic name associated with this message. */
  @jsonMember({ name: 'TopicNameHash', constructor: Hash })
  public topicNameHash: Hash;

  /** The optional index of the message within the topic. */
  @jsonMember({ name: 'MessageIndex', constructor: Number })
  public messageIndex?: number;

  /**
   * Instantiates a MessageAddr from its string representation.
   * The string should follow the prefixed format used in the system.
   * @param source - The string representation of the MessageAddr.
   * @returns A new MessageAddr instance.
   * @throws Error if the provided string does not match the expected format.
   */
  static fromString(source: string): MessageAddr {
    if (!source.startsWith(PrefixNameMessage)) {
      throw new Error(
        `Key not valid. It should start with '${PrefixNameMessage}'.`
      );
    }

    source = source.substring(PrefixNameMessage.length);

    let hashAddr: string;
    let topicHash: string;
    let index: number | undefined;

    if (source.startsWith(TopicPrefix)) {
      source = source.substring(TopicPrefix.length);
      const parts = source.split('-');

      if (parts.length === 2) {
        hashAddr = parts[0];
        topicHash = parts[1];
      } else {
        throw new Error(
          'Key not valid. It should have a hash address and a topic hash.'
        );
      }
    } else {
      const parts = source.split('-');

      if (parts.length === 3) {
        hashAddr = parts[0];
        topicHash = parts[1];

        if (parts[2].length === 0) {
          throw new Error('Key not valid. Expected a non-empty message index.');
        }
        index = parseInt(parts[2], 16);

        if (isNaN(index)) {
          throw new Error('Key not valid. Index is not a valid number.');
        }
      } else {
        throw new Error(
          'Key not valid. It should have a hash address, a topic hash, and a message index.'
        );
      }
    }

    return new MessageAddr(
      Hash.fromHex(hashAddr),
      Hash.fromHex(topicHash),
      index
    );
  }

  /**
   * Converts the `MessageAddr` into a standardized prefixed string format.
   * Useful for displaying or storing the address in text format.
   * @returns A prefixed string representation of the `MessageAddr`.
   */
  toPrefixedString(): string {
    let result = PrefixNameMessage;
    if (!this.messageIndex) {
      result += TopicPrefix;
    }
    result += this.hashAddr.toHex();
    result += '-' + this.topicNameHash.toHex();

    if (this.messageIndex !== undefined) {
      result += `-${this.messageIndex}`;
    }

    return result;
  }

  /**
   * Serializes the `MessageAddr` into a JSON-compatible string format.
   * Primarily used for JSON-based data exchange.
   * @returns A JSON string representation of the `MessageAddr`.
   */
  toJSON(): string {
    return this.toPrefixedString();
  }

  /**
   * Constructs a `MessageAddr` instance from a byte array.
   * Interprets the byte array in a structured format to extract
   * the entity address, topic name hash, and optionally, the message index.
   * @param bytes - The byte array representing the MessageAddr.
   * @returns A new `MessageAddr` instance wrapped in an `IResultWithBytes`.
   */
  static fromBytes(bytes: Uint8Array): IResultWithBytes<MessageAddr> {
    const entityAddr = Hash.fromBytes(bytes);
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
   * Converts the `MessageAddr` to a byte array, enabling binary data storage.
   * Useful for transmission or storage where a compact format is needed.
   * @returns A `Uint8Array` representing the `MessageAddr`.
   */
  toBytes(): Uint8Array {
    const entityBytes = this.hashAddr.toBytes();
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
