import {
  jsonObject,
  jsonMember,
  jsonArrayMember,
  jsonMapMember
} from 'typedjson';
import { PublicKey } from './keypair';
import { ValidatorWeightEraEnd } from './ValidatorWeight';
import { CLValueUInt512 } from './clvalue';

@jsonObject
export class EraReward {
  @jsonMember({ name: 'validator', constructor: PublicKey })
  public validator: PublicKey;

  @jsonMember({ name: 'amount', constructor: CLValueUInt512 })
  public amount: CLValueUInt512;

  constructor(validator: PublicKey, amount: CLValueUInt512) {
    this.validator = validator;
    this.amount = amount;
  }
}

@jsonObject
export class EraReport {
  @jsonArrayMember(PublicKey, { name: 'equivocators' })
  public equivocators: PublicKey[];

  @jsonArrayMember(PublicKey, { name: 'inactive_validators' })
  public inactiveValidators: PublicKey[];

  @jsonArrayMember(EraReward, { name: 'rewards' })
  public rewards: EraReward[];

  constructor(
    equivocators: PublicKey[] = [],
    inactiveValidators: PublicKey[] = [],
    rewards: EraReward[] = []
  ) {
    this.equivocators = equivocators;
    this.inactiveValidators = inactiveValidators;
    this.rewards = rewards;
  }
}

@jsonObject
export class EraEndV2 {
  @jsonArrayMember(PublicKey, { name: 'equivocators' })
  public equivocators: PublicKey[];

  @jsonArrayMember(PublicKey, { name: 'inactive_validators' })
  public inactiveValidators: PublicKey[];

  @jsonArrayMember(ValidatorWeightEraEnd, {
    name: 'next_era_validator_weights'
  })
  public nextEraValidatorWeights: ValidatorWeightEraEnd[];

  @jsonMapMember(String, CLValueUInt512, { name: 'rewards' })
  public rewards: Map<string, CLValueUInt512[]>;

  @jsonMember({ name: 'next_era_gas_price', constructor: Number })
  public nextEraGasPrice: number;

  constructor(
    equivocators: PublicKey[],
    inactiveValidators: PublicKey[],
    nextEraValidatorWeights: ValidatorWeightEraEnd[],
    rewards: Map<string, CLValueUInt512[]>,
    nextEraGasPrice: number
  ) {
    this.equivocators = equivocators;
    this.inactiveValidators = inactiveValidators;
    this.nextEraValidatorWeights = nextEraValidatorWeights;
    this.rewards = rewards;
    this.nextEraGasPrice = nextEraGasPrice;
  }
}

@jsonObject
export class EraEndV1 {
  @jsonMember({ name: 'era_report', constructor: EraReport })
  public eraReport: EraReport;

  @jsonArrayMember(ValidatorWeightEraEnd, {
    name: 'next_era_validator_weights'
  })
  public nextEraValidatorWeights: ValidatorWeightEraEnd[];

  constructor(
    eraReport: EraReport,
    nextEraValidatorWeights: ValidatorWeightEraEnd[]
  ) {
    this.eraReport = eraReport;
    this.nextEraValidatorWeights = nextEraValidatorWeights;
  }
}

@jsonObject
export class EraEnd {
  @jsonArrayMember(PublicKey, { name: 'equivocators' })
  public equivocators: PublicKey[];

  @jsonArrayMember(PublicKey, { name: 'inactive_validators' })
  public inactiveValidators: PublicKey[];

  @jsonArrayMember(ValidatorWeightEraEnd, {
    name: 'next_era_validator_weights'
  })
  public nextEraValidatorWeights: ValidatorWeightEraEnd[];

  @jsonMapMember(String, CLValueUInt512, { name: 'rewards' })
  public rewards: Map<string, CLValueUInt512[]>;

  @jsonMember({ name: 'next_era_gas_price', constructor: Number })
  public nextEraGasPrice: number;

  constructor(
    equivocators: PublicKey[] = [],
    inactiveValidators: PublicKey[] = [],
    nextEraValidatorWeights: ValidatorWeightEraEnd[] = [],
    rewards: Map<string, CLValueUInt512[]> = new Map(),
    nextEraGasPrice = 1
  ) {
    this.equivocators = equivocators;
    this.inactiveValidators = inactiveValidators;
    this.nextEraValidatorWeights = nextEraValidatorWeights;
    this.rewards = rewards;
    this.nextEraGasPrice = nextEraGasPrice;
  }

  static fromV2(eraEnd: EraEndV2 | null): EraEnd | null {
    if (!eraEnd) return null;
    const result = new EraEnd();
    result.nextEraGasPrice = eraEnd.nextEraGasPrice;
    result.equivocators = eraEnd.equivocators;
    result.inactiveValidators = eraEnd.inactiveValidators;
    result.nextEraValidatorWeights = eraEnd.nextEraValidatorWeights;
    result.rewards = eraEnd.rewards;
    return result;
  }

  static fromV1(eraEnd: EraEndV1 | null): EraEnd | null {
    if (!eraEnd) return null;

    const rewardsMap = new Map<string, CLValueUInt512[]>();
    for (const reward of eraEnd.eraReport.rewards) {
      const validatorHex = reward.validator.toHex();
      if (!rewardsMap.has(validatorHex)) {
        rewardsMap.set(validatorHex, []);
      }
      rewardsMap.get(validatorHex)?.push(reward.amount);
    }

    const result = new EraEnd();
    result.nextEraGasPrice = 1;
    result.equivocators = eraEnd.eraReport.equivocators;
    result.inactiveValidators = eraEnd.eraReport.inactiveValidators;
    result.nextEraValidatorWeights = eraEnd.nextEraValidatorWeights;
    result.rewards = rewardsMap;

    return result;
  }
}
