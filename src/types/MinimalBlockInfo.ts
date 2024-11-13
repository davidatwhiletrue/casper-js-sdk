import { jsonObject, jsonMember } from 'typedjson';
import { PublicKey } from './keypair';
import { Hash } from './key';
import { Timestamp } from './Time';

/**
 * Represents minimal block information, including metadata such as the creator,
 * era ID, block hash, height, state root hash, and timestamp.
 */
@jsonObject
export class MinimalBlockInfo {
  /**
   * The public key of the creator of the block.
   * This represents the entity that created the block.
   */
  @jsonMember({
    name: 'creator',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  creator: PublicKey;

  /**
   * The era ID of the block, representing the era in which this block was created.
   */
  @jsonMember({ name: 'era_id', constructor: Number })
  eraID: number;

  /**
   * The hash of the block, used to uniquely identify it.
   */
  @jsonMember({
    name: 'hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  hash: Hash;

  /**
   * The height of the block, indicating its position in the blockchain.
   */
  @jsonMember({ name: 'height', constructor: Number })
  height: number;

  /**
   * The state root hash of the block, representing the state of the blockchain
   * after processing the block.
   */
  @jsonMember({
    name: 'state_root_hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  stateRootHash: Hash;

  /**
   * The timestamp when the block was created.
   * This is typically the time when the block was finalized or validated.
   */
  @jsonMember({
    name: 'timestamp',
    constructor: Timestamp,
    deserializer: json => Timestamp.fromJSON(json),
    serializer: value => value.toJSON()
  })
  timestamp: Timestamp;
}
