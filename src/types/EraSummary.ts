import { jsonObject, jsonMember } from 'typedjson';
import { Hash } from './key';
import { StoredValue } from './StoredValue';

/**
 * Class representing a summary of an era, including the block hash, era ID,
 * stored value, state root hash, and the associated Merkle proof.
 */
@jsonObject
export class EraSummary {
  /**
   * The hash of the block for this era.
   */
  @jsonMember({
    name: 'block_hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public blockHash: Hash;

  /**
   * The unique identifier for the era.
   */
  @jsonMember({ name: 'era_id', constructor: Number })
  public eraID: number;

  /**
   * The stored value for this era, representing data related to the state at the end of the era.
   */
  @jsonMember({ name: 'stored_value', constructor: StoredValue })
  public storedValue: StoredValue;

  /**
   * The hash of the state root, which represents the state at the end of the era.
   */
  @jsonMember({
    name: 'state_root_hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public stateRootHash: Hash;

  /**
   * The Merkle proof associated with the block in this era, used to verify the integrity
   * of the data stored in the block.
   */
  @jsonMember({ name: 'merkle_proof', constructor: String })
  public merkleProof: string;

  /**
   * Constructs an `EraSummary` instance.
   *
   * @param blockHash The hash of the block for this era.
   * @param eraID The unique identifier for the era.
   * @param storedValue The stored value representing data associated with the era.
   * @param stateRootHash The hash of the state root at the end of the era.
   * @param merkleProof The Merkle proof for the block in the era.
   */
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
