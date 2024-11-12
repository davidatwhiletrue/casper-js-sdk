import { jsonObject, jsonMember, jsonArrayMember, TypedJSON } from 'typedjson';
import { blake2b } from '@noble/hashes/blake2b';
import { concat } from '@ethersproject/bytes';
import { BigNumber } from '@ethersproject/bignumber';

import { Hash } from './key';
import { PrivateKey } from './keypair/PrivateKey';
import { HexBytes } from './HexBytes';
import { PublicKey } from './keypair';
import { Duration, Timestamp } from './Time';
import {
  Approval,
  Transaction,
  TransactionBody,
  TransactionCategory,
  TransactionHeader
} from './Transaction';
import { TransactionEntryPoint } from './TransactionEntryPoint';
import { InitiatorAddr } from './InitiatorAddr';
import { ClassicMode, PricingMode } from './PricingMode';
import { TransactionTarget } from './TransactionTarget';
import { TransactionScheduling } from './TransactionScheduling';
import { ExecutableDeployItem } from './ExecutableDeployItem';
import { byteHash } from './ByteConverters';
import { Conversions } from './Conversions';

@jsonObject
export class DeployHeader {
  @jsonMember({ constructor: PublicKey })
  public account?: PublicKey;

  @jsonMember({ constructor: Hash })
  public bodyHash?: Hash;

  @jsonMember({ name: 'chain_name', constructor: String })
  public chainName = '';

  @jsonArrayMember(Hash, { name: 'dependencies' })
  public dependencies: Hash[] = [];

  @jsonMember({ name: 'gas_price', constructor: Number })
  public gasPrice = 1;

  @jsonMember({ constructor: Timestamp })
  public timestamp: Timestamp = new Timestamp(new Date());

  @jsonMember({ constructor: Duration })
  public ttl: Duration = new Duration(30 * 60 * 1000);

  constructor(
    chainName = '',
    dependencies: Hash[] = [],
    gasPrice = 1,
    timestamp: Timestamp = new Timestamp(new Date()),
    ttl: Duration = new Duration(30 * 60 * 1000),
    account?: PublicKey,
    bodyHash?: Hash
  ) {
    this.chainName = chainName;
    this.dependencies = dependencies;
    this.gasPrice = gasPrice;
    this.timestamp = timestamp;
    this.ttl = ttl;
    this.account = account;
    this.bodyHash = bodyHash;
  }

  public toBytes(): Uint8Array {
    const accountBytes = this.account?.bytes() ?? new Uint8Array();
    const timestampBytes = new Uint8Array(
      new BigUint64Array([BigInt(this.timestamp.toMilliseconds())]).buffer
    );
    const ttlBytes = new Uint8Array(
      new BigUint64Array([BigInt(this.ttl.toMilliseconds())]).buffer
    );
    const gasPriceBytes = new Uint8Array(
      new BigUint64Array([BigInt(this.gasPrice)]).buffer
    );
    const bodyHashBytes = this.bodyHash?.toBytes() ?? new Uint8Array();
    const chainNameBytes = new TextEncoder().encode(this.chainName);

    const totalLength =
      accountBytes.length +
      timestampBytes.length +
      ttlBytes.length +
      gasPriceBytes.length +
      bodyHashBytes.length +
      chainNameBytes.length;
    const result = new Uint8Array(totalLength);

    result.set(accountBytes, 0);
    result.set(timestampBytes, accountBytes.length);
    result.set(ttlBytes, accountBytes.length + timestampBytes.length);
    result.set(
      gasPriceBytes,
      accountBytes.length + timestampBytes.length + ttlBytes.length
    );
    result.set(
      bodyHashBytes,
      accountBytes.length +
        timestampBytes.length +
        ttlBytes.length +
        gasPriceBytes.length
    );
    result.set(
      chainNameBytes,
      accountBytes.length +
        timestampBytes.length +
        ttlBytes.length +
        gasPriceBytes.length +
        bodyHashBytes.length
    );

    return result;
  }

  public static default(): DeployHeader {
    return new DeployHeader();
  }
}

@jsonObject
export class Deploy {
  @jsonArrayMember(() => Approval)
  public approvals: Approval[] = [];

  @jsonMember({ constructor: Hash })
  public hash: Hash;

  @jsonMember({ constructor: DeployHeader })
  public header: DeployHeader;

  @jsonMember({ constructor: ExecutableDeployItem })
  public payment: ExecutableDeployItem;

  @jsonMember({ constructor: ExecutableDeployItem })
  public session: ExecutableDeployItem;

  public validate(): boolean {
    const paymentBytes = this.payment.bytes();
    const sessionBytes = this.session.bytes();
    const calculatedBodyHash = new Hash(
      blake2b(new Uint8Array([...paymentBytes, ...sessionBytes]))
    );
    const headerBytes = this.header.toBytes();
    const calculatedHash = new Hash(blake2b(headerBytes));

    if (
      !this.header.bodyHash?.equals(calculatedBodyHash) ||
      !this.hash.equals(calculatedHash)
    ) {
      throw new Error('Invalid deploy hash or body hash');
    }

    for (const approval of this.approvals) {
      if (
        !approval.signer.verifySignature(
          this.hash.toBytes(),
          approval.signature.bytes
        )
      ) {
        throw new Error('Invalid approval signature');
      }
    }
    return true;
  }

  public async sign(keys: PrivateKey): Promise<void> {
    const signatureBytes = await keys.sign(this.hash.toBytes());
    const signature = new HexBytes(signatureBytes);
    this.approvals.push(new Approval(keys.publicKey, signature));
  }

  /**
   * Sets already generated signature
   *
   * @param signature the Ed25519 or Secp256K1 signature
   * @param publicKey the public key used to generate the signature
   */
  public static setSignature(
    deploy: Deploy,
    signature: Uint8Array,
    publicKey: PublicKey
  ): Deploy {
    const hex = new HexBytes(signature);
    deploy.approvals.push(new Approval(publicKey, hex));
    return deploy;
  }

  public static createNew(
    hash: Hash,
    header: DeployHeader,
    payment: ExecutableDeployItem,
    session: ExecutableDeployItem,
    approvals: Approval[] = []
  ): Deploy {
    const deploy = new Deploy();
    deploy.hash = hash;
    deploy.header = header;
    deploy.payment = payment;
    deploy.session = session;
    deploy.approvals = approvals;
    return deploy;
  }

  public static fromHeaderAndItems(
    deployHeader: DeployHeader,
    payment: ExecutableDeployItem,
    session: ExecutableDeployItem
  ): Deploy {
    const paymentBytes = payment.bytes();
    const sessionBytes = session.bytes();
    const serializedBody = new Uint8Array([...paymentBytes, ...sessionBytes]);
    deployHeader.bodyHash = new Hash(blake2b(serializedBody));
    const deployHash = new Hash(blake2b(deployHeader.toBytes()));
    return Deploy.createNew(deployHash, deployHeader, payment, session);
  }

  static newTransactionFromDeploy(deploy: Deploy): Transaction {
    let paymentAmount = 0;
    const transactionEntryPoint: TransactionEntryPoint = new TransactionEntryPoint();
    let transactionCategory = TransactionCategory.Large;

    if (deploy.session.transfer) {
      transactionCategory = TransactionCategory.Mint;
      transactionEntryPoint.transfer = {};
    } else if (deploy.session.moduleBytes) {
      transactionEntryPoint.call = {};
    } else {
      let entryPoint = '';

      if (deploy.session.storedContractByHash) {
        entryPoint = deploy.session.storedContractByHash.entryPoint;
      } else if (deploy.session.storedContractByName) {
        entryPoint = deploy.session.storedContractByName.entryPoint;
      } else if (deploy.session.storedVersionedContractByHash) {
        entryPoint = deploy.session.storedVersionedContractByHash.entryPoint;
      } else if (deploy.session.storedVersionedContractByName) {
        entryPoint = deploy.session.storedVersionedContractByName.entryPoint;
      }
      transactionEntryPoint.custom = entryPoint;
    }

    const amountArgument = deploy.payment.getArgs();
    if (amountArgument) {
      const parsed = amountArgument.args.get('amount');
      if (parsed) {
        paymentAmount = parseInt(parsed.toString(), 10) || 0;
      }
    }

    const standardPayment = paymentAmount === 0 && !deploy.payment.moduleBytes;

    const pricingMode = new PricingMode();
    const classicMode = new ClassicMode();
    classicMode.gasPriceTolerance = 1;
    classicMode.paymentAmount = paymentAmount;
    classicMode.standardPayment = standardPayment;

    return new Transaction(
      deploy.hash,
      new TransactionHeader(
        deploy.header.chainName,
        deploy.header.timestamp,
        deploy.header.ttl,
        new InitiatorAddr(deploy.header.account),
        pricingMode
      ),
      new TransactionBody(
        deploy.session.getArgs(),
        TransactionTarget.newTransactionTargetFromSession(deploy.session),
        transactionEntryPoint,
        new TransactionScheduling({ standard: {} }),
        transactionCategory
      ),
      deploy.approvals,
      undefined,
      deploy
    );
  }

  /**
   * Convert a JSON representation of a deploy to a `Deploy` object
   *
   * @param json A JSON representation of a `Deploy`
   * @returns A `Deploy` object if successful, or throws an error if parsing fails
   */
  public static fromJSON(json: any): Deploy {
    let deploy: Deploy | undefined;

    try {
      const data: Record<string, any> =
        typeof json === 'string' ? JSON.parse(json) : json;

      const deployJson: Record<string, any> | null =
        data.deploy ?? data.Deploy ?? data?.transaction?.Deploy ?? data ?? null;

      if (!(deployJson?.hash && deployJson?.header?.account)) {
        throw new Error("The JSON can't be parsed as a Deploy.");
      }

      const serializer = new TypedJSON(Deploy);
      deploy = serializer.parse(JSON.stringify(deployJson));

      if (!deploy) {
        throw new Error("The JSON can't be parsed as a Deploy.");
      }
    } catch (e) {
      throw new Error(`Serialization error: ${e.message}`);
    }

    const isDeployValid = deploy.validate();

    if (!isDeployValid) {
      throw new Error(`Deploy validation failed`);
    }

    return deploy;
  }

  /**
   * Convert the deploy object to a JSON representation
   *
   * @param deploy The `Deploy` object to convert to JSON
   * @returns A JSON version of the `Deploy`, which can be converted back later
   */
  public static toJson = (deploy: Deploy) => {
    const serializer = new TypedJSON(Deploy);

    return serializer.toPlainJson(deploy);
  };
}

/**
 * Creates an instance of standard payment logic
 * @deprecated Use {ExecutableDeployItem.standardPayment} instead
 *
 * @param paymentAmount The amount of motes to be used to pay for gas
 * @returns A standard payment, as an `ExecutableDeployItem` to be attached to a `Deploy`
 */
export const standardPayment = (paymentAmount: BigNumber) => {
  return ExecutableDeployItem.standardPayment(paymentAmount);
};

/**
 * @deprecated Use Deploy.fromHeaderAndItems
 * Builds a `Deploy` object from `DeployParams`, session logic, and payment logic
 * @param deployParam The parameters of the deploy, see [DeployParams](#L1323)
 * @param session The session logic of the deploy
 * @param payment The payment logic of the deploy
 * @returns A new `Deploy` object
 */
export function makeDeploy(
  deployParam: DeployParams,
  session: ExecutableDeployItem,
  payment: ExecutableDeployItem
): Deploy {
  const serializedBody = concat([payment.bytes(), session.bytes()]);
  const bodyHash = byteHash(serializedBody);

  if (!deployParam.timestamp) {
    deployParam.timestamp = Date.now();
  }

  const header: DeployHeader = new DeployHeader(
    deployParam.chainName,
    deployParam.dependencies.map(d => new Hash(d)),
    deployParam.gasPrice,
    new Timestamp(new Date(deployParam.timestamp)),
    new Duration(deployParam.ttl),
    deployParam.accountPublicKey,
    new Hash(bodyHash)
  );

  return Deploy.fromHeaderAndItems(header, payment, session);
}

/** @deprecated The parameters of a `Deploy` object. Use Deploy.fromHeaderAndItems */
export class DeployParams {
  /**
   * Container for `Deploy` construction options.
   * @param accountPublicKey The public key of the deploying account as a `PublicKey`
   * @param chainName Name of the chain, to avoid the `Deploy` from being accidentally or maliciously included in a different chain.
   * @param gasPrice Conversion rate between the cost of Wasm opcodes and the motes sent by the payment code, where 1 mote = 1 * 10^-9 CSPR
   * @param ttl Time that the `Deploy` will remain valid for, in milliseconds. The default value is 1800000, which is 30 minutes
   * @param dependencies Hex-encoded `Deploy` hashes of deploys which must be executed before this one.
   * @param timestamp  Note that timestamp is UTC, not local.
   */
  constructor(
    public accountPublicKey: PublicKey,
    public chainName: string,
    public gasPrice: number = 1,
    public ttl: number = DEFAULT_DEPLOY_TTL,
    public dependencies: Uint8Array[] = [],
    public timestamp?: number
  ) {
    this.dependencies = dependencies.filter(
      d =>
        dependencies.filter(
          t => Conversions.encodeBase16(d) === Conversions.encodeBase16(t)
        ).length < 2
    );
  }
}

export const DEFAULT_DEPLOY_TTL = 1800000;
