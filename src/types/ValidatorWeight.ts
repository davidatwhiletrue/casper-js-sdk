import { jsonObject, jsonMember } from 'typedjson';
import { PublicKey } from './keypair';
import { CLValueUInt512 } from './clvalue';

/**
 * Represents the weight of a validator at the end of an era.
 */
@jsonObject
export class ValidatorWeightEraEnd {
  /**
   * The public key of the validator whose weight is being recorded.
   */
  @jsonMember({
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  validator: PublicKey;

  /**
   * The weight of the validator at the end of the era, represented as `CLValueUInt512`.
   */
  @jsonMember({
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: value => value.toJSON()
  })
  weight: CLValueUInt512;
}

/**
 * Represents the weight of a validator in the auction.
 */
@jsonObject
export class ValidatorWeightAuction {
  /**
   * The public key of the validator whose weight is being recorded in the auction.
   */
  @jsonMember({
    name: 'public_key',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  validator: PublicKey;

  /**
   * The weight of the validator in the auction, represented as `CLValueUInt512`.
   */
  @jsonMember({
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: value => value.toJSON()
  })
  weight: CLValueUInt512;
}
