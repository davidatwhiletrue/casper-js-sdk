import { Deploy, DeployHeader, ExecutableDeployItem, PublicKey, TransferDeployItem } from "../types";
import { CasperNetworkName } from "../@types";

export interface IMakeCsprTransferDeployParams {
  senderPublicKeyHex: string;
  recipientPublicKeyHex: string;
  transferAmount: string;
  chainName?: CasperNetworkName;
  memo?: string;
}

/**
 * Creates a CSPR transfer deploy.
 *
 * This function generates a deploy for transferring CSPR from one account to another.
 * It utilizes the provided private key, recipient's public key, and transfer amount to build the deploy.
 *
 * @param params - The parameters required to create the transfer deploy.
 * @param params.senderPublicKeyHex - The sender's public key in hexadecimal format.
 * @param params.recipientPublicKeyHex - The recipient's public key in hexadecimal format.
 * @param params.transferAmount - The amount of CSPR to transfer.
 *                                This value must be represented in its smallest unit (motes).
 *                                For example, to transfer 2.5 CSPR, provide the value `2500000000` (2.5 * 10^9 motes).
 * @param params.chainName - (Optional) The name of the Casper network chain - {CasperNetworkName}.
 *                           Must be either `'casper'` (mainnet) or `'casper-test'` (testnet).
 *                           Defaults to `'CasperNetworkName.Mainnet'` if not specified.
 * @param params.memo - (Optional) Tag/Memo (Comment/Note/Remark)
 *                      Most exchanges require a Tag/Memo for CSPR deposits to be credited correctly.
 *                      Make sure to provide the Tag/Memo if required.
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
}: IMakeCsprTransferDeployParams) => {
  const recipientKey = PublicKey.newPublicKey(recipientPublicKeyHex);
  const senderKey = PublicKey.newPublicKey(senderPublicKeyHex);

  const session = new ExecutableDeployItem();
  session.transfer = TransferDeployItem.newTransfer(
    transferAmount,
    recipientKey,
    undefined,
    memo,
  );

  const payment = ExecutableDeployItem.standardPayment('100000000');

  const deployHeader = DeployHeader.default();
  deployHeader.account = senderKey;
  deployHeader.chainName = chainName;

  return Deploy.makeDeploy(deployHeader, payment, session);
}
