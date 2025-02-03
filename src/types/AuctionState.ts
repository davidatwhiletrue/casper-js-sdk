import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

import { Bid, Delegator, ValidatorBid } from './Bid';
import { ValidatorWeightAuction } from './ValidatorWeight';
import { PublicKey } from './keypair';
import { BidKind } from './BidKind';
import {
  DEFAULT_MAXIMUM_DELEGATION_AMOUNT,
  DEFAULT_MINIMUM_DELEGATION_AMOUNT
} from '../utils';

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

@jsonObject
export class BidKindWrapper {
  @jsonMember({
    name: 'public_key',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  publicKey: PublicKey;

  @jsonMember({
    name: 'bid',
    constructor: BidKind
  })
  bid: BidKind;

  constructor(publicKey?: PublicKey, bid?: BidKind) {
    if (publicKey) {
      this.publicKey = publicKey;
    }
    if (bid) {
      this.bid = bid;
    }
  }
}

@jsonObject
export class AuctionStateV1 {
  @jsonArrayMember(PublicKeyAndBid, { name: 'bids' })
  bids: PublicKeyAndBid[];

  @jsonMember({ name: 'block_height', constructor: Number })
  blockHeight: number;

  @jsonArrayMember(EraValidators, { name: 'era_validators' })
  eraValidators: EraValidators[];

  @jsonMember({ name: 'state_root_hash', constructor: String })
  stateRootHash: string;
}

@jsonObject
export class AuctionStateV2 {
  @jsonArrayMember(BidKindWrapper, { name: 'bids' })
  bids: BidKindWrapper[];

  @jsonMember({ name: 'block_height', constructor: Number })
  blockHeight: number;

  @jsonArrayMember(EraValidators, { name: 'era_validators' })
  eraValidators: EraValidators[];

  @jsonMember({ name: 'state_root_hash', constructor: String })
  stateRootHash: string;
}

/**
 * Represents the current auction state, including bids, era validators, and other state information.
 */
@jsonObject
export class AuctionState {
  /**
   * The list of bids in the auction.
   */
  @jsonArrayMember(BidKindWrapper, { name: 'bids' })
  bids: BidKindWrapper[];

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

  /**
   * Creates an AuctionState from an AuctionStateV1.
   * For each bid, a BidKindWrapper is created for the validator bid,
   * and additional wrappers are created for each delegator bid.
   *
   * @param v1 An instance of AuctionStateV1.
   * @returns An AuctionState instance.
   */
  static fromV1(v1: AuctionStateV1): AuctionState {
    const bids: BidKindWrapper[] = [];

    for (const pkAndBid of v1.bids) {
      const validator = new ValidatorBid();
      validator.bondingPurse = pkAndBid?.bid?.bondingPurse;
      validator.delegationRate = pkAndBid?.bid?.delegationRate;
      validator.inactive = pkAndBid?.bid?.inactive;
      validator.stakedAmount = pkAndBid?.bid?.stakedAmount;
      validator.vestingSchedule = pkAndBid?.bid?.vestingSchedule;
      validator.reservedSlots = 0;
      validator.validatorPublicKey = pkAndBid?.bid?.validatorPublicKey;
      validator.maximumDelegationAmount = DEFAULT_MAXIMUM_DELEGATION_AMOUNT;
      validator.minimumDelegationAmount = DEFAULT_MINIMUM_DELEGATION_AMOUNT;

      const bidKind = new BidKind();
      bidKind.validator = validator;

      bids.push(new BidKindWrapper(pkAndBid.publicKey, bidKind));

      for (const delegatorBid of pkAndBid.bid.delegators) {
        bids.push(
          new BidKindWrapper(
            pkAndBid.publicKey,
            new BidKind(
              undefined,
              undefined,
              new Delegator(
                delegatorBid.bondingPurse,
                delegatorBid.stakedAmount,
                delegatorBid.delegatorKind,
                delegatorBid.validatorPublicKey,
                delegatorBid.vestingSchedule
              )
            )
          )
        );
      }
    }

    const state = new AuctionState();
    state.bids = bids;
    state.blockHeight = v1.blockHeight;
    state.eraValidators = v1.eraValidators;
    state.stateRootHash = v1.stateRootHash;
    return state;
  }

  /**
   * Creates an AuctionState from an AuctionStateV2.
   *
   * @param v2 An instance of AuctionStateV2.
   * @returns An AuctionState instance.
   */
  static fromV2(v2: AuctionStateV2): AuctionState {
    const bids: BidKindWrapper[] = v2?.bids.map(bidWrapper => {
      return new BidKindWrapper(bidWrapper?.publicKey, bidWrapper?.bid);
    });
    const state = new AuctionState();
    state.bids = bids;
    state.blockHeight = v2?.blockHeight;
    state.eraValidators = v2?.eraValidators;
    state.stateRootHash = v2?.stateRootHash;
    return state;
  }
}
