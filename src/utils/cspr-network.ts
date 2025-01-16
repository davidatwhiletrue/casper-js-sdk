import {RpcClient} from "../rpc";
import {NativeDelegateBuilder, PublicKey} from "../types";

export class CasperNetwork {
    private apiVersion: number;
    private rpcClient: RpcClient;

    constructor(apiVersion: number, rpcClient: RpcClient) {
        this.apiVersion = apiVersion;
        this.rpcClient = rpcClient;
    }

    public DelegateTransaction(delegatorPublicKeyHex: PublicKey,
                               validatorPublicKeyHex: PublicKey,
                               networkName: string,
                               amountMotes: string,
                               deployCost: number,
                               ttl: number) {
        const delegationBuilder = new NativeDelegateBuilder()
            .validator(validatorPublicKeyHex)
            .from(delegatorPublicKeyHex)
            .amount(amountMotes)
            .chainName(networkName)
            .payment(deployCost)
            .ttl(ttl)

        if(this.apiVersion === 2) {
            return delegationBuilder.build();
        }

        return delegationBuilder.buildV1();
    }

    // create native transfer transaction
    // create delegate transaction
    // create undelegate transaction
    // create redelegate transaction
    // create transfer transaction

    // get transaction
    // put transaction
}