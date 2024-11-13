import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';
import { PublicKey } from './keypair';
import { CLValueUInt512 } from './clvalue';
import { URef } from './key';

@jsonObject
export class VestingSchedule {
  @jsonMember({ name: 'initial_release_timestamp_millis', constructor: Number })
  initialReleaseTimestampMillis: number;

  @jsonArrayMember(CLValueUInt512, {
    name: 'locked_amounts',
    serializer: (value: CLValueUInt512[]) => value.map(it => it.toJSON()),
    deserializer: (json: any) =>
      json.map((it: string) => CLValueUInt512.fromJSON(it))
  })
  lockedAmounts: CLValueUInt512[];
}

@jsonObject
export class ValidatorBid {
  @jsonMember({
    name: 'bonding_purse',
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: value => value.toJSON()
  })
  bondingPurse: URef;

  @jsonMember({ name: 'delegation_rate', constructor: Number })
  delegationRate: number;

  @jsonMember({ name: 'inactive', constructor: Boolean })
  inactive: boolean;

  @jsonMember({
    name: 'staked_amount',
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: value => value.toJSON()
  })
  stakedAmount: CLValueUInt512;

  @jsonMember({ name: 'minimum_delegation_amount', constructor: Number })
  minimumDelegationAmount: number;

  @jsonMember({ name: 'maximum_delegation_amount', constructor: Number })
  maximumDelegationAmount: number;

  @jsonMember({ name: 'vesting_schedule', constructor: VestingSchedule })
  vestingSchedule?: VestingSchedule;
}

@jsonObject
export class Delegator {
  constructor(
    bondingPurse: URef,
    stakedAmount: CLValueUInt512,
    delegatorPublicKey: PublicKey,
    validatorPublicKey: PublicKey,
    vestingSchedule?: VestingSchedule
  ) {
    this.bondingPurse = bondingPurse;
    this.stakedAmount = stakedAmount;
    this.delegatorPublicKey = delegatorPublicKey;
    this.validatorPublicKey = validatorPublicKey;
    this.vestingSchedule = vestingSchedule;
  }

  static newDelegatorFromDelegatorV1(v1: DelegatorV1) {
    return new Delegator(
      v1.bondingPurse,
      v1.stakedAmount,
      v1.publicKey,
      v1.delegatee,
      v1.vestingSchedule
    );
  }

  @jsonMember({
    name: 'bonding_purse',
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: value => value.toJSON()
  })
  bondingPurse: URef;

  @jsonMember({
    name: 'staked_amount',
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: value => value.toJSON()
  })
  stakedAmount: CLValueUInt512;

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

  @jsonMember({ name: 'vesting_schedule', constructor: VestingSchedule })
  vestingSchedule?: VestingSchedule;
}

@jsonObject
export class Bid {
  @jsonMember({
    name: 'bonding_purse',
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: value => value.toJSON()
  })
  bondingPurse: URef;

  @jsonMember({ name: 'delegation_rate', constructor: Number })
  delegationRate: number;

  @jsonMember({ name: 'inactive', constructor: Boolean })
  inactive: boolean;

  @jsonMember({
    name: 'staked_amount',
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: value => value.toJSON()
  })
  stakedAmount: CLValueUInt512;

  @jsonMember({
    name: 'validator_public_key',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  validatorPublicKey: PublicKey;

  @jsonArrayMember(Delegator, { name: 'delegators' })
  delegators: Delegator[];

  @jsonMember({ name: 'vesting_schedule', constructor: VestingSchedule })
  vestingSchedule?: VestingSchedule;
}

@jsonObject
export class DelegatorV1 {
  @jsonMember({
    name: 'bonding_purse',
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: value => value.toJSON()
  })
  bondingPurse: URef;

  @jsonMember({
    name: 'staked_amount',
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: value => value.toJSON()
  })
  stakedAmount: CLValueUInt512;

  @jsonMember({
    name: 'delegatee',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  delegatee: PublicKey;

  @jsonMember({
    name: 'public_key',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  publicKey: PublicKey;

  @jsonMember({ name: 'vesting_schedule', constructor: VestingSchedule })
  vestingSchedule?: VestingSchedule;
}

@jsonObject
export class Credit {
  @jsonMember({ name: 'era_id', constructor: Number })
  eraID: number;

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
}

@jsonObject
export class Bridge {
  @jsonMember({ name: 'era_id', constructor: Number })
  eraID: number;

  @jsonMember({
    name: 'old_validator_public_key',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  oldValidatorPublicKey: PublicKey;

  @jsonMember({
    name: 'new_validator_public_key',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  newValidatorPublicKey: PublicKey;
}
