import { expect } from 'chai';

import { Key, KeyTypeID, MessageAddr } from '../../../types';

describe('Key', () => {
  let hashAddr =
    'entity-contract-55d4a6915291da12afded37fa5bc01f0803a2f0faf6acb7ec4c7ca6ab76f3330';
  let topicStr =
    '5721a6d9d7a9afe5dfdb35276fb823bed0f825350e4d865a5ec0110c380de4e1';
  let msgKeyStr = `message-topic-${hashAddr}-${topicStr}`;

  it('should correctly parse a key with hash address, topic hash, and index', () => {
    const messageAddr = MessageAddr.fromString(msgKeyStr);

    expect(messageAddr.entityAddr.toPrefixedString()).to.equal(hashAddr);
    expect(messageAddr.topicNameHash.toHex()).to.equal(topicStr);
  });

  it('should correctly create a new key for message by type', () => {
    const key = Key.createByType(msgKeyStr, KeyTypeID.Message);

    expect(key.toPrefixedString()).to.equal(msgKeyStr);
    expect(key.message?.entityAddr.toPrefixedString()).to.equal(hashAddr);
    expect(key.message?.topicNameHash.toHex()).to.equal(topicStr);
  });

  it('should correctly create a new key for message', () => {
    const key = Key.newKey(msgKeyStr);

    expect(key.toPrefixedString()).to.equal(msgKeyStr);
    expect(key.message?.entityAddr.toPrefixedString()).to.equal(hashAddr);
    expect(key.message?.topicNameHash.toHex()).to.equal(topicStr);
  });

  it('should correctly create a new key for message for entity contract with index', () => {
    hashAddr =
      'entity-contract-55d4a6915291da12afded37fa5bc01f0803a2f0faf6acb7ec4c7ca6ab76f3330';
    topicStr =
      '5721a6d9d7a9afe5dfdb35276fb823bed0f825350e4d865a5ec0110c380de4e1';
    const indexStr = '0f';
    msgKeyStr = `message-${hashAddr}-${topicStr}-${indexStr}`;
    const messageAddr = MessageAddr.fromString(msgKeyStr);

    expect(messageAddr.entityAddr.toPrefixedString()).to.equal(hashAddr);
    expect(messageAddr.topicNameHash.toHex()).to.equal(topicStr);
    expect(messageAddr.messageIndex).to.equal(15);
  });
});
