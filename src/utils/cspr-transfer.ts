import {
  DEFAULT_DEPLOY_TTL,
  Deploy,
  DeployHeader,
  Duration,
  ExecutableDeployItem,
  NativeTransferBuilder,
  PublicKey,
  Timestamp,
  Transaction,
  TransferDeployItem
} from '../types';
import { CasperNetworkName } from '../@types';

export interface IMakeCsprTransferDeployParams {
  senderPublicKeyHex: string;
  recipientPublicKeyHex: string;
  transferAmount: string;
  chainName?: string;
  memo?: string;
  ttl?: number;
  timestamp?: string;
  gasPrice?: number;
  paymentAmount?: string;
}

/**
 * Creates a CSPR transfer `Deploy`.
 *
 * This function generates a `Deploy` for transferring CSPR from one account to another.
 *
 * @param params - The parameters required to create the transfer deploy.
 * @param params.senderPublicKeyHex - The sender's public key in hexadecimal format.
 * @param params.recipientPublicKeyHex - The recipient's public key in hexadecimal format.
 * @param params.transferAmount - The amount of CSPR to transfer.
 *                                This value must be represented in its smallest unit (motes).
 *                                For example, to transfer 2.5 CSPR, provide the value `2500000000` (2.5 * 10^9 motes).
 * @param params.chainName - (Optional) The name of the Casper network chain.
 *                           Defaults to `'CasperNetworkName.Mainnet'` if not specified.
 * @param params.memo - (Optional) Tag/Memo (Comment/Note/Remark)
 *                      Most exchanges require a Tag/Memo for CSPR deposits to be credited correctly.
 *                      Make sure to provide the Tag/Memo if required.
 * @param params.ttl - (Optional) The time-to-live (TTL) for the `Deploy` in milliseconds.
 *                      Specifies how long the `Deploy` is valid before it expires.
 *                      Defaults 1800000 (30 minutes)
 * @param params.timestamp - (Optional) The timestamp in ISO 8601 format
 *
 * @returns A promise that resolves to the created Deploy instance, ready to be sent to the Casper network.
 *
 * @example
 * ```ts
 * import { makeCsprTransferDeploy } from 'casper-js-sdk';
 *
 * const deploy = await makeCsprTransferDeploy({
 *   senderPublicKeyHex: '0123456789asdfbcdef...',
 *   recipientPublicKeyHex: '0123456789abcdef...',
 *   transferAmount: '2500000000', // 2.5 CSPR
 * });
 *
 * console.log('Created Deploy:', deploy);
 * ```
 */
export const makeCsprTransferDeploy = ({
  senderPublicKeyHex,
  recipientPublicKeyHex,
  transferAmount,
  chainName = CasperNetworkName.Mainnet,
  memo,
  ttl = DEFAULT_DEPLOY_TTL,
  timestamp,
  gasPrice = 1,
  paymentAmount = '100000000'
}: IMakeCsprTransferDeployParams) => {
  const recipientKey = PublicKey.newPublicKey(recipientPublicKeyHex);
  const senderKey = PublicKey.newPublicKey(senderPublicKeyHex);

  const session = new ExecutableDeployItem();
  session.transfer = TransferDeployItem.newTransfer(
    transferAmount,
    recipientKey,
    undefined,
    memo
  );

  const payment = ExecutableDeployItem.standardPayment(paymentAmount);

  const deployHeader = DeployHeader.default();
  deployHeader.account = senderKey;
  deployHeader.chainName = chainName;
  deployHeader.ttl = new Duration(ttl);
  deployHeader.gasPrice = gasPrice;

  if (timestamp) {
    deployHeader.timestamp = Timestamp.fromJSON(timestamp);
  }

  return Deploy.makeDeploy(deployHeader, payment, session);
};

interface IMakeCsprTransferTransactionParams
  extends IMakeCsprTransferDeployParams {
  casperNetworkApiVersion: string;
}

export const makeCsprTransferTransaction = ({
  senderPublicKeyHex,
  recipientPublicKeyHex,
  transferAmount,
  chainName = CasperNetworkName.Mainnet,
  memo,
  ttl = DEFAULT_DEPLOY_TTL,
  timestamp,
  casperNetworkApiVersion,
  gasPrice = 1,
  paymentAmount = '100000000'
}: IMakeCsprTransferTransactionParams): Transaction => {
  if (casperNetworkApiVersion.startsWith('2')) {
    let txBuilder = new NativeTransferBuilder()
      .from(PublicKey.fromHex(senderPublicKeyHex))
      .target(PublicKey.fromHex(recipientPublicKeyHex))
      .amount(transferAmount)
      .chainName(chainName)
      .payment(Number(paymentAmount), gasPrice)
      .ttl(ttl);

    if (timestamp) {
      txBuilder = txBuilder.timestamp(Timestamp.fromJSON(timestamp));
    }

    if (memo) {
      txBuilder = txBuilder.id(Number(memo));
    }

    return txBuilder.build();
  } else {
    return Transaction.fromDeploy(
      makeCsprTransferDeploy({
        senderPublicKeyHex,
        recipientPublicKeyHex,
        transferAmount,
        chainName,
        memo,
        ttl,
        timestamp
      })
    );
  }
};
