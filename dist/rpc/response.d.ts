import { IDValue } from './id_value';
import { RpcError } from './error';
import { AuctionState, Account, EntryPointValue, Block, BlockHeader, BlockHeaderV1, BlockV1, BlockWithSignatures, Transfer, EraSummary, Deploy, DeployExecutionInfo, DeployExecutionResult, ExecutionInfo, ExecutionResult, Transaction, TransactionHash, TransactionWrapper, Timestamp, MinimalBlockInfo, NamedKey, StoredValue, Hash, PublicKey, CLValueUInt512, AuctionStateV1, AuctionStateV2, AddressableEntity } from '../types';
export declare class RpcResponse {
    version: string;
    id?: IDValue;
    result: any;
    error?: RpcError;
}
export declare class StateGetAuctionInfoResult {
    version: string;
    auctionState: AuctionState;
    rawJSON?: any;
}
export declare class StateGetAuctionInfoV1Result {
    version: string;
    auctionState: AuctionStateV1;
    rawJSON?: any;
}
export declare class StateGetAuctionInfoV2Result {
    version: string;
    auctionState: AuctionStateV2;
    rawJSON?: any;
}
export declare class StateGetBalanceResult {
    apiVersion: string;
    balanceValue: CLValueUInt512;
    rawJSON: any;
}
export declare class StateGetAccountInfo {
    apiVersion: string;
    account: Account;
    rawJSON: any;
}
export declare class RpcAddressableEntity {
    entity: AddressableEntity;
    namedKeys: NamedKey[];
    entryPoints?: EntryPointValue[];
}
export declare class EntityOrAccount {
    addressableEntity?: RpcAddressableEntity;
    legacyAccount?: Account;
}
export declare class StateGetEntityResult {
    apiVersion: string;
    entity: EntityOrAccount;
    merkleProof: any;
    rawJSON: any;
}
export declare class ChainGetBlockResultV1Compatible {
    apiVersion: string;
    blockWithSignatures?: BlockWithSignatures;
    blockV1?: BlockV1;
    rawJSON?: any;
}
export declare class ChainGetBlockResult {
    apiVersion: string;
    block: Block;
    rawJSON?: any;
    static fromJSON(data: any): ChainGetBlockResult;
    static newChainGetBlockResultFromV1Compatible(result: ChainGetBlockResultV1Compatible, rawJSON: any): ChainGetBlockResult;
}
export declare class ChainGetBlockTransfersResult {
    version: string;
    blockHash: string;
    transfers: Transfer[];
    rawJSON?: any;
}
export declare class ChainGetEraSummaryResult {
    version: string;
    eraSummary: EraSummary;
    rawJSON?: any;
}
export declare class InfoGetDeployResult {
    apiVersion: string;
    deploy: Deploy;
    executionInfo?: DeployExecutionInfo;
    executionResultsV1?: DeployExecutionResult[];
    rawJSON: any;
    /**
     * Converts the deployment result into a transaction result.
     * It prefers the newer executionInfo format if available,
     * otherwise falls back to legacy execution results.
     */
    toInfoGetTransactionResult(): InfoGetTransactionResult;
}
export declare class InfoGetTransactionResult {
    apiVersion: string;
    transaction: Transaction;
    executionInfo?: ExecutionInfo;
    rawJSON: any;
    constructor(apiVersion: string, transaction: Transaction, executionInfo?: ExecutionInfo, rawJSON?: string);
    static fromJSON(json: any): InfoGetTransactionResult | null;
}
export declare class InfoGetDeployResultV1Compatible {
    apiVersion: string;
    deploy: Deploy;
    executionResults: DeployExecutionResult[];
    blockHash?: Hash;
    blockHeight?: number;
    rawJSON: any;
    static fromJSON(json: any): InfoGetDeployResultV1Compatible | undefined;
}
export declare class InfoGetTransactionResultV1Compatible {
    apiVersion: string;
    transaction?: TransactionWrapper;
    deploy?: Deploy;
    executionInfo?: ExecutionInfo;
    executionResults: DeployExecutionResult[];
    blockHash?: Hash;
    blockHeight?: number;
    rawJSON?: any;
    static newInfoGetTransactionResultFromV1Compatible(parsedResult: InfoGetTransactionResultV1Compatible, rawJSON: any): InfoGetTransactionResult;
    static fromJSON(json: any): InfoGetTransactionResultV1Compatible | undefined;
}
export declare class ChainGetEraInfoResult {
    version: string;
    eraSummary: EraSummary;
    rawJSON: any;
}
export declare class StateGetItemResult {
    storedValue: StoredValue;
    merkleProof: string;
    rawJSON: any;
}
export declare class StateGetDictionaryResult {
    apiVersion: string;
    dictionaryKey: string;
    storedValue: StoredValue;
    merkleProof: string;
    rawJSON: any;
}
export declare class QueryGlobalStateResult {
    apiVersion: string;
    blockHeader?: BlockHeader;
    storedValue: StoredValue;
    merkleProof: string;
    rawJSON?: any;
}
export declare class InfoGetPeerResult {
    apiVersion: string;
    peers: NodePeer[];
    rawJSON?: any;
}
export declare class NodePeer {
    nodeId: string;
    address: string;
}
export declare class ChainGetStateRootHashResult {
    version: string;
    stateRootHash: Hash;
    rawJSON?: any;
}
export declare enum ValidatorState {
    Added = "Added",
    Removed = "Removed",
    Banned = "Banned",
    CannotPropose = "CannotPropose",
    SeenAsFaulty = "SeenAsFaulty"
}
export declare class StatusChanges {
    eraID: number;
    validatorState: ValidatorState;
    rawJSON: any;
}
export declare class ValidatorChanges {
    publicKey: PublicKey;
    statusChanges: StatusChanges[];
    rawJSON: any;
}
export declare class InfoGetValidatorChangesResult {
    apiVersion: string;
    changes: ValidatorChanges[];
    rawJSON: any;
}
export declare class NodeNextUpgrade {
    activationPoint: number;
    protocolVersion: string;
}
export declare class BlockSyncStatus {
    blockHash?: Hash;
    blockHeight?: number;
    acquisitionState?: string;
}
export declare class BlockSynchronizerStatus {
    historical?: BlockSyncStatus;
    forward?: BlockSyncStatus;
}
export declare class InfoGetStatusResult {
    apiVersion: string;
    protocolVersion: string;
    buildVersion: string;
    chainSpecName: string;
    lastAddedBlockInfo: MinimalBlockInfo;
    nextUpgrade?: NodeNextUpgrade;
    ourPublicSigningKey: string;
    peers: NodePeer[];
    roundLength: string;
    startingStateRootHash: string;
    uptime: string;
    reactorState: string;
    lastProgress: Timestamp;
    latestSwitchBlockHash: Hash;
    availableBlockRange: {
        low: number;
        high: number;
    };
    blockSync: BlockSynchronizerStatus;
    rawJSON: any;
}
export declare class PutDeployResult {
    apiVersion: string;
    deployHash: Hash;
    rawJSON?: any;
}
export declare class PutTransactionResult {
    apiVersion: string;
    transactionHash: TransactionHash;
    rawJSON?: any;
}
export declare class SpeculativeExecResult {
    apiVersion: string;
    blockHash: Hash;
    executionResult: ExecutionResult;
    rawJSON?: any;
}
export declare class QueryBalanceResult {
    apiVersion: string;
    balance: CLValueUInt512;
    rawJSON?: any;
}
export declare class QueryBalanceDetailsResult {
    apiVersion: string;
    totalBalance: CLValueUInt512;
    availableBalance: CLValueUInt512;
    totalBalanceProof: string;
    holds: BalanceHoldWithProof[];
    rawJSON?: any;
}
export declare class InfoGetRewardResult {
    apiVersion: string;
    delegationRate: number;
    eraID: number;
    rewardAmount: CLValueUInt512;
    switchBlockHash: Hash;
    rawJSON?: any;
}
export declare class BalanceHoldWithProof {
    amount: CLValueUInt512;
    proof: string;
}
declare class ChainspecBytes {
    chainspecBytes?: string;
    maybeGenesisAccountsBytes?: string;
    maybeGlobalStateBytes?: string;
}
export declare class InfoGetChainspecResult {
    apiVersion: string;
    chainspecBytes: ChainspecBytes;
    rawJSON?: any;
}
export declare class QueryGlobalStateResultV1Compatible {
    apiVersion: string;
    blockHeader?: BlockHeaderV1;
    storedValue: StoredValue;
    merkleProof: string;
}
export {};
