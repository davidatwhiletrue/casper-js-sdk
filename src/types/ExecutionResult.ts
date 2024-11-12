import {
  jsonObject,
  jsonMember,
  TypedJSON,
  jsonArrayMember,
  AnyT
} from 'typedjson';
import { Hash, TransferHash, Key } from './key';
import { InitiatorAddr } from './InitiatorAddr';
import { Transfer } from './Transfer';
import { Transform, TransformKey } from './Transform';
import { TransactionHash } from './Transaction';

@jsonObject
export class Operation {
  @jsonMember({ name: 'key', constructor: Key })
  public key: Key;

  @jsonMember({ name: 'kind', constructor: String })
  public kind: string;
}

@jsonObject
export class Effects extends Array<Transform> {}

@jsonObject
export class Effect {
  @jsonArrayMember(Operation, { name: 'operations' })
  public operations: Operation[] = [];

  @jsonArrayMember(TransformKey, { name: 'transforms' })
  public transforms: TransformKey[] = [];
}

@jsonObject
export class ExecutionResultStatusData {
  @jsonMember({ name: 'effect', constructor: Effect })
  public effect: Effect;

  @jsonArrayMember(TransferHash, { name: 'transfers' })
  public transfers: TransferHash[] = [];

  @jsonMember({ name: 'cost', constructor: Number })
  public cost: number;

  @jsonMember({ name: 'error_message', constructor: String })
  public errorMessage: string;
}

@jsonObject
export class ExecutionResultV2 {
  @jsonMember({ name: 'initiator', constructor: InitiatorAddr })
  public initiator: InitiatorAddr;

  @jsonMember({ name: 'error_message', constructor: String })
  public errorMessage?: string;

  @jsonMember({ name: 'limit', constructor: Number })
  public limit: number;

  @jsonMember({ name: 'consumed', constructor: Number })
  public consumed: number;

  @jsonMember({ name: 'cost', constructor: Number })
  public cost: number;

  @jsonMember({ name: 'payment', constructor: AnyT })
  public payment?: any;

  @jsonArrayMember(Transfer, { name: 'transfers' })
  public transfers: Transfer[] = [];

  @jsonMember({ name: 'size_estimate', constructor: Number })
  public sizeEstimate: number;

  @jsonArrayMember(Transform, { name: 'effects' })
  public effects: Transform[] = [];
}

@jsonObject
export class ExecutionResultV1 {
  @jsonMember({ name: 'Success', constructor: ExecutionResultStatusData })
  public success?: ExecutionResultStatusData;

  @jsonMember({ name: 'Failure', constructor: ExecutionResultStatusData })
  public failure?: ExecutionResultStatusData;
}

@jsonObject
export class DeployExecutionResult {
  @jsonMember({ name: 'block_hash', constructor: Hash })
  public blockHash: Hash;

  @jsonMember({ name: 'result', constructor: ExecutionResultV1 })
  public result: ExecutionResultV1;
}

@jsonObject
export class ExecutionResult {
  @jsonMember({ constructor: InitiatorAddr })
  public initiator: InitiatorAddr;

  @jsonMember({ name: 'error_message', constructor: String })
  public errorMessage?: string;

  @jsonMember({ constructor: Number })
  public limit: number;

  @jsonMember({ constructor: Number })
  public consumed: number;

  @jsonMember({ constructor: Number })
  public cost: number;

  @jsonMember({ constructor: AnyT })
  public payment?: any;

  @jsonArrayMember(Transfer)
  public transfers: Transfer[] = [];

  @jsonMember({ constructor: Number })
  public sizeEstimate: number;

  @jsonArrayMember(Transform)
  public effects: Transform[] = [];

  public originExecutionResultV1?: ExecutionResultV1;
  public originExecutionResultV2?: ExecutionResultV2;

  public static fromJSON(data: any): ExecutionResult {
    const rawObject = JSON.parse(data);

    if (rawObject?.Version2) {
      const executionResultV2 = TypedJSON.parse(
        rawObject.Version2,
        ExecutionResultV2
      );
      if (executionResultV2) {
        const executionResult = new ExecutionResult();
        executionResult.initiator = executionResultV2.initiator;
        executionResult.errorMessage = executionResultV2.errorMessage;
        executionResult.limit = executionResultV2.limit;
        executionResult.consumed = executionResultV2.consumed;
        executionResult.cost = executionResultV2.cost;
        executionResult.payment = executionResultV2.payment;
        executionResult.transfers = executionResultV2.transfers;
        executionResult.sizeEstimate = executionResultV2.sizeEstimate;
        executionResult.effects = executionResultV2.effects;
        executionResult.originExecutionResultV2 = executionResultV2;
        return executionResult;
      }
    } else if (rawObject?.Version1) {
      const executionResultV1 = TypedJSON.parse(
        rawObject.Version1,
        ExecutionResultV1
      );
      if (executionResultV1) {
        return ExecutionResult.fromV1(executionResultV1);
      }
    }

    throw new Error('Incorrect RPC response structure');
  }

  public static fromV1(v1: ExecutionResultV1): ExecutionResult {
    const result = new ExecutionResult();
    const transforms: Transform[] = [];
    const transfers: Transfer[] = [];

    if (v1.success) {
      for (const transform of v1.success.effect.transforms) {
        transforms.push(new Transform(transform.key, transform.transform));

        if (!transform.transform.isWriteTransfer()) {
          continue;
        }

        const writeTransfer = transform.transform.parseAsWriteTransfer();

        if (!writeTransfer) {
          continue;
        }

        const transfer = new Transfer();
        transfer.amount = writeTransfer.amount;
        transfer.transactionHash = new TransactionHash(
          undefined,
          transform.key.transfer
        );
        transfer.from = new InitiatorAddr(undefined, writeTransfer.from);
        transfer.gas = writeTransfer.gas;
        transfer.id = writeTransfer.id;
        transfer.source = writeTransfer.source;
        transfer.target = writeTransfer.target;
        transfer.to = writeTransfer.to;

        transfers.push(transfer);
      }

      result.limit = 0;
      result.consumed = v1.success.cost;
      result.cost = 0;
      result.payment = null;
      result.transfers = transfers;
      result.effects = transforms;
      result.originExecutionResultV1 = v1;

      return result;
    }

    if (v1.failure) {
      for (const transform of v1.failure.effect.transforms) {
        // TODO: we should convert old Transform to new format
        transforms.push(new Transform(transform.key, transform.transform));
      }

      result.errorMessage = v1.failure.errorMessage;
      result.consumed = v1.failure.cost;
      result.effects = transforms;
      result.originExecutionResultV1 = v1;

      return result;
    }

    throw new Error('Invalid ExecutionResultV1 structure');
  }
}

@jsonObject
export class ExecutionInfo {
  @jsonMember({ name: 'block_hash', constructor: Hash })
  public blockHash: Hash;

  @jsonMember({ name: 'block_height', constructor: Number })
  public blockHeight: number;

  @jsonMember({ name: 'execution_result', constructor: ExecutionResult })
  public executionResult: ExecutionResult;

  constructor(
    blockHash: Hash,
    blockHeight: number,
    executionResult: ExecutionResult
  ) {
    this.blockHash = blockHash;
    this.blockHeight = blockHeight;
    this.executionResult = executionResult;
  }

  public static fromV1(
    results: DeployExecutionResult[],
    height?: number
  ): ExecutionInfo {
    if (results.length === 0) {
      throw new Error('Missing ExecutionInfo.fromV1 results');
    }

    const result = results[0];
    const blockHeight = height ?? 0;

    return new ExecutionInfo(
      result.blockHash,
      blockHeight,
      ExecutionResult.fromV1(result.result)
    );
  }
}

@jsonObject
export class DeployExecutionInfo {
  @jsonMember({ name: 'block_hash', constructor: Hash })
  public blockHash: Hash;

  @jsonMember({ name: 'block_height', constructor: Number })
  public blockHeight: number;

  @jsonMember({ name: 'execution_result', constructor: ExecutionResult })
  public executionResult: ExecutionResult;

  public static fromV1(
    results: DeployExecutionResult[],
    height?: number
  ): DeployExecutionInfo {
    if (results.length === 0) {
      return new DeployExecutionInfo();
    }

    const result = results[0];
    const blockHeight = height ?? 0;

    const deployExecutionInfo = new DeployExecutionInfo();
    deployExecutionInfo.blockHash = result.blockHash;
    deployExecutionInfo.blockHeight = blockHeight;
    deployExecutionInfo.executionResult = ExecutionResult.fromV1(result.result);

    return deployExecutionInfo;
  }
}
