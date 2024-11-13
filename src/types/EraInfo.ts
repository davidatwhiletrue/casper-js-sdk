import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import { PublicKey } from './keypair';
import { CLValueUInt512 } from './clvalue';

@jsonObject
export class DelegatorAllocation {
  @jsonMember({
    name: 'delegator_public_key',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  delegatorPublicKey: PublicKey;

  @jsonMember({
    name: 'validator_public_key',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  validatorPublicKey: PublicKey;

  @jsonMember({
    name: 'amount',
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: value => value.toJSON()
  })
  amount: CLValueUInt512;

  constructor(
    delegatorPublicKey: PublicKey,
    validatorPublicKey: PublicKey,
    amount: CLValueUInt512
  ) {
    this.delegatorPublicKey = delegatorPublicKey;
    this.validatorPublicKey = validatorPublicKey;
    this.amount = amount;
  }
}

@jsonObject
export class ValidatorAllocation {
  @jsonMember({
    name: 'validator_public_key',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  validatorPublicKey: PublicKey;

  @jsonMember({
    name: 'amount',
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: value => value.toJSON()
  })
  amount: CLValueUInt512;

  constructor(validatorPublicKey: PublicKey, amount: CLValueUInt512) {
    this.validatorPublicKey = validatorPublicKey;
    this.amount = amount;
  }
}

@jsonObject
export class SeigniorageAllocation {
  @jsonMember({ name: 'Validator', constructor: ValidatorAllocation })
  validator?: ValidatorAllocation;

  @jsonMember({ name: 'Delegator', constructor: DelegatorAllocation })
  delegator?: DelegatorAllocation;

  constructor(
    validator?: ValidatorAllocation,
    delegator?: DelegatorAllocation
  ) {
    this.validator = validator;
    this.delegator = delegator;
  }
}

@jsonObject
export class EraInfo {
  @jsonArrayMember(SeigniorageAllocation, { name: 'seigniorage_allocations' })
  seigniorageAllocations: SeigniorageAllocation[];

  constructor(seigniorageAllocations: SeigniorageAllocation[] = []) {
    this.seigniorageAllocations = seigniorageAllocations;
  }
}
