import { jsonObject, jsonMember } from 'typedjson';
import { PublicKey } from './keypair';
import { Hash } from './key';
import { Timestamp } from './Time';

@jsonObject
export class MinimalBlockInfo {
  @jsonMember({ name: 'creator', constructor: PublicKey })
  creator: PublicKey;

  @jsonMember({ name: 'era_id', constructor: Number })
  eraID: number;

  @jsonMember({ name: 'hash', constructor: Hash })
  hash: Hash;

  @jsonMember({ name: 'height', constructor: Number })
  height: number;

  @jsonMember({ name: 'state_root_hash', constructor: Hash })
  stateRootHash: Hash;

  @jsonMember({ name: 'timestamp', constructor: Timestamp })
  timestamp: Timestamp;
}
