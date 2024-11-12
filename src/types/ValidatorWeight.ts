import { jsonObject, jsonMember } from 'typedjson';
import { PublicKey } from './keypair';
import { CLValueUInt512 } from './clvalue';

@jsonObject
export class ValidatorWeightEraEnd {
  @jsonMember({ constructor: PublicKey })
  validator: PublicKey;

  @jsonMember({ constructor: CLValueUInt512 })
  weight: CLValueUInt512;
}

@jsonObject
export class ValidatorWeightAuction {
  @jsonMember({ name: 'public_key', constructor: PublicKey })
  validator: PublicKey;

  @jsonMember({ constructor: CLValueUInt512 })
  weight: CLValueUInt512;
}
