import { TypedJSON } from 'typedjson';

import {
  BlockIdentifier,
  Method,
  RpcRequest,
  SpeculativeExecParams
} from './request';
import { RpcResponse, SpeculativeExecResult } from './response';
import { IHandler } from './client';
import { IDValue } from './id_value';
import { ExecutionResult, Deploy, Hash } from '../types';

export class SpeculativeClient {
  private handler: IHandler;

  constructor(handler: IHandler) {
    this.handler = handler;
  }

  static newSpeculativeClient(handler: IHandler): SpeculativeClient {
    return new SpeculativeClient(handler);
  }

  async speculativeExec(
    reqID: string,
    deploy: Deploy,
    identifier?: BlockIdentifier
  ): Promise<SpeculativeExecResult> {
    const serializer = new TypedJSON(SpeculativeExecParams);
    const speculativeParams = new SpeculativeExecParams(deploy, identifier);

    const request = RpcRequest.defaultRpcRequest(
      Method.SpeculativeExec,
      serializer.toPlainJson(speculativeParams)
    );

    if (reqID && reqID !== '0') {
      request.id = new IDValue(reqID);
    }

    const resp = await this.handler.processCall(request);

    if (!resp) {
      throw new Error('Handler response is empty');
    }

    if (resp.error) {
      throw new Error(`RPC call failed, details: ${resp.error}`);
    }

    try {
      const serializer = new TypedJSON(RpcResponse);
      const data = serializer.parse(resp);

      if (!data) {
        throw new Error(`Error parsing JSON`);
      }

      const result = new SpeculativeExecResult();
      result.apiVersion = data.version;
      result.executionResult = ExecutionResult.fromJSON(resp.result);
      result.blockHash = Hash.fromHex(identifier?.hash ?? '');
      return result;
    } catch (error) {
      throw new Error(`Error parsing JSON, details: ${error}`);
    }
  }
}
