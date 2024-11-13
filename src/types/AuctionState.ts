import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';
import { Bid } from './Bid';
import { ValidatorWeightAuction } from './ValidatorWeight';
import { PublicKey } from './keypair';

/**
 * Represents a public key and its corresponding bid in the auction state.
 */
@jsonObject
export class PublicKeyAndBid {
  /**
   * The public key associated with this bid.
   */
  @jsonMember({
    name: 'public_key',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  publicKey: PublicKey;

  /**
   * The bid associated with the public key.
   */
  @jsonMember({ name: 'bid', constructor: Bid })
  bid: Bid;
}

/**
 * Represents validators for a specific era, including the era ID and validator weights.
 */
@jsonObject
export class EraValidators {
  /**
   * The unique identifier for the era.
   */
  @jsonMember({ name: 'era_id', constructor: Number })
  eraID: number;

  /**
   * The weights of the validators for this era.
   */
  @jsonArrayMember(ValidatorWeightAuction, { name: 'validator_weights' })
  validatorWeights: ValidatorWeightAuction[];
}

/**
 * Represents the current auction state, including bids, era validators, and other state information.
 */
@jsonObject
export class AuctionState {
  /**
   * The list of public keys and bids in the auction.
   */
  @jsonArrayMember(PublicKeyAndBid, { name: 'bids' })
  bids: PublicKeyAndBid[];

  /**
   * The block height at which this auction state was recorded.
   */
  @jsonMember({ name: 'block_height', constructor: Number })
  blockHeight: number;

  /**
   * The validators and their weights for each era in the auction state.
   */
  @jsonArrayMember(EraValidators, { name: 'era_validators' })
  eraValidators: EraValidators[];

  /**
   * The root hash of the state at the time of this auction state.
   */
  @jsonMember({ name: 'state_root_hash', constructor: String })
  stateRootHash: string;
}
