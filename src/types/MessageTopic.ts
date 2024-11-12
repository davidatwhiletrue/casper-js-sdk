import { jsonObject, jsonMember } from 'typedjson';
import { EntityAddr, Hash } from './key';
import { ModuleBytes } from './ExecutableDeployItem';

@jsonObject
export class MessageTopicSummary {
  @jsonMember({ name: 'message_count', constructor: Number })
  messageCount: number;

  @jsonMember({ name: 'blocktime', constructor: Number })
  blockTime: number;
}

export type MessageChecksum = string;

@jsonObject
export class MessageTopic {
  @jsonMember({ name: 'topic_name', constructor: String })
  topicName: string;

  @jsonMember({
    name: 'topic_name_hash',
    constructor: Hash
  })
  topicNameHash: Hash;
}

@jsonObject
export class MessagePayload {
  @jsonMember({ name: 'String', constructor: String })
  string?: string;

  @jsonMember({
    name: 'Bytes',
    constructor: ModuleBytes
  })
  bytes?: ModuleBytes;
}

@jsonObject
export class Message {
  @jsonMember({
    name: 'message',
    constructor: MessagePayload
  })
  message: MessagePayload;

  @jsonMember({ name: 'topic_name', constructor: String })
  topicName: string;

  @jsonMember({
    name: 'topic_name_hash',
    constructor: Hash
  })
  topicNameHash: Hash;

  @jsonMember({
    name: 'entity_hash',
    constructor: EntityAddr
  })
  entityHash: EntityAddr;

  @jsonMember({ name: 'block_index', constructor: Number })
  blockIndex: number;

  @jsonMember({ name: 'topic_index', constructor: Number })
  topicIndex: number;
}
