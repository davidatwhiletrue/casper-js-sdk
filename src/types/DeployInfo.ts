import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';
import { Hash, AccountHash, URef, TransferHash } from './key';

/**
 * Represents information about a deploy in the blockchain.
 * This class encapsulates details such as the deploy hash, the account making the deploy, gas usage, source URef, and associated transfers.
 */
@jsonObject
export class DeployInfo {
  /**
   * The unique hash identifying the deploy. This hash is used to verify the integrity and authenticity of the deploy.
   */
  @jsonMember({
    name: 'deploy_hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  deployHash: Hash;

  /**
   * The account hash of the account initiating the deploy. This is used to identify the account responsible for the deploy.
   */
  @jsonMember({
    name: 'from',
    constructor: AccountHash,
    deserializer: json => AccountHash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  from: AccountHash;

  /**
   * The amount of gas used for the deploy. This value is typically in motes, a subunit of CSPR.
   */
  @jsonMember({ name: 'gas', constructor: String })
  gas: string;

  /**
   * The source URef from which the deploy is triggered. URefs are used to identify a reference to a contract or resource in the blockchain.
   */
  @jsonMember({
    name: 'source',
    constructor: URef,
    deserializer: json => URef.fromJSON(json),
    serializer: value => value.toJSON()
  })
  source: URef;

  /**
   * A list of transfer hashes associated with the deploy. These are hashes that identify transfers (e.g., of CSPR or other assets) associated with the deploy.
   */
  @jsonArrayMember(TransferHash, {
    name: 'transfers',
    serializer: (value: TransferHash[]) => value.map(it => it.toJSON()),
    deserializer: (json: any) =>
      json.map((it: string) => TransferHash.fromJSON(it))
  })
  transfers: TransferHash[];
}
