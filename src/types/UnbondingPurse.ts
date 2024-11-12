import { jsonObject, jsonMember } from 'typedjson';
import { URef } from './key';
import { PublicKey } from './keypair';
import { CLValueUInt512 } from './clvalue';

@jsonObject
export class UnbondingPurse {
  @jsonMember({ name: 'amount', constructor: CLValueUInt512 })
  amount: CLValueUInt512;

  @jsonMember({ name: 'bonding_purse', constructor: URef })
  bondingPurse: URef;

  @jsonMember({ name: 'era_of_creation', constructor: Number })
  eraOfCreation: number;

  @jsonMember({
    name: 'unbonder_public_key',
    constructor: PublicKey
  })
  unbonderPublicKey: PublicKey;

  @jsonMember({
    name: 'validator_public_key',
    constructor: PublicKey
  })
  validatorPublicKey: PublicKey;

  @jsonMember({ name: 'new_validator', constructor: PublicKey })
  newValidator?: PublicKey;
}
