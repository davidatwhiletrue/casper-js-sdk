import { jsonObject, jsonMember } from 'typedjson';
import { PublicKey } from './keypair';
import { CLValueUInt512 } from './clvalue';

@jsonObject
export class ValidatorWeightEraEnd {
  @jsonMember({
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  validator: PublicKey;

  @jsonMember({
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: value => value.toJSON()
  })
  weight: CLValueUInt512;
}

@jsonObject
export class ValidatorWeightAuction {
  @jsonMember({
    name: 'public_key',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  validator: PublicKey;

  @jsonMember({
    constructor: CLValueUInt512,
    deserializer: json => CLValueUInt512.fromJSON(json),
    serializer: value => value.toJSON()
  })
  weight: CLValueUInt512;
}
