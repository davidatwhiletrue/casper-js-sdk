import { RpcClient } from '../rpc';
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
    contractHash?: string
  ) {
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

    if (contractHash) {
      return new ContractCallBuilder()
        .from(delegatorPublicKey)
        .byHash(contractHash)
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

    return new Error('Need to provide contract hash');
  }

  public createUndelegateTransaction(
    delegatorPublicKey: PublicKey,
    validatorPublicKey: PublicKey,
    networkName: string,
    amountMotes: string | BigNumber,
    deployCost: number,
    ttl: number,
    contractHash?: string
  ) {
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

    if (contractHash) {
      return new ContractCallBuilder()
        .from(delegatorPublicKey)
        .byHash(contractHash)
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

    return new Error('Need to provide contract hash');
  }

  public createRedelegateTransaction(
    delegatorPublicKey: PublicKey,
    validatorPublicKey: PublicKey,
    networkName: string,
    amountMotes: string | BigNumber,
    deployCost: number,
    ttl: number,
    contractHash?: string
  ) {
    if (this.apiVersion === 2) {
      new NativeRedelegateBuilder()
        .validator(validatorPublicKey)
        .from(delegatorPublicKey)
        .amount(amountMotes)
        .chainName(networkName)
        .payment(deployCost)
        .ttl(ttl)
        .build();
    }

    if (contractHash) {
      // need to provide contract hash
      return (
        new ContractCallBuilder()
          .from(delegatorPublicKey)
          .byHash(contractHash)
          .entryPoint('redelegate')
          .chainName(networkName)
          // .amount(amountMotes)
          .ttl(ttl)
          .buildFor1_5()
      );
    }

    return new Error('Need to provide contract hash');
  }

  public createTransferTransaction(
    senderPublicKey: PublicKey,
    recepientPublicKey: PublicKey,
    networkName: string,
    amountMotes: string,
    deployCost: number,
    ttl: number
  ) {
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

  public async putTransaction(transaction: Transaction) {
    if (this.apiVersion == 2) {
      return await this.rpcClient.putTransaction(transaction);
    }

    const deploy = transaction.getDeploy();
    if (deploy) {
      return await this.rpcClient.putDeploy(deploy);
    }

    return Promise.reject('Transaction does not have a deploy');
  }

  public async getTransaction(hash: TransactionHash) {
    if (this.apiVersion == 2) {
      if (hash.transactionV1) {
        return await this.rpcClient.getTransactionByTransactionHash(
          hash.transactionV1?.toHex()
        );
      }
    }

    if (hash.deploy) {
      return await this.rpcClient.getTransactionByDeployHash(
        hash.deploy.toHex()
      );
    }

    return Promise.reject('Hash is not valid');
  }
}
