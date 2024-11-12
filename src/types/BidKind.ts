import { jsonObject, jsonMember } from 'typedjson';
import { Bid, Bridge, Credit, Delegator, ValidatorBid } from './Bid';

@jsonObject
export class BidKind {
  @jsonMember({ name: 'Unified', constructor: Bid })
  unified?: Bid;

  @jsonMember({ name: 'Validator', constructor: ValidatorBid })
  validator?: ValidatorBid;

  @jsonMember({ name: 'Delegator', constructor: Delegator })
  delegator?: Delegator;

  @jsonMember({ name: 'Bridge', constructor: Bridge })
  bridge?: Bridge;

  @jsonMember({ name: 'Credit', constructor: Credit })
  credit?: Credit;
}
