import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';
import { Hash, AccountHash, URef, TransferHash } from './key';

@jsonObject
export class DeployInfo {
  @jsonMember({
    name: 'deploy_hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  deployHash: Hash;

  @jsonMember({
    name: 'from',
    constructor: AccountHash,
    deserializer: json => AccountHash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  from: AccountHash;

  @jsonMember({ name: 'gas', constructor: String })
  gas: string;

  @jsonMember({
    name: 'source',
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: value => value.toJSON()
  })
  source: URef;

  @jsonArrayMember(TransferHash, {
    name: 'transfers',
    serializer: (value: TransferHash[]) => value.map(it => it.toJSON()),
    deserializer: (json: any) =>
      json.map((it: string) => TransferHash.fromJSON(it))
  })
  transfers: TransferHash[];
}
