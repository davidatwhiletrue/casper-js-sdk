import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import { PublicKey } from './keypair';
import { CLValueUInt512 } from './clvalue';
import { DelegationKind } from './Bid';

/**
 * Class representing the allocation of seigniorage to a delegator.
 */
@jsonObject
export class DelegatorAllocation {
  /**
   * Kinds of delegation bids.
   */
  @jsonMember({
    name: 'delegator_kind',
    constructor: DelegationKind
  })
  delegatorKind: DelegationKind;

  /**
   * The public key of the validator associated with the delegator's allocation.
   */
  @jsonMember({
    name: 'validator_public_key',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  validatorPublicKey: PublicKey;

  /**
   * The amount of seigniorage allocated to the delegator.
   */
  @jsonMember({
    name: 'amount',
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: value => value.toJSON()
  })
  amount: CLValueUInt512;

  /**
   * Constructs a `DelegatorAllocation` instance.
   *
   * @param delegatorKind Kinds of delegation bids.
   * @param validatorPublicKey The public key of the associated validator.
   * @param amount The amount of seigniorage allocated to the delegator.
   */
  constructor(
    delegatorKind: DelegationKind,
    validatorPublicKey: PublicKey,
    amount: CLValueUInt512
  ) {
    this.delegatorKind = delegatorKind;
    this.validatorPublicKey = validatorPublicKey;
    this.amount = amount;
  }
}

/**
 * Class representing the allocation of seigniorage to a validator.
 */
@jsonObject
export class ValidatorAllocation {
  /**
   * The public key of the validator receiving the allocation.
   */
  @jsonMember({
    name: 'validator_public_key',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  validatorPublicKey: PublicKey;

  /**
   * The amount of seigniorage allocated to the validator.
   */
  @jsonMember({
    name: 'amount',
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: value => value.toJSON()
  })
  amount: CLValueUInt512;

  /**
   * Constructs a `ValidatorAllocation` instance.
   *
   * @param validatorPublicKey The public key of the validator.
   * @param amount The amount of seigniorage allocated to the validator.
   */
  constructor(validatorPublicKey: PublicKey, amount: CLValueUInt512) {
    this.validatorPublicKey = validatorPublicKey;
    this.amount = amount;
  }
}

/**
 * Class representing the seigniorage allocation for a validator and delegator.
 */
@jsonObject
export class SeigniorageAllocation {
  /**
   * The allocation for a validator.
   */
  @jsonMember({ name: 'Validator', constructor: ValidatorAllocation })
  validator?: ValidatorAllocation;

  /**
   * The allocation for a delegator.
   */
  @jsonMember({ name: 'Delegator', constructor: DelegatorAllocation })
  delegator?: DelegatorAllocation;

  /**
   * Constructs a `SeigniorageAllocation` instance.
   *
   * @param validator The validator allocation.
   * @param delegator The delegator allocation.
   */
  constructor(
    validator?: ValidatorAllocation,
    delegator?: DelegatorAllocation
  ) {
    this.validator = validator;
    this.delegator = delegator;
  }
}

/**
 * Class representing information about an era, including seigniorage allocations.
 */
@jsonObject
export class EraInfo {
  /**
   * A list of seigniorage allocations for validators and delegators in the era.
   */
  @jsonArrayMember(SeigniorageAllocation, { name: 'seigniorage_allocations' })
  seigniorageAllocations: SeigniorageAllocation[];

  /**
   * Constructs an `EraInfo` instance.
   *
   * @param seigniorageAllocations The list of seigniorage allocations for validators and delegators.
   */
  constructor(seigniorageAllocations: SeigniorageAllocation[] = []) {
    this.seigniorageAllocations = seigniorageAllocations;
  }
}
