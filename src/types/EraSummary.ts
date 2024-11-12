import { jsonObject, jsonMember } from 'typedjson';
import { Hash } from './key';
import { StoredValue } from './StoredValue';

@jsonObject
export class EraSummary {
  @jsonMember({ name: 'block_hash', constructor: Hash })
  public blockHash: Hash;

  @jsonMember({ name: 'era_id', constructor: Number })
  public eraID: number;

  @jsonMember({ name: 'stored_value', constructor: StoredValue })
  public storedValue: StoredValue;

  @jsonMember({ name: 'state_root_hash', constructor: Hash })
  public stateRootHash: Hash;

  @jsonMember({ name: 'merkle_proof', constructor: String })
  public merkleProof: string;

  constructor(
    blockHash: Hash,
    eraID: number,
    storedValue: StoredValue,
    stateRootHash: Hash,
    merkleProof: string
  ) {
    this.blockHash = blockHash;
    this.eraID = eraID;
    this.storedValue = storedValue;
    this.stateRootHash = stateRootHash;
    this.merkleProof = merkleProof;
  }
}
