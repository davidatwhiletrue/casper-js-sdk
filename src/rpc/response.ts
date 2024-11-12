import {
  AnyT,
  jsonArrayMember,
  jsonMember,
  jsonObject,
  TypedJSON
} from 'typedjson';
import { IDValue } from './id_value';
import { RpcError } from './error';
import {
  AuctionState,
  Account,
  EntryPointValue,
  Block,
  BlockHeader,
  BlockHeaderV1,
  BlockV1,
  BlockWithSignatures,
  Transfer,
  EraSummary,
  Deploy,
  DeployExecutionInfo,
  DeployExecutionResult,
  ExecutionInfo,
  ExecutionResult,
  Transaction,
  TransactionHash,
  TransactionWrapper,
  InitiatorAddr,
  Timestamp,
  MinimalBlockInfo,
  NamedKey,
  StoredValue,
  Hash,
  PublicKey,
  CLValueUInt512
} from '../types';

@jsonObject
export class RpcResponse {
  @jsonMember({ name: 'jsonrpc', constructor: String })
  version: string;

  @jsonMember(() => ({ constructor: IDValue, name: 'id' }))
  id?: IDValue;

  @jsonMember({ name: 'result', constructor: String })
  result: string;

  @jsonMember(() => ({ name: 'error', constructor: RpcError }))
  error?: RpcError;
}

@jsonObject
export class StateGetAuctionInfoResult {
  @jsonMember({ name: 'api_version', constructor: String })
  version: string;

  @jsonMember(() => ({ name: 'auction_state', constructor: AuctionState }))
  auctionState: AuctionState;

  rawJSON?: string;
}

@jsonObject
export class StateGetBalanceResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember(() => ({ name: 'balance_value', constructor: CLValueUInt512 }))
  balanceValue: CLValueUInt512;

  public rawJSON: string;
}

@jsonObject
export class StateGetAccountInfo {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'account', constructor: Account })
  account: Account;

  public rawJSON: string;
}

@jsonObject
export class EntityOrAccount {
  @jsonMember({
    name: 'AddressableEntity',
    constructor: () => RpcAddressableEntity
  })
  addressableEntity?: RpcAddressableEntity;

  @jsonMember({
    name: 'LegacyAccount',
    constructor: Account
  })
  legacyAccount?: Account;
}

@jsonObject
export class RpcAddressableEntity {
  @jsonMember({ name: 'entity', constructor: RpcAddressableEntity })
  entity: RpcAddressableEntity;

  @jsonMember({ name: 'named_keys', constructor: NamedKey })
  namedKeys: NamedKey[];

  @jsonMember({ name: 'entry_points', constructor: EntryPointValue })
  entryPoints?: EntryPointValue[];
}

@jsonObject
export class StateGetEntityResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'entity', constructor: EntityOrAccount })
  entity: EntityOrAccount;

  @jsonMember({ name: 'merkle_proof', constructor: AnyT })
  merkleProof: any;

  @jsonMember({ name: 'rawJSON', constructor: AnyT })
  rawJSON: any;
}

@jsonObject
export class ChainGetBlockResultV1Compatible {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({
    name: 'block_with_signatures',
    constructor: BlockWithSignatures
  })
  blockWithSignatures?: BlockWithSignatures;

  @jsonMember({ name: 'block', constructor: BlockV1 })
  blockV1?: BlockV1;

  public rawJSON?: string;
}

@jsonObject
export class ChainGetBlockResult {
  @jsonMember({ name: 'api_version', constructor: String })
  public apiVersion: string;

  @jsonMember({ constructor: Block })
  public block: Block;

  public rawJSON?: string;

  public static fromJSON(data: any): ChainGetBlockResult {
    const parsedResult = TypedJSON.parse(data, ChainGetBlockResult);

    if (!parsedResult) throw new Error('Failed to parse ChainGetBlockResult');

    parsedResult.rawJSON = JSON.stringify(data);

    return parsedResult;
  }

  public static newChainGetBlockResultFromV1Compatible(
    result: ChainGetBlockResultV1Compatible,
    rawJSON: string
  ): ChainGetBlockResult {
    const chainGetBlockResult = new ChainGetBlockResult();
    chainGetBlockResult.apiVersion = result.apiVersion;
    chainGetBlockResult.rawJSON = rawJSON;

    if (result.blockV1) {
      chainGetBlockResult.block = Block.newBlockFromBlockV1(result.blockV1);
    } else if (result.blockWithSignatures) {
      chainGetBlockResult.block = Block.newBlockFromBlockWrapper(
        result.blockWithSignatures.block,
        result.blockWithSignatures.proofs
      );
    } else {
      throw new Error('Incorrect RPC response structure');
    }

    return chainGetBlockResult;
  }
}

@jsonObject
export class ChainGetBlockTransfersResult {
  @jsonMember({ name: 'api_version', constructor: String })
  public version: string;

  @jsonMember({ name: 'block_hash', constructor: String })
  public blockHash: string;

  @jsonArrayMember(Transfer, { name: 'transfers' })
  public transfers: Transfer[];

  public rawJSON?: string;
}

@jsonObject
export class ChainGetEraSummaryResult {
  @jsonMember({ name: 'api_version', constructor: String })
  public version: string;

  @jsonMember({ name: 'era_summary', constructor: EraSummary })
  public eraSummary: EraSummary;

  public rawJSON?: string;
}

@jsonObject
export class InfoGetDeployResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'deploy', constructor: Deploy })
  deploy: Deploy;

  @jsonMember({ name: 'execution_info', constructor: DeployExecutionInfo })
  executionResults: DeployExecutionInfo;

  rawJSON: string;

  toInfoGetTransactionResult(): InfoGetTransactionResult {
    return new InfoGetTransactionResult(
      this.apiVersion,
      Deploy.newTransactionFromDeploy(this.deploy),
      new ExecutionInfo(
        this.executionResults.blockHash,
        this.executionResults.blockHeight,
        this.executionResults.executionResult
      ),
      this.rawJSON
    );
  }
}

@jsonObject
export class InfoGetTransactionResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ constructor: Transaction })
  transaction: Transaction;

  @jsonMember({ name: 'execution_info', constructor: ExecutionInfo })
  executionInfo?: ExecutionInfo;

  public rawJSON: string;

  constructor(
    apiVersion: string,
    transaction: Transaction,
    executionInfo?: ExecutionInfo,
    rawJSON = ''
  ) {
    this.apiVersion = apiVersion;
    this.transaction = transaction;
    this.executionInfo = executionInfo;
    this.rawJSON = rawJSON;
  }

  static fromJSON(json: string): InfoGetTransactionResult | null {
    const temp = TypedJSON.parse(json, InfoGetTransactionResultV1Compatible);

    if (temp) {
      const result = InfoGetTransactionResultV1Compatible.newInfoGetTransactionResultFromV1Compatible(
        temp,
        json
      );
      return result;
    }

    return TypedJSON.parse(json, InfoGetTransactionResult) ?? null;
  }
}

@jsonObject
export class InfoGetDeployResultV1Compatible {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ constructor: Deploy })
  deploy: Deploy;

  @jsonArrayMember(DeployExecutionResult, { name: 'execution_results' })
  executionResults: DeployExecutionResult[];

  @jsonMember({ name: 'block_hash', constructor: Hash })
  blockHash?: Hash;

  @jsonMember({ name: 'block_height', constructor: Number })
  blockHeight?: number;

  public rawJSON: string;
}

@jsonObject
export class InfoGetTransactionResultV1Compatible {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ constructor: TransactionWrapper })
  transaction?: TransactionWrapper;

  @jsonMember({ constructor: Deploy })
  deploy?: Deploy;

  @jsonMember({ constructor: ExecutionInfo })
  executionInfo?: ExecutionInfo;

  @jsonArrayMember(DeployExecutionResult)
  executionResults: DeployExecutionResult[] = [];

  @jsonMember({ constructor: Hash })
  blockHash?: Hash;

  @jsonMember({ constructor: Number })
  blockHeight?: number;

  rawJSON?: string;

  public static newInfoGetTransactionResultFromV1Compatible(
    result: InfoGetTransactionResultV1Compatible,
    rawJSON: string
  ): InfoGetTransactionResult {
    const parsedResult = TypedJSON.parse(
      result,
      InfoGetTransactionResultV1Compatible
    );
    if (!parsedResult)
      throw new Error('Failed to parse InfoGetTransactionResultV1Compatible');

    if (parsedResult.transaction) {
      if (parsedResult.transaction.transactionV1) {
        return new InfoGetTransactionResult(
          parsedResult.apiVersion,
          Transaction.fromTransactionV1(parsedResult.transaction.transactionV1),
          parsedResult.executionInfo,
          rawJSON
        );
      }

      if (parsedResult.transaction.deploy) {
        const transaction = Deploy.newTransactionFromDeploy(
          parsedResult.transaction.deploy
        );
        const info = new InfoGetTransactionResult(
          parsedResult.apiVersion,
          transaction,
          parsedResult.executionInfo,
          rawJSON
        );

        if (parsedResult.executionResults.length > 0) {
          const executionInfo = ExecutionInfo.fromV1(
            parsedResult.executionResults,
            parsedResult.blockHeight
          );
          executionInfo.executionResult.initiator = new InitiatorAddr(
            parsedResult.deploy!.header.account
          );
          info.executionInfo = executionInfo;
        }
        return info;
      }
    }

    if (parsedResult.deploy) {
      const transaction = Deploy.newTransactionFromDeploy(parsedResult.deploy);
      const info = new InfoGetTransactionResult(
        parsedResult.apiVersion,
        transaction,
        parsedResult.executionInfo,
        rawJSON
      );

      if (parsedResult.executionResults.length > 0) {
        const executionInfo = ExecutionInfo.fromV1(
          parsedResult.executionResults,
          parsedResult.blockHeight
        );
        executionInfo.executionResult.initiator = new InitiatorAddr(
          parsedResult.deploy.header.account
        );
        info.executionInfo = executionInfo;
      }
      return info;
    }
    throw new Error('Incorrect RPC response structure');
  }
}

@jsonObject
export class ChainGetEraInfoResult {
  @jsonMember({ name: 'api_version', constructor: String })
  version: string;

  @jsonMember({ name: 'era_summary', constructor: EraSummary })
  eraSummary: EraSummary;

  public rawJSON: string;
}

@jsonObject
export class StateGetItemResult {
  @jsonMember({ name: 'stored_value', constructor: StoredValue })
  storedValue: StoredValue;

  @jsonMember({ name: 'merkle_proof', constructor: String })
  merkleProof: string;

  public rawJSON: string;
}

@jsonObject
export class StateGetDictionaryResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'dictionary_key', constructor: String })
  dictionaryKey: string;

  @jsonMember({ name: 'stored_value', constructor: StoredValue })
  storedValue: StoredValue;

  @jsonMember({ name: 'merkle_proof', constructor: String })
  merkleProof: string;

  public rawJSON: string;
}

@jsonObject
export class QueryGlobalStateResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'block_header', constructor: BlockHeader })
  blockHeader?: BlockHeader;

  @jsonMember({ name: 'stored_value', constructor: StoredValue })
  storedValue: StoredValue;

  @jsonMember({ name: 'merkle_proof', constructor: String })
  merkleProof: string;

  public rawJSON?: string;
}

@jsonObject
export class InfoGetPeerResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonArrayMember(() => NodePeer, { name: 'peers' })
  peers: NodePeer[];

  rawJSON?: string;
}

@jsonObject
export class NodePeer {
  @jsonMember({ name: 'node_id', constructor: String })
  nodeId: string;

  @jsonMember({ name: 'address', constructor: String })
  address: string;
}

@jsonObject
export class ChainGetStateRootHashResult {
  @jsonMember({ name: 'api_version', constructor: String })
  version: string;

  @jsonMember({ name: 'state_root_hash', constructor: Hash })
  stateRootHash: Hash;

  rawJSON?: string;
}

export enum ValidatorState {
  Added = 'Added',
  Removed = 'Removed',
  Banned = 'Banned',
  CannotPropose = 'CannotPropose',
  SeenAsFaulty = 'SeenAsFaulty'
}

@jsonObject
export class StatusChanges {
  @jsonMember({ name: 'era_id', constructor: Number })
  eraID: number;

  @jsonMember({ name: 'validator_change', constructor: String })
  validatorState: ValidatorState;

  rawJSON: string;
}

@jsonObject
export class ValidatorChanges {
  @jsonMember({ name: 'public_key', constructor: PublicKey })
  publicKey: PublicKey;

  @jsonArrayMember(StatusChanges, { name: 'status_changes' })
  statusChanges: StatusChanges[];

  rawJSON: string;
}

@jsonObject
export class InfoGetValidatorChangesResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonArrayMember(ValidatorChanges, { name: 'changes' })
  changes: ValidatorChanges[];

  rawJSON: string;
}

@jsonObject
export class InfoGetStatusResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'protocol_version', constructor: String })
  protocolVersion: string;

  @jsonMember({ name: 'build_version', constructor: String })
  buildVersion: string;

  @jsonMember({ name: 'chainspec_name', constructor: String })
  chainSpecName: string;

  @jsonMember({ name: 'last_added_block_info', constructor: MinimalBlockInfo })
  lastAddedBlockInfo: MinimalBlockInfo;

  @jsonMember({ name: 'next_upgrade', constructor: () => NodeNextUpgrade })
  nextUpgrade?: NodeNextUpgrade;

  @jsonMember({ name: 'our_public_signing_key', constructor: String })
  outPublicSigningKey: string;

  @jsonArrayMember(NodePeer, { name: 'peers' })
  peers: NodePeer[];

  @jsonMember({ name: 'round_length', constructor: String })
  roundLength: string;

  @jsonMember({ name: 'starting_state_root_hash', constructor: String })
  startingStateRootHash: string;

  @jsonMember({ name: 'uptime', constructor: String })
  uptime: string;

  @jsonMember({ name: 'reactor_state', constructor: String })
  reactorState: string;

  @jsonMember({ name: 'last_progress', constructor: Timestamp })
  lastProgress: Timestamp;

  @jsonMember({ name: 'latest_switch_block_hash', constructor: Hash })
  latestSwitchBlockHash: Hash;

  @jsonMember({
    name: 'available_block_range',
    constructor: () => ({
      low: jsonMember({ name: 'low', constructor: Number }),
      high: jsonMember({ name: 'high', constructor: Number })
    })
  })
  availableBlockRange: { low: number; high: number };

  @jsonMember({
    name: 'block_sync',
    constructor: () => BlockSync
  })
  blockSync: BlockSync;

  rawJSON: string;
}

@jsonObject
export class BlockSync {
  @jsonMember({ name: 'historical', constructor: String })
  historical?: string;

  @jsonMember({ name: 'forward', constructor: String })
  forward?: string;
}

@jsonObject
export class NodeNextUpgrade {
  @jsonMember({ name: 'activation_point', constructor: Number })
  activationPoint: number;

  @jsonMember({ name: 'protocol_version', constructor: String })
  protocolVersion: string;
}

@jsonObject
export class PutDeployResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'deploy_hash', constructor: Hash })
  deployHash: Hash;

  rawJSON?: string;
}

@jsonObject
export class PutTransactionResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'transaction_hash', constructor: TransactionHash })
  transactionHash: TransactionHash;

  rawJSON?: string;
}

@jsonObject
export class SpeculativeExecResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'block_hash', constructor: Hash })
  blockHash: Hash;

  @jsonMember({ name: 'execution_result', constructor: ExecutionResult })
  executionResult: ExecutionResult;

  rawJSON?: string;
}

@jsonObject
export class QueryBalanceResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'balance', constructor: CLValueUInt512 })
  balance: CLValueUInt512;

  rawJSON?: string;
}

@jsonObject
export class QueryBalanceDetailsResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'total_balance', constructor: CLValueUInt512 })
  totalBalance: CLValueUInt512;

  @jsonMember({ name: 'available_balance', constructor: CLValueUInt512 })
  availableBalance: CLValueUInt512;

  @jsonMember({ name: 'total_balance_proof', constructor: String })
  totalBalanceProof: string;

  @jsonArrayMember(() => BalanceHoldWithProof, { name: 'holds' })
  holds: BalanceHoldWithProof[];

  rawJSON?: string;
}

@jsonObject
export class InfoGetRewardResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'delegation_rate', constructor: Number })
  delegationRate: number;

  @jsonMember({ name: 'era_id', constructor: Number })
  eraID: number;

  @jsonMember({ name: 'reward_amount', constructor: CLValueUInt512 })
  rewardAmount: CLValueUInt512;

  @jsonMember({ name: 'switch_block_hash', constructor: Hash })
  switchBlockHash: Hash;

  rawJSON?: string;
}

@jsonObject
export class BalanceHoldWithProof {
  @jsonMember({ name: 'amount', constructor: CLValueUInt512 })
  amount: CLValueUInt512;

  @jsonMember({ name: 'proof', constructor: String })
  proof: string;
}

@jsonObject
class ChainspecBytes {
  @jsonMember({ name: 'chainspec_bytes', constructor: String })
  chainspecBytes?: string;

  @jsonMember({ name: 'maybe_genesis_accounts_bytes', constructor: String })
  maybeGenesisAccountsBytes?: string;

  @jsonMember({ name: 'maybe_global_state_bytes', constructor: String })
  maybeGlobalStateBytes?: string;
}

@jsonObject
export class InfoGetChainspecResult {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'chainspec_bytes', constructor: ChainspecBytes })
  chainspecBytes: ChainspecBytes;

  rawJSON?: string;
}

@jsonObject
export class QueryGlobalStateResultV1Compatible {
  @jsonMember({ name: 'api_version', constructor: String })
  apiVersion: string;

  @jsonMember({ name: 'block_header', constructor: BlockHeaderV1 })
  blockHeader?: BlockHeaderV1;

  @jsonMember({ name: 'stored_value', constructor: StoredValue })
  storedValue: StoredValue;

  @jsonMember({ name: 'merkle_proof', constructor: String })
  merkleProof: string;
}
