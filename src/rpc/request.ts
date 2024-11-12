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
  @jsonMember({ constructor: String })
  version: string;

  @jsonMember({ isRequired: false, constructor: IDValue })
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
  @jsonMember({ constructor: String })
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
export class ParamQueryGlobalState {
  @jsonMember({ isRequired: false, constructor: () => ParamQueryGlobalStateID })
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
export class ParamQueryGlobalStateID {
  @jsonMember({ isRequired: false, constructor: String })
  stateRootHash?: string;

  @jsonMember({ isRequired: false, constructor: String })
  blockHash?: string;

  @jsonMember({ isRequired: false, constructor: Number })
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
export class ParamTransactionHash {
  @jsonMember({ isRequired: false, constructor: TransactionHash })
  transactionHash?: TransactionHash;

  @jsonMember({ isRequired: false, constructor: Boolean })
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

  @jsonMember({ isRequired: false, constructor: Boolean })
  finalizedApprovals?: boolean;

  constructor(deployHash?: string, finalizedApprovals?: boolean) {
    this.deployHash = deployHash;
    this.finalizedApprovals = finalizedApprovals;
  }
}

@jsonObject
export class ParamGetAccountInfoBalance {
  @jsonMember({ constructor: String })
  accountIdentifier: string;

  @jsonMember({ constructor: () => ParamBlockIdentifier })
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
export class ParamGetStateEntity {
  @jsonMember({ constructor: () => EntityIdentifier })
  entityIdentifier: EntityIdentifier;

  @jsonMember({ isRequired: false, constructor: () => BlockIdentifier })
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
  @jsonMember({ isRequired: false, constructor: AccountHash })
  accountHash?: AccountHash;

  @jsonMember({ isRequired: false, constructor: PublicKey })
  publicKey?: PublicKey;

  constructor(accountHash?: AccountHash, publicKey?: PublicKey) {
    this.accountHash = accountHash;
    this.publicKey = publicKey;
  }
}

@jsonObject
export class EntityIdentifier {
  @jsonMember({ isRequired: false, constructor: AccountHash })
  accountHash?: AccountHash;

  @jsonMember({ isRequired: false, constructor: PublicKey })
  publicKey?: PublicKey;

  @jsonMember({ isRequired: false, constructor: EntityAddr })
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
  transaction: TransactionWrapper;

  constructor(transaction: TransactionWrapper) {
    this.transaction = transaction;
  }
}

@jsonObject
export class BlockIdentifier {
  @jsonMember({ isRequired: false, constructor: String })
  hash?: string;

  @jsonMember({ isRequired: false, constructor: Number })
  height?: number;

  constructor(hash?: string, height?: number) {
    this.hash = hash;
    this.height = height;
  }
}

@jsonObject
export class GlobalStateIdentifier {
  @jsonMember({ isRequired: false, constructor: String })
  blockHash?: string;

  @jsonMember({ isRequired: false, constructor: Number })
  blockHeight?: number;

  @jsonMember({ isRequired: false, constructor: String })
  stateRoot?: string;

  constructor(blockHash?: string, blockHeight?: number, stateRoot?: string) {
    this.blockHash = blockHash;
    this.blockHeight = blockHeight;
    this.stateRoot = stateRoot;
  }
}

@jsonObject
export class EraIdentifier {
  @jsonMember({ isRequired: false, constructor: BlockIdentifier })
  block?: BlockIdentifier;

  @jsonMember({ isRequired: false, constructor: Number })
  era?: number;

  constructor(block?: BlockIdentifier, era?: number) {
    this.block = block;
    this.era = era;
  }
}

@jsonObject
export class ParamBlockIdentifier {
  @jsonMember({ isRequired: false, constructor: BlockIdentifier })
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
export class ParamDictionaryIdentifier {
  @jsonMember({ isRequired: false, constructor: () => AccountNamedKey })
  accountNamedKey?: AccountNamedKey;

  @jsonMember({
    isRequired: false,
    constructor: () => ParamDictionaryIdentifierContractNamedKey
  })
  contractNamedKey?: ParamDictionaryIdentifierContractNamedKey;

  @jsonMember({
    isRequired: false,
    constructor: () => ParamDictionaryIdentifierURef
  })
  uRef?: ParamDictionaryIdentifierURef;

  @jsonMember({ isRequired: false, constructor: String })
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
export class AccountNamedKey {
  @jsonMember({ constructor: String })
  key: string;

  @jsonMember({ constructor: String })
  dictionaryName: string;

  @jsonMember({ constructor: String })
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

  @jsonMember({ constructor: String })
  dictionaryName: string;

  @jsonMember({ constructor: String })
  dictionaryItemKey: string;

  constructor(key: string, dictionaryName: string, dictionaryItemKey: string) {
    this.key = key;
    this.dictionaryName = dictionaryName;
    this.dictionaryItemKey = dictionaryItemKey;
  }
}

@jsonObject
export class ParamDictionaryIdentifierURef {
  @jsonMember({ constructor: String })
  dictionaryItemKey: string;

  @jsonMember({ constructor: String })
  seedUref: string;

  constructor(dictionaryItemKey: string, seedUref: string) {
    this.dictionaryItemKey = dictionaryItemKey;
    this.seedUref = seedUref;
  }
}

@jsonObject
export class SpeculativeExecParams {
  @jsonMember({ constructor: Deploy })
  deploy: Deploy;

  @jsonMember({ isRequired: false, constructor: BlockIdentifier })
  blockIdentifier?: BlockIdentifier;

  constructor(deploy: Deploy, blockIdentifier?: BlockIdentifier) {
    this.deploy = deploy;
    this.blockIdentifier = blockIdentifier;
  }
}

@jsonObject
export class PurseIdentifier {
  @jsonMember({ isRequired: false, constructor: PublicKey })
  mainPurseUnderPublicKey?: PublicKey;

  @jsonMember({ isRequired: false, constructor: AccountHash })
  mainPurseUnderAccountHash?: AccountHash;

  @jsonMember({ isRequired: false, constructor: EntityAddr })
  mainPurseUnderEntityAddr?: EntityAddr;

  @jsonMember({ isRequired: false, constructor: URef })
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
  @jsonMember({ constructor: PurseIdentifier })
  purseIdentifier: PurseIdentifier;

  @jsonMember({ isRequired: false, constructor: GlobalStateIdentifier })
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
  @jsonMember({ constructor: PurseIdentifier })
  purseIdentifier: PurseIdentifier;

  @jsonMember({ isRequired: false, constructor: GlobalStateIdentifier })
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
  @jsonMember({ constructor: PublicKey })
  validator: PublicKey;

  @jsonMember({ isRequired: false, constructor: PublicKey })
  delegator?: PublicKey;

  @jsonMember({ isRequired: false, constructor: EraIdentifier })
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
