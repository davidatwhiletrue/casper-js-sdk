import { jsonObject, jsonMember } from 'typedjson';
import { URef } from './key';
import { PublicKey } from './keypair';
import { CLValueUInt512 } from './clvalue';

@jsonObject
export class UnbondingPurse {
  @jsonMember({
    name: 'amount',
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: value => value.toJSON()
  })
  amount: CLValueUInt512;

  @jsonMember({
    name: 'bonding_purse',
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: value => value.toJSON()
  })
  bondingPurse: URef;

  @jsonMember({ name: 'era_of_creation', constructor: Number })
  eraOfCreation: number;

  @jsonMember({
    name: 'unbonder_public_key',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  unbonderPublicKey: PublicKey;

  @jsonMember({
    name: 'validator_public_key',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  validatorPublicKey: PublicKey;

  @jsonMember({
    name: 'new_validator',
    constructor: PublicKey,
    deserializer: json => {
      if (!json) return;
      return PublicKey.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    }
  })
  newValidator?: PublicKey;
}
