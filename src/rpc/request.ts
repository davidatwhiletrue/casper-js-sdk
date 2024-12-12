import { jsonObject, jsonMember, jsonArrayMember, AnyT } from 'typedjson';
import { IDValue } from './id_value';
import {
  TransactionHash,
  TransactionWrapper,
  Deploy,
  URef,
  EntityAddr,
  AccountHash,
  PublicKey
} from '../types';

export const ApiVersion = '2.0';

export enum Method {
  GetDeploy = 'info_get_deploy',
  GetTransaction = 'info_get_transaction',
  GetStateItem = 'state_get_item',
  QueryGlobalState = 'query_global_state',
  GetDictionaryItem = 'state_get_dictionary_item',
  GetStateBalance = 'state_get_balance',
  GetStateAccount = 'state_get_account_info',
  GetStateEntity = 'state_get_entity',
  GetEraInfo = 'chain_get_era_info_by_switch_block',
  GetBlock = 'chain_get_block',
  GetBlockTransfers = 'chain_get_block_transfers',
  GetEraSummary = 'chain_get_era_summary',
  GetAuctionInfo = 'state_get_auction_info',
  GetValidatorChanges = 'info_get_validator_changes',
  GetStateRootHash = 'chain_get_state_root_hash',
  GetStatus = 'info_get_status',
  GetReward = 'info_get_reward',
  GetPeers = 'info_get_peers',
  PutDeploy = 'account_put_deploy',
  PutTransaction = 'account_put_transaction',
  SpeculativeExec = 'speculative_exec',
  QueryBalance = 'query_balance',
  QueryBalanceDetails = 'query_balance_details',
  InfoGetChainspec = 'info_get_chainspec'
}

@jsonObject
export class RpcRequest {
  @jsonMember({ constructor: String, name: 'jsonrpc' })
  version: string;

  @jsonMember({
    constructor: IDValue,
    isRequired: false,
    deserializer: (json: string) => {
      return IDValue.fromJSON(json);
    },
    serializer: (value: IDValue) => {
      if (!value) return undefined;
      return value.toJSON();
    }
  })
  id?: IDValue;

  @jsonMember({ constructor: String })
  method: Method;

  @jsonMember({ constructor: AnyT })
  params: any;

  constructor(version: string, method: Method, params: any, id?: IDValue) {
    this.version = version;
    this.method = method;
    this.params = params;
    this.id = id;
  }

  static defaultRpcRequest(method: Method, params: any): RpcRequest {
    return new RpcRequest(ApiVersion, method, params, IDValue.fromString('1'));
  }
}

@jsonObject
export class ParamStateRootHash {
  @jsonMember({ constructor: String, name: 'state_root_hash' })
  stateRootHash: string;

  @jsonMember({ constructor: String })
  key: string;

  @jsonArrayMember(String)
  path?: string[];

  constructor(stateRootHash: string, key: string, path?: string[]) {
    this.stateRootHash = stateRootHash;
    this.key = key;
    this.path = path;
  }
}

@jsonObject
export class BlockIdentifier {
  @jsonMember({ isRequired: false, constructor: String, name: 'Hash' })
  hash?: string;

  @jsonMember({ isRequired: false, constructor: Number, name: 'Height' })
  height?: number;

  constructor(hash?: string, height?: number) {
    this.hash = hash;
    this.height = height;
  }
}

@jsonObject
export class ParamQueryGlobalStateID {
  @jsonMember({ isRequired: false, constructor: String, name: 'StateRootHash' })
  stateRootHash?: string;

  @jsonMember({ isRequired: false, constructor: String, name: 'BlockHash' })
  blockHash?: string;

  @jsonMember({ isRequired: false, constructor: Number, name: 'BlockHeight' })
  blockHeight?: number;

  constructor(
    stateRootHash?: string,
    blockHash?: string,
    blockHeight?: number
  ) {
    this.stateRootHash = stateRootHash;
    this.blockHash = blockHash;
    this.blockHeight = blockHeight;
  }
}

@jsonObject
export class ParamQueryGlobalState {
  @jsonMember({
    isRequired: false,
    constructor: ParamQueryGlobalStateID,
    name: 'state_identifier'
  })
  stateIdentifier?: ParamQueryGlobalStateID;

  @jsonMember({ constructor: String })
  key: string;

  @jsonArrayMember(String)
  path?: string[];

  constructor(
    stateIdentifier: ParamQueryGlobalStateID | undefined,
    key: string,
    path?: string[]
  ) {
    this.stateIdentifier = stateIdentifier;
    this.key = key;
    this.path = path;
  }

  static newQueryGlobalStateParam(
    key: string,
    path: string[],
    id?: ParamQueryGlobalStateID
  ): ParamQueryGlobalState {
    return new ParamQueryGlobalState(id, key, path);
  }
}

@jsonObject
export class ParamTransactionHash {
  @jsonMember({
    constructor: TransactionHash,
    isRequired: false,
    name: 'transaction_hash'
  })
  transactionHash?: TransactionHash;

  @jsonMember({
    isRequired: false,
    constructor: Boolean,
    name: 'finalized_approvals'
  })
  finalizedApprovals?: boolean;

  constructor(transactionHash?: TransactionHash, finalizedApprovals?: boolean) {
    this.transactionHash = transactionHash;
    this.finalizedApprovals = finalizedApprovals;
  }
}

@jsonObject
export class ParamDeployHash {
  @jsonMember({ name: 'deploy_hash', constructor: String })
  deployHash?: string;

  @jsonMember({
    isRequired: false,
    constructor: Boolean,
    name: 'finalized_approvals'
  })
  finalizedApprovals?: boolean;

  constructor(deployHash?: string, finalizedApprovals?: boolean) {
    this.deployHash = deployHash;
    this.finalizedApprovals = finalizedApprovals;
  }
}

@jsonObject
export class ParamBlockIdentifier {
  @jsonMember({
    isRequired: false,
    constructor: BlockIdentifier,
    name: 'block_identifier'
  })
  blockIdentifier?: BlockIdentifier;

  constructor(blockIdentifier?: BlockIdentifier) {
    this.blockIdentifier = blockIdentifier;
  }

  static byHeight(height: number): ParamBlockIdentifier {
    return new ParamBlockIdentifier(new BlockIdentifier(undefined, height));
  }

  static byHash(hash: string): ParamBlockIdentifier {
    return new ParamBlockIdentifier(new BlockIdentifier(hash));
  }
}

@jsonObject
export class ParamGetAccountInfoBalance {
  @jsonMember({ constructor: String, name: 'account_identifier' })
  accountIdentifier: string;

  @jsonMember({ constructor: ParamBlockIdentifier })
  paramBlockIdentifier: ParamBlockIdentifier;

  constructor(
    accountIdentifier: string,
    paramBlockIdentifier: ParamBlockIdentifier
  ) {
    this.accountIdentifier = accountIdentifier;
    this.paramBlockIdentifier = paramBlockIdentifier;
  }
}

@jsonObject
export class EntityIdentifier {
  @jsonMember({
    constructor: AccountHash,
    name: 'AccountHash',
    isRequired: false,
    deserializer: (json: string) => {
      if (!json) return;
      return AccountHash.fromJSON(json);
    },
    serializer: (value: AccountHash) => {
      if (!value) return;
      return value.toJSON();
    }
  })
  accountHash?: AccountHash;

  @jsonMember({
    constructor: PublicKey,
    name: 'PublicKey',
    isRequired: false,
    deserializer: (json: string) => {
      if (!json) return;
      return PublicKey.fromJSON(json);
    },
    serializer: (value: PublicKey) => {
      if (!value) return;
      return value.toJSON();
    }
  })
  publicKey?: PublicKey;

  @jsonMember({
    constructor: EntityAddr,
    name: 'EntityAddr',
    isRequired: false,
    deserializer: (json: string) => {
      if (!json) return;
      return EntityAddr.fromJSON(json);
    },
    serializer: (value: EntityAddr) => {
      if (!value) return;
      return value.toJSON();
    }
  })
  entityAddr?: EntityAddr;

  constructor(
    accountHash?: AccountHash,
    publicKey?: PublicKey,
    entityAddr?: EntityAddr
  ) {
    this.accountHash = accountHash;
    this.publicKey = publicKey;
    this.entityAddr = entityAddr;
  }

  static fromAccountHash(accountHash: AccountHash): EntityIdentifier {
    return new EntityIdentifier(accountHash);
  }

  static fromPublicKey(pubKey: PublicKey): EntityIdentifier {
    return new EntityIdentifier(undefined, pubKey);
  }

  static fromEntityAddr(entityAddr: EntityAddr): EntityIdentifier {
    return new EntityIdentifier(undefined, undefined, entityAddr);
  }
}

@jsonObject
export class ParamGetStateEntity {
  @jsonMember({
    constructor: EntityIdentifier,
    name: 'entity_identifier'
  })
  entityIdentifier: EntityIdentifier;

  @jsonMember({
    isRequired: false,
    constructor: BlockIdentifier,
    name: 'block_identifier'
  })
  blockIdentifier?: BlockIdentifier;

  constructor(
    entityIdentifier: EntityIdentifier,
    blockIdentifier?: BlockIdentifier
  ) {
    this.entityIdentifier = entityIdentifier;
    this.blockIdentifier = blockIdentifier;
  }
}

@jsonObject
export class AccountIdentifier {
  @jsonMember({
    constructor: AccountHash,
    isRequired: false,
    deserializer: (json: string) => {
      if (!json) return;
      return AccountHash.fromJSON(json);
    },
    serializer: (value: AccountHash) => {
      if (!value) return;
      return value.toJSON();
    }
  })
  accountHash?: AccountHash;

  @jsonMember({
    constructor: PublicKey,
    isRequired: false,
    deserializer: (json: string) => {
      if (!json) return;
      return PublicKey.fromJSON(json);
    },
    serializer: (value: PublicKey) => {
      if (!value) return;
      return value.toJSON();
    }
  })
  publicKey?: PublicKey;

  constructor(accountHash?: AccountHash, publicKey?: PublicKey) {
    this.accountHash = accountHash;
    this.publicKey = publicKey;
  }
}

@jsonObject
export class PutDeployRequest {
  @jsonMember({ constructor: Deploy })
  deploy: Deploy;

  constructor(deploy: Deploy) {
    this.deploy = deploy;
  }
}

@jsonObject
export class PutTransactionRequest {
  @jsonMember({ constructor: TransactionWrapper })
  transactionWrapper: TransactionWrapper;

  constructor(transaction: TransactionWrapper) {
    this.transactionWrapper = transaction;
  }
}

@jsonObject
export class GlobalStateIdentifier {
  @jsonMember({ isRequired: false, constructor: String, name: 'BlockHash' })
  blockHash?: string;

  @jsonMember({ isRequired: false, constructor: Number, name: 'BlockHeight' })
  blockHeight?: number;

  @jsonMember({ isRequired: false, constructor: String, name: 'StateRootHash' })
  stateRoot?: string;

  constructor(blockHash?: string, blockHeight?: number, stateRoot?: string) {
    this.blockHash = blockHash;
    this.blockHeight = blockHeight;
    this.stateRoot = stateRoot;
  }
}

@jsonObject
export class EraIdentifier {
  @jsonMember({
    isRequired: false,
    constructor: BlockIdentifier,
    name: 'Block'
  })
  block?: BlockIdentifier;

  @jsonMember({ isRequired: false, constructor: Number, name: 'Era' })
  era?: number;

  constructor(block?: BlockIdentifier, era?: number) {
    this.block = block;
    this.era = era;
  }
}

@jsonObject
export class ParamDictionaryIdentifierURef {
  @jsonMember({ constructor: String, name: 'dictionary_item_key' })
  dictionaryItemKey: string;

  @jsonMember({ constructor: String, name: 'seed_uref' })
  seedUref: string;

  constructor(dictionaryItemKey: string, seedUref: string) {
    this.dictionaryItemKey = dictionaryItemKey;
    this.seedUref = seedUref;
  }
}

@jsonObject
export class AccountNamedKey {
  @jsonMember({ constructor: String })
  key: string;

  @jsonMember({ constructor: String, name: 'dictionary_name' })
  dictionaryName: string;

  @jsonMember({ constructor: String, name: 'dictionary_item_key' })
  dictionaryItemKey: string;

  constructor(key: string, dictionaryName: string, dictionaryItemKey: string) {
    this.key = key;
    this.dictionaryName = dictionaryName;
    this.dictionaryItemKey = dictionaryItemKey;
  }
}

@jsonObject
export class ParamDictionaryIdentifierContractNamedKey {
  @jsonMember({ constructor: String })
  key: string;

  @jsonMember({ constructor: String, name: 'dictionary_name' })
  dictionaryName: string;

  @jsonMember({ constructor: String, name: 'dictionary_item_key' })
  dictionaryItemKey: string;

  constructor(key: string, dictionaryName: string, dictionaryItemKey: string) {
    this.key = key;
    this.dictionaryName = dictionaryName;
    this.dictionaryItemKey = dictionaryItemKey;
  }
}

@jsonObject
export class ParamDictionaryIdentifier {
  @jsonMember({
    isRequired: false,
    constructor: AccountNamedKey,
    name: 'AccountNamedKey'
  })
  accountNamedKey?: AccountNamedKey;

  @jsonMember({
    isRequired: false,
    constructor: ParamDictionaryIdentifierContractNamedKey,
    name: 'ContractNamedKey'
  })
  contractNamedKey?: ParamDictionaryIdentifierContractNamedKey;

  @jsonMember({
    isRequired: false,
    constructor: ParamDictionaryIdentifierURef,
    name: 'URef'
  })
  uRef?: ParamDictionaryIdentifierURef;

  @jsonMember({ isRequired: false, constructor: String, name: 'Dictionary' })
  dictionary?: string;

  constructor(
    accountNamedKey?: AccountNamedKey,
    contractNamedKey?: ParamDictionaryIdentifierContractNamedKey,
    uRef?: ParamDictionaryIdentifierURef,
    dictionary?: string
  ) {
    this.accountNamedKey = accountNamedKey;
    this.contractNamedKey = contractNamedKey;
    this.uRef = uRef;
    this.dictionary = dictionary;
  }
}

@jsonObject
export class SpeculativeExecParams {
  @jsonMember({ constructor: Deploy })
  deploy: Deploy;

  @jsonMember({
    isRequired: false,
    constructor: BlockIdentifier,
    name: 'block_identifier'
  })
  blockIdentifier?: BlockIdentifier;

  constructor(deploy: Deploy, blockIdentifier?: BlockIdentifier) {
    this.deploy = deploy;
    this.blockIdentifier = blockIdentifier;
  }
}

@jsonObject
export class PurseIdentifier {
  @jsonMember({
    constructor: PublicKey,
    name: 'main_purse_under_public_key',
    isRequired: false,
    deserializer: (json: string) => {
      if (!json) return;
      return PublicKey.fromJSON(json);
    },
    serializer: (value: PublicKey) => {
      if (!value) return;
      return value.toJSON();
    }
  })
  mainPurseUnderPublicKey?: PublicKey;

  @jsonMember({
    constructor: AccountHash,
    name: 'main_purse_under_account_hash',
    isRequired: false,
    deserializer: (json: string) => {
      if (!json) return;
      return AccountHash.fromJSON(json);
    },
    serializer: (value: AccountHash) => {
      if (!value) return;
      return value.toJSON();
    }
  })
  mainPurseUnderAccountHash?: AccountHash;

  @jsonMember({
    constructor: EntityAddr,
    name: 'main_purse_under_entity_addr',
    isRequired: false,
    deserializer: (json: string) => {
      if (!json) return;
      return EntityAddr.fromJSON(json);
    },
    serializer: (value: EntityAddr) => {
      if (!value) return;
      return value.toJSON();
    }
  })
  mainPurseUnderEntityAddr?: EntityAddr;

  @jsonMember({
    constructor: URef,
    isRequired: false,
    name: 'purse_uref',
    deserializer: (json: string) => {
      if (!json) return;
      return URef.fromJSON(json);
    },
    serializer: (value: URef) => {
      if (!value) return;
      return value.toJSON();
    }
  })
  purseUref?: URef;

  constructor(
    mainPurseUnderPublicKey?: PublicKey,
    mainPurseUnderAccountHash?: AccountHash,
    mainPurseUnderEntityAddr?: EntityAddr,
    purseUref?: URef
  ) {
    this.mainPurseUnderPublicKey = mainPurseUnderPublicKey;
    this.mainPurseUnderAccountHash = mainPurseUnderAccountHash;
    this.mainPurseUnderEntityAddr = mainPurseUnderEntityAddr;
    this.purseUref = purseUref;
  }

  static fromPublicKey(pubKey: PublicKey): PurseIdentifier {
    return new PurseIdentifier(pubKey);
  }

  static fromAccountHash(accountHash: AccountHash): PurseIdentifier {
    return new PurseIdentifier(undefined, accountHash);
  }

  static fromEntityAddr(entityAddr: EntityAddr): PurseIdentifier {
    return new PurseIdentifier(undefined, undefined, entityAddr);
  }

  static fromUref(uref: URef): PurseIdentifier {
    return new PurseIdentifier(undefined, undefined, undefined, uref);
  }
}

@jsonObject
export class QueryBalanceRequest {
  @jsonMember({ constructor: PurseIdentifier, name: 'purse_identifier' })
  purseIdentifier: PurseIdentifier;

  @jsonMember({
    isRequired: false,
    constructor: GlobalStateIdentifier,
    name: 'state_identifier'
  })
  stateIdentifier?: GlobalStateIdentifier;

  constructor(
    purseIdentifier: PurseIdentifier,
    stateIdentifier?: GlobalStateIdentifier
  ) {
    this.purseIdentifier = purseIdentifier;
    this.stateIdentifier = stateIdentifier;
  }
}

@jsonObject
export class QueryBalanceDetailsRequest {
  @jsonMember({ constructor: PurseIdentifier, name: 'purse_identifier' })
  purseIdentifier: PurseIdentifier;

  @jsonMember({
    isRequired: false,
    constructor: GlobalStateIdentifier,
    name: 'state_identifier'
  })
  stateIdentifier?: GlobalStateIdentifier;

  constructor(
    purseIdentifier: PurseIdentifier,
    stateIdentifier?: GlobalStateIdentifier
  ) {
    this.purseIdentifier = purseIdentifier;
    this.stateIdentifier = stateIdentifier;
  }
}

@jsonObject
export class InfoGetRewardRequest {
  @jsonMember({
    constructor: PublicKey,
    isRequired: false,
    deserializer: (json: string) => PublicKey.fromJSON(json),
    serializer: (value: PublicKey) => value.toJSON()
  })
  validator: PublicKey;

  @jsonMember({
    isRequired: false,
    constructor: PublicKey,
    deserializer: (json: string) => {
      if (!json) return;
      return PublicKey.fromJSON(json);
    },
    serializer: (value: PublicKey) => {
      if (!value) return;
      return value.toJSON();
    }
  })
  delegator?: PublicKey;

  @jsonMember({
    isRequired: false,
    constructor: EraIdentifier,
    name: 'era_identifier'
  })
  eraIdentifier?: EraIdentifier;

  constructor(
    validator: PublicKey,
    delegator?: PublicKey,
    eraIdentifier?: EraIdentifier
  ) {
    this.validator = validator;
    this.delegator = delegator;
    this.eraIdentifier = eraIdentifier;
  }
}

@jsonObject
export class StateGetBalanceRequest {
  @jsonMember({ name: 'state_root_hash', constructor: String })
  stateRootHash: string;

  @jsonMember({ name: 'purse_uref', constructor: String })
  purseURef?: string;

  constructor(stateRootHash: string, purseURef: string) {
    this.stateRootHash = stateRootHash;
    this.purseURef = purseURef;
  }
}

@jsonObject
export class StateGetDictionaryRequest {
  @jsonMember({ name: 'state_root_hash', constructor: String })
  stateRootHash: string;

  @jsonMember({
    name: 'dictionary_identifier',
    constructor: ParamDictionaryIdentifier
  })
  dictionaryIdentifier?: ParamDictionaryIdentifier;

  constructor(
    stateRootHash: string,
    dictionaryIdentifier?: ParamDictionaryIdentifier
  ) {
    this.stateRootHash = stateRootHash;
    this.dictionaryIdentifier = dictionaryIdentifier;
  }
}
