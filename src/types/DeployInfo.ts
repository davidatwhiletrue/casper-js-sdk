import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';
import { Hash, AccountHash, URef, TransferHash } from './key';

@jsonObject
export class DeployInfo {
  @jsonMember({ name: 'deploy_hash', constructor: Hash })
  deployHash: Hash;

  @jsonMember({ name: 'from', constructor: AccountHash })
  from: AccountHash;

  @jsonMember({ name: 'gas', constructor: String })
  gas: string;

  @jsonMember({ name: 'source', constructor: URef })
  source: URef;

  @jsonArrayMember(TransferHash, { name: 'transfers' })
  transfers: TransferHash[];
}
