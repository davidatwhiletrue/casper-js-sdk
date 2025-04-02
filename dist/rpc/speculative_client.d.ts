import { BlockIdentifier } from './request';
import { SpeculativeExecResult } from './response';
import { IHandler } from './client';
import { Deploy } from '../types';
export declare class SpeculativeClient {
    private handler;
    constructor(handler: IHandler);
    static newSpeculativeClient(handler: IHandler): SpeculativeClient;
    speculativeExec(reqID: string, deploy: Deploy, identifier?: BlockIdentifier): Promise<SpeculativeExecResult>;
}
