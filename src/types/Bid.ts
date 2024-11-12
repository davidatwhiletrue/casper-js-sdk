import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';
import { PublicKey } from './keypair';
import { CLValueUInt512 } from './clvalue';
import { URef } from './key';

@jsonObject
export class VestingSchedule {
  @jsonMember({ name: 'initial_release_timestamp_millis', constructor: Number })
  initialReleaseTimestampMillis: number;

  @jsonArrayMember(CLValueUInt512, { name: 'locked_amounts' })
  lockedAmounts: CLValueUInt512[];
}

@jsonObject
export class ValidatorBid {
  @jsonMember({ name: 'bonding_purse', constructor: URef })
  bondingPurse: URef;

  @jsonMember({ name: 'delegation_rate', constructor: Number })
  delegationRate: number;

  @jsonMember({ name: 'inactive', constructor: Boolean })
  inactive: boolean;

  @jsonMember({ name: 'staked_amount', constructor: CLValueUInt512 })
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

  @jsonMember({ name: 'bonding_purse', constructor: URef })
  bondingPurse: URef;

  @jsonMember({ name: 'staked_amount', constructor: CLValueUInt512 })
  stakedAmount: CLValueUInt512;

  @jsonMember({ name: 'delegator_public_key', constructor: PublicKey })
  delegatorPublicKey: PublicKey;

  @jsonMember({ name: 'validator_public_key', constructor: PublicKey })
  validatorPublicKey: PublicKey;

  @jsonMember({ name: 'vesting_schedule', constructor: VestingSchedule })
  vestingSchedule?: VestingSchedule;
}

@jsonObject
export class Bid {
  @jsonMember({ name: 'bonding_purse', constructor: URef })
  bondingPurse: URef;

  @jsonMember({ name: 'delegation_rate', constructor: Number })
  delegationRate: number;

  @jsonMember({ name: 'inactive', constructor: Boolean })
  inactive: boolean;

  @jsonMember({ name: 'staked_amount', constructor: CLValueUInt512 })
  stakedAmount: CLValueUInt512;
  @jsonMember({ name: 'validator_public_key', constructor: PublicKey })
  validatorPublicKey: PublicKey;

  @jsonArrayMember(Delegator, { name: 'delegators' })
  delegators: Delegator[];

  @jsonMember({ name: 'vesting_schedule', constructor: VestingSchedule })
  vestingSchedule?: VestingSchedule;
}

@jsonObject
export class DelegatorV1 {
  @jsonMember({ name: 'bonding_purse', constructor: URef })
  bondingPurse: URef;

  @jsonMember({ name: 'staked_amount', constructor: CLValueUInt512 })
  stakedAmount: CLValueUInt512;

  @jsonMember({ name: 'delegatee', constructor: PublicKey })
  delegatee: PublicKey;

  @jsonMember({ name: 'public_key', constructor: PublicKey })
  publicKey: PublicKey;

  @jsonMember({ name: 'vesting_schedule', constructor: VestingSchedule })
  vestingSchedule?: VestingSchedule;
}

@jsonObject
export class Credit {
  @jsonMember({ name: 'era_id', constructor: Number })
  eraID: number;

  @jsonMember({ name: 'validator_public_key', constructor: PublicKey })
  validatorPublicKey: PublicKey;

  @jsonMember({ name: 'amount', constructor: CLValueUInt512 })
  amount: CLValueUInt512;
}

@jsonObject
export class Bridge {
  @jsonMember({ name: 'era_id', constructor: Number })
  eraID: number;

  @jsonMember({ name: 'old_validator_public_key', constructor: PublicKey })
  oldValidatorPublicKey: PublicKey;

  @jsonMember({ name: 'new_validator_public_key', constructor: PublicKey })
  newValidatorPublicKey: PublicKey;
}
