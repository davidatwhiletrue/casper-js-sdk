import {
  InfoGetDeployResult,
  InfoGetTransactionResult,
  PutDeployResult,
  PutTransactionResult,
  RpcClient
} from '../rpc';
import {
  Args,
  CLValue,
  CLValueUInt512,
  ContractCallBuilder,
  NativeDelegateBuilder,
  NativeRedelegateBuilder,
  NativeTransferBuilder,
  NativeUndelegateBuilder,
  PublicKey,
  Transaction,
  TransactionHash
} from '../types';
import { BigNumber } from '@ethersproject/bignumber';

export class CasperNetwork {
  private rpcClient: RpcClient;
  private apiVersion: number;

  constructor(rpcClient: RpcClient, apiVersion: number) {
    this.rpcClient = rpcClient;
    this.apiVersion = apiVersion;
  }

  public static async create(
    rpcClient: RpcClient,
    apiVersion?: number
  ): Promise<CasperNetwork> {
    if (!apiVersion) {
      const status = await rpcClient.getStatus();

      apiVersion = status.apiVersion.startsWith('2.') ? 2 : 1;
    }

    return new CasperNetwork(rpcClient, apiVersion);
  }

  public createDelegateTransaction(
    delegatorPublicKey: PublicKey,
    validatorPublicKey: PublicKey,
    networkName: string,
    amountMotes: string | BigNumber,
    deployCost: number,
    ttl: number,
    auctionContractHash?: string
  ): Transaction {
    if (this.apiVersion === 2) {
      new NativeDelegateBuilder()
        .validator(validatorPublicKey)
        .from(delegatorPublicKey)
        .amount(amountMotes)
        .chainName(networkName)
        .payment(deployCost)
        .ttl(ttl)
        .build();
    }

    if (auctionContractHash) {
      return new ContractCallBuilder()
        .from(delegatorPublicKey)
        .byHash(auctionContractHash)
        .entryPoint('delegate')
        .chainName(networkName)
        .runtimeArgs(
          Args.fromMap({
            validator: CLValue.newCLPublicKey(validatorPublicKey),
            delegator: CLValue.newCLPublicKey(delegatorPublicKey),
            amount: CLValueUInt512.newCLUInt512(amountMotes)
          })
        )
        .ttl(ttl)
        .buildFor1_5();
    }

    throw new Error(
      'Auction contract hash is required when creating a transaction on Casper Network 1.5.x'
    );
  }

  public createUndelegateTransaction(
    delegatorPublicKey: PublicKey,
    validatorPublicKey: PublicKey,
    networkName: string,
    amountMotes: string | BigNumber,
    deployCost: number,
    ttl: number,
    auctionContractHash?: string
  ): Transaction {
    if (this.apiVersion === 2) {
      new NativeUndelegateBuilder()
        .validator(validatorPublicKey)
        .from(delegatorPublicKey)
        .amount(amountMotes)
        .chainName(networkName)
        .payment(deployCost)
        .ttl(ttl)
        .build();
    }

    if (auctionContractHash) {
      return new ContractCallBuilder()
        .from(delegatorPublicKey)
        .byHash(auctionContractHash)
        .entryPoint('undelegate')
        .chainName(networkName)
        .ttl(ttl)
        .runtimeArgs(
          Args.fromMap({
            validator: CLValue.newCLPublicKey(validatorPublicKey),
            delegator: CLValue.newCLPublicKey(delegatorPublicKey),
            amount: CLValueUInt512.newCLUInt512(amountMotes)
          })
        )
        .buildFor1_5();
    }

    throw new Error(
      'Auction contract hash is required when creating a transaction on Casper Network 1.5.x'
    );
  }

  public createRedelegateTransaction(
    delegatorPublicKey: PublicKey,
    validatorPublicKey: PublicKey,
    newValidatorPublicKey: PublicKey,
    networkName: string,
    amountMotes: string | BigNumber,
    deployCost: number,
    ttl: number,
    auctionContractHash?: string
  ): Transaction {
    if (this.apiVersion === 2) {
      new NativeRedelegateBuilder()
        .validator(validatorPublicKey)
        .newValidator(newValidatorPublicKey)
        .from(delegatorPublicKey)
        .amount(amountMotes)
        .chainName(networkName)
        .payment(deployCost)
        .ttl(ttl)
        .build();
    }

    if (auctionContractHash) {
      return new ContractCallBuilder()
        .from(delegatorPublicKey)
        .byHash(auctionContractHash)
        .entryPoint('redelegate')
        .chainName(networkName)
        .runtimeArgs(
          Args.fromMap({
            validator: CLValue.newCLPublicKey(validatorPublicKey),
            delegator: CLValue.newCLPublicKey(delegatorPublicKey),
            amount: CLValueUInt512.newCLUInt512(amountMotes),
            ...(newValidatorPublicKey
              ? {
                  new_validator: CLValue.newCLPublicKey(newValidatorPublicKey)
                }
              : {})
          })
        )
        .ttl(ttl)
        .buildFor1_5();
    }

    throw new Error(
      'Auction contract hash is required when creating a transaction on Casper Network 1.5.x'
    );
  }

  public createTransferTransaction(
    senderPublicKey: PublicKey,
    recepientPublicKey: PublicKey,
    networkName: string,
    amountMotes: string,
    deployCost: number,
    ttl: number
  ): Transaction {
    const transferBuilder = new NativeTransferBuilder()
      .from(senderPublicKey)
      .target(recepientPublicKey)
      .amount(amountMotes)
      .chainName(networkName)
      .payment(deployCost)
      .ttl(ttl);
    if (this.apiVersion === 2) {
      return transferBuilder.build();
    }

    return transferBuilder.buildFor1_5();
  }

  public async putTransaction(
    transaction: Transaction
  ): Promise<PutTransactionResult | PutDeployResult> {
    if (this.apiVersion == 2) {
      return await this.rpcClient.putTransaction(transaction);
    }

    const deploy = transaction.getDeploy();
    if (deploy) {
      return await this.rpcClient.putDeploy(deploy);
    }

    return Promise.reject(
      'Legacy deploy transaction is required when submitting to Casper Network 1.5'
    );
  }

  public async getTransaction(
    hash: TransactionHash
  ): Promise<InfoGetTransactionResult | InfoGetDeployResult> {
    if (this.apiVersion == 2) {
      if (hash.transactionV1) {
        return await this.rpcClient.getTransactionByTransactionHash(
          hash.transactionV1?.toHex()
        );
      }

      if (hash.deploy) {
        return await this.rpcClient.getTransactionByDeployHash(
          hash.deploy.toHex()
        );
      }
    }

    if (hash.deploy) {
      return await this.rpcClient.getDeploy(hash.deploy.toHex());
    }

    return Promise.reject('Hash is not valid');
  }
}
