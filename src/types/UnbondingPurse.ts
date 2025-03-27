import { jsonObject, jsonMember } from 'typedjson';
import { URef } from './key';
import { PublicKey } from './keypair';
import { CLValueUInt512 } from './clvalue';

/**
 * Represents an unbonding purse, which contains information about the unbonding process of a bonded amount.
 */
@jsonObject
export class UnbondingPurse {
  /**
   * The amount being unbonded, represented as `CLValueUInt512`.
   */
  @jsonMember({
    name: 'amount',
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: value => value.toJSON()
  })
  amount: CLValueUInt512;

  /**
   * The bonding purse from which the unbonding is taking place, represented as a `URef`.
   */
  @jsonMember({
    name: 'bonding_purse',
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: value => value.toJSON()
  })
  bondingPurse: URef;

  /**
   * The era when the unbonding purse was created.
   */
  @jsonMember({ name: 'era_of_creation', constructor: Number })
  eraOfCreation: number;

  /**
   * The public key of the unbonder, representing the individual initiating the unbonding process.
   */
  @jsonMember({
    name: 'unbonder_public_key',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  unbonderPublicKey: PublicKey;

  /**
   * The public key of the validator associated with the unbonding.
   */
  @jsonMember({
    name: 'validator_public_key',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  validatorPublicKey: PublicKey;

  /**
   * The public key of a new validator, if applicable. This may be used for transferring the bonded amount to a new validator.
   */
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
