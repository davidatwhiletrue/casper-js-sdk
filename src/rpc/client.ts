// Package rpc provides access to the exported methods of RPC Client and data structures where serialized response.
// See details in [README.md]

import {
  ChainGetBlockResult,
  ChainGetBlockTransfersResult,
  ChainGetEraInfoResult,
  ChainGetEraSummaryResult,
  ChainGetStateRootHashResult,
  InfoGetChainspecResult,
  InfoGetDeployResult,
  InfoGetPeerResult,
  InfoGetRewardResult,
  InfoGetStatusResult,
  InfoGetTransactionResult,
  InfoGetValidatorChangesResult,
  PutDeployResult,
  PutTransactionResult,
  QueryBalanceDetailsResult,
  QueryBalanceResult,
  QueryGlobalStateResult,
  RpcResponse,
  StateGetAccountInfo,
  StateGetAuctionInfoResult,
  StateGetBalanceResult,
  StateGetDictionaryResult,
  StateGetEntityResult,
  StateGetItemResult
} from './response';
import {
  AccountIdentifier,
  EntityIdentifier,
  ParamBlockIdentifier,
  ParamDictionaryIdentifier,
  PurseIdentifier,
  RpcRequest
} from './request';
import { Deploy, PublicKey, Transaction } from '../types';

export interface ClientPOS {
  getLatestAuctionInfo(): Promise<StateGetAuctionInfoResult>;
  getAuctionInfoByHash(blockHash: string): Promise<StateGetAuctionInfoResult>;
  getAuctionInfoByHeight(height: number): Promise<StateGetAuctionInfoResult>;

  getEraInfoLatest(): Promise<ChainGetEraInfoResult>;
  getEraInfoByBlockHeight(height: number): Promise<ChainGetEraInfoResult>;
  getEraInfoByBlockHash(hash: string): Promise<ChainGetEraInfoResult>;

  getValidatorChangesInfo(): Promise<InfoGetValidatorChangesResult>;
}

export interface ClientInformational {
  getLatestBalance(purseURef: string): Promise<StateGetBalanceResult>;
  getBalanceByStateRootHash(
    purseURef: string,
    stateRootHash: string
  ): Promise<StateGetBalanceResult>;
  getDeploy(hash: string): Promise<InfoGetDeployResult>;
  getDeployFinalizedApproval(hash: string): Promise<InfoGetDeployResult>;
  getTransactionByTransactionHash(
    transactionHash: string
  ): Promise<InfoGetTransactionResult>;
  getTransactionByDeployHash(
    deployHash: string
  ): Promise<InfoGetTransactionResult>;
  getTransactionFinalizedApprovalByTransactionHash(
    transactionHash: string
  ): Promise<InfoGetTransactionResult>;
  getTransactionFinalizedApprovalByDeployHash(
    deployHash: string
  ): Promise<InfoGetTransactionResult>;

  getDictionaryItem(
    stateRootHash: string | null,
    uref: string,
    key: string
  ): Promise<StateGetDictionaryResult>;
  getDictionaryItemByIdentifier(
    stateRootHash: string | null,
    identifier: ParamDictionaryIdentifier
  ): Promise<StateGetDictionaryResult>;
  getStateItem(
    stateRootHash: string | null,
    key: string,
    path: string[]
  ): Promise<StateGetItemResult>;

  queryLatestGlobalState(
    key: string,
    path: string[]
  ): Promise<QueryGlobalStateResult>;
  queryGlobalStateByBlockHash(
    blockHash: string,
    key: string,
    path: string[]
  ): Promise<QueryGlobalStateResult>;
  queryGlobalStateByBlockHeight(
    blockHeight: number,
    key: string,
    path: string[]
  ): Promise<QueryGlobalStateResult>;
  queryGlobalStateByStateHash(
    stateRootHash: string | null,
    key: string,
    path: string[]
  ): Promise<QueryGlobalStateResult>;

  getAccountInfoByBlockHash(
    blockHash: string,
    pub: PublicKey
  ): Promise<StateGetAccountInfo>;
  getAccountInfoByBlockHeight(
    blockHeight: number,
    pub: PublicKey
  ): Promise<StateGetAccountInfo>;
  getAccountInfo(
    blockIdentifier: ParamBlockIdentifier | null,
    accountIdentifier: AccountIdentifier
  ): Promise<StateGetAccountInfo>;

  getLatestEntity(
    entityIdentifier: EntityIdentifier
  ): Promise<StateGetEntityResult>;
  getEntityByBlockHash(
    entityIdentifier: EntityIdentifier,
    hash: string
  ): Promise<StateGetEntityResult>;
  getEntityByBlockHeight(
    entityIdentifier: EntityIdentifier,
    height: number
  ): Promise<StateGetEntityResult>;

  getLatestBlock(): Promise<ChainGetBlockResult>;
  getBlockByHash(hash: string): Promise<ChainGetBlockResult>;
  getBlockByHeight(height: number): Promise<ChainGetBlockResult>;

  getLatestBlockTransfers(): Promise<ChainGetBlockTransfersResult>;
  getBlockTransfersByHash(
    blockHash: string
  ): Promise<ChainGetBlockTransfersResult>;
  getBlockTransfersByHeight(
    height: number
  ): Promise<ChainGetBlockTransfersResult>;

  getEraSummaryLatest(): Promise<ChainGetEraSummaryResult>;
  getEraSummaryByHash(blockHash: string): Promise<ChainGetEraSummaryResult>;
  getEraSummaryByHeight(height: number): Promise<ChainGetEraSummaryResult>;

  getStateRootHashLatest(): Promise<ChainGetStateRootHashResult>;
  getStateRootHashByHash(
    blockHash: string
  ): Promise<ChainGetStateRootHashResult>;
  getStateRootHashByHeight(
    height: number
  ): Promise<ChainGetStateRootHashResult>;

  getStatus(): Promise<InfoGetStatusResult>;
  getPeers(): Promise<InfoGetPeerResult>;

  queryLatestBalance(identifier: PurseIdentifier): Promise<QueryBalanceResult>;
  queryBalanceByBlockHeight(
    purseIdentifier: PurseIdentifier,
    height: number
  ): Promise<QueryBalanceResult>;
  queryBalanceByBlockHash(
    purseIdentifier: PurseIdentifier,
    blockHash: string
  ): Promise<QueryBalanceResult>;
  queryBalanceByStateRootHash(
    purseIdentifier: PurseIdentifier,
    stateRootHash: string
  ): Promise<QueryBalanceResult>;

  queryLatestBalanceDetails(
    purseIdentifier: PurseIdentifier
  ): Promise<QueryBalanceDetailsResult>;
  queryBalanceDetailsByBlockHeight(
    purseIdentifier: PurseIdentifier,
    height: number
  ): Promise<QueryBalanceDetailsResult>;
  queryBalanceDetailsByBlockHash(
    purseIdentifier: PurseIdentifier,
    blockHash: string
  ): Promise<QueryBalanceDetailsResult>;
  queryBalanceDetailsByStateRootHash(
    purseIdentifier: PurseIdentifier,
    stateRootHash: string
  ): Promise<QueryBalanceDetailsResult>;

  getChainspec(): Promise<InfoGetChainspecResult>;

  getLatestValidatorReward(validator: PublicKey): Promise<InfoGetRewardResult>;
  getValidatorRewardByEraID(
    validator: PublicKey,
    eraID: number
  ): Promise<InfoGetRewardResult>;
  getValidatorRewardByBlockHash(
    validator: PublicKey,
    blockHash: string
  ): Promise<InfoGetRewardResult>;
  getValidatorRewardByBlockHeight(
    validator: PublicKey,
    height: number
  ): Promise<InfoGetRewardResult>;

  getLatestDelegatorReward(
    validator: PublicKey,
    delegator: PublicKey
  ): Promise<InfoGetRewardResult>;
  getDelegatorRewardByEraID(
    validator: PublicKey,
    delegator: PublicKey,
    eraID: number
  ): Promise<InfoGetRewardResult>;
  getDelegatorRewardByBlockHash(
    validator: PublicKey,
    delegator: PublicKey,
    blockHash: string
  ): Promise<InfoGetRewardResult>;
  getDelegatorRewardByBlockHeight(
    validator: PublicKey,
    delegator: PublicKey,
    height: number
  ): Promise<InfoGetRewardResult>;
}

export interface ClientTransactional {
  putDeploy(deploy: Deploy): Promise<PutDeployResult>;
  putTransaction(transaction: Transaction): Promise<PutTransactionResult>;
}

export interface IClient
  extends ClientPOS,
    ClientInformational,
    ClientTransactional {}

export interface IHandler {
  processCall(params: RpcRequest): Promise<RpcResponse>;
}
