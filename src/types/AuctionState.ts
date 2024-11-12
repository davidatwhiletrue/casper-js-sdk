import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';
import { Bid } from './Bid';
import { ValidatorWeightAuction } from './ValidatorWeight';
import { PublicKey } from './keypair';

@jsonObject
export class PublicKeyAndBid {
  @jsonMember({ name: 'public_key', constructor: PublicKey })
  publicKey: PublicKey;

  @jsonMember({ name: 'bid', constructor: Bid })
  bid: Bid;
}

@jsonObject
export class EraValidators {
  @jsonMember({ name: 'era_id', constructor: Number })
  eraID: number;

  @jsonArrayMember(ValidatorWeightAuction, { name: 'validator_weights' })
  validatorWeights: ValidatorWeightAuction[];
}

@jsonObject
export class AuctionState {
  @jsonArrayMember(PublicKeyAndBid, { name: 'bids' })
  bids: PublicKeyAndBid[];

  @jsonMember({ name: 'block_height', constructor: Number })
  blockHeight: number;

  @jsonArrayMember(EraValidators, { name: 'era_validators' })
  eraValidators: EraValidators[];

  @jsonMember({ name: 'state_root_hash', constructor: String })
  stateRootHash: string;
}
