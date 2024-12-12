import { TypedJSON } from 'typedjson';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { HttpError } from './error';
import { RpcRequest } from './request';
import { RpcResponse } from './response';
import { IHandler } from './client';

export const ErrParamsJsonStringifyHandler = new Error(
  "failed to stringify json rpc request's params"
);
export const ErrProcessHttpRequest = new Error('failed to send http request');
export const ErrReadHttpResponseBody = new Error(
  'failed to read http response body'
);
export const ErrRpcResponseUnmarshal = new Error(
  'failed to unmarshal rpc response'
);

export class HttpHandler implements IHandler {
  private httpClient: AxiosInstance;
  private endpoint: string;
  private customHeaders: Record<string, string>;

  constructor(endpoint: string, client?: AxiosInstance) {
    this.httpClient = client ?? axios.create();
    this.endpoint = endpoint;
    this.customHeaders = {};
  }

  setCustomHeaders(headers: Record<string, string>) {
    this.customHeaders = headers;
  }

  /** @throws {HttpError, Error} */
  async processCall(params: RpcRequest): Promise<RpcResponse> {
    const serializer = new TypedJSON(RpcRequest);
    let body: string;

    try {
      body = serializer.stringify(params);
    } catch (err) {
      throw new Error(
        `${ErrParamsJsonStringifyHandler.message}, details: ${err.message}`
      );
    }

    const config: AxiosRequestConfig = {
      method: 'POST',
      url: this.endpoint,
      headers: {
        'Content-Type': 'application/json',
        ...this.customHeaders
      },
      data: body
    };

    try {
      const response = await this.httpClient.request<RpcResponse>(config);

      if (response.status < 200 || response.status >= 300) {
        throw new HttpError(response.status, new Error(response.statusText));
      }

      try {
        return response.data;
      } catch (err) {
        throw new Error(
          `${ErrRpcResponseUnmarshal.message}, details: ${err.message}`
        );
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          throw new HttpError(
            err.response.status,
            new Error(err.response.statusText)
          );
        } else {
          throw new Error(
            `${ErrProcessHttpRequest.message}, details: ${err.message}`
          );
        }
      } else {
        throw new Error(
          `${ErrReadHttpResponseBody.message}, details: ${err.message}`
        );
      }
    }
  }
}
