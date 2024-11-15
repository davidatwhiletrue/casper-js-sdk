import { jsonArrayMember, jsonMember, jsonObject, TypedJSON } from 'typedjson';
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
import { byteHash, toBytesU32 } from './ByteConverters';
import { Conversions } from './Conversions';

/**
 * Represents the header of a deploy in the blockchain.
 * The header contains metadata such as the account initiating the deploy, the body hash, gas price, timestamp, TTL, and dependencies.
 */
@jsonObject
export class DeployHeader {
  /**
   * The public key of the account initiating the deploy.
   * This key is used to verify the identity of the account making the deploy request.
   */
  @jsonMember({
    constructor: PublicKey,
    deserializer: json => {
      if (!json) return;
      return PublicKey.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    }
  })
  public account?: PublicKey;

  /**
   * The hash of the body of the deploy, which is used to verify the contents of the deploy.
   * The body contains the session logic and payment logic of the deploy.
   */
  @jsonMember({
    name: 'body_hash',
    constructor: Hash,
    deserializer: json => {
      if (!json) return;
      return Hash.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    }
  })
  public bodyHash?: Hash;

  /**
   * The name of the blockchain chain that the deploy is associated with.
   * This helps prevent the deploy from being accidentally or maliciously included in a different chain.
   */
  @jsonMember({ name: 'chain_name', constructor: String })
  public chainName = '';

  /**
   * A list of other deploys that must be executed before this one.
   * This ensures dependencies are executed in the correct order.
   */
  @jsonArrayMember(Hash, {
    name: 'dependencies',
    serializer: (value: Hash[]) => value.map(it => it.toJSON()),
    deserializer: (json: any) => json.map((it: string) => Hash.fromJSON(it))
  })
  public dependencies: Hash[] = [];

  /**
   * The price of gas for executing the deploy.
   * Gas is used to pay for the computational resources required to process the deploy.
   */
  @jsonMember({ name: 'gas_price', constructor: Number })
  public gasPrice = 1;

  /**
   * The timestamp when the deploy was created.
   * This timestamp is used to determine the deploy's position in time.
   */
  @jsonMember({
    constructor: Timestamp,
    deserializer: json => Timestamp.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public timestamp: Timestamp = new Timestamp(new Date());

  /**
   * The time-to-live (TTL) for the deploy, after which it will expire if not executed.
   * The default TTL is 30 minutes.
   */
  @jsonMember({
    constructor: Duration,
    deserializer: json => Duration.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public ttl: Duration = new Duration(30 * 60 * 1000);

  /**
   * Constructs a `DeployHeader` instance with the specified parameters.
   * @param chainName The name of the blockchain chain.
   * @param dependencies A list of deploys that must be executed before this one.
   * @param gasPrice The gas price for the deploy.
   * @param timestamp The timestamp when the deploy is created.
   * @param ttl The TTL for the deploy.
   * @param account The public key of the account initiating the deploy (optional).
   * @param bodyHash The hash of the body of the deploy (optional).
   */
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

  /**
   * Converts the deploy header to a byte array for transmission or storage.
   * @returns A `Uint8Array` representing the deploy header in byte format.
   */
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

  /**
   * Returns a default `DeployHeader` instance with default values.
   * @returns A `DeployHeader` instance with default values.
   */
  public static default(): DeployHeader {
    return new DeployHeader();
  }
}

/**
 * Represents a deploy in the blockchain, including the header, payment, session, and approvals.
 * A `Deploy` object is used to package the logic for executing a contract, payment, or transfer on the blockchain.
 */
@jsonObject
export class Deploy {
  /**
   * A list of approvals, including signatures from accounts that have approved the deploy.
   */
  @jsonArrayMember(() => Approval)
  public approvals: Approval[] = [];

  /**
   * The unique hash that identifies this deploy. This hash is used to verify the integrity of the deploy.
   */
  @jsonMember({
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public hash: Hash;

  /**
   * The header of the deploy, which contains metadata such as the account, gas price, timestamp, and TTL.
   */
  @jsonMember({ constructor: DeployHeader })
  public header: DeployHeader;

  /**
   * The executable item representing the payment logic of the deploy.
   */
  @jsonMember({ constructor: ExecutableDeployItem })
  public payment: ExecutableDeployItem;

  /**
   * The executable item representing the session logic of the deploy.
   */
  @jsonMember({ constructor: ExecutableDeployItem })
  public session: ExecutableDeployItem;

  /**
   * Constructs a `Deploy` object.
   *
   * @param hash The deploy hash identifying this deploy.
   * @param header The deploy header containing metadata.
   * @param payment The executable deploy item representing the payment logic.
   * @param session The executable deploy item representing the session logic.
   * @param approvals An array of signatures and accounts who have approved this deploy.
   */
  constructor(
    hash: Hash,
    header: DeployHeader,
    payment: ExecutableDeployItem,
    session: ExecutableDeployItem,
    approvals: Approval[]
  ) {
    this.approvals = approvals;
    this.session = session;
    this.payment = payment;
    this.header = header;
    this.hash = hash;
  }

  /**
   * Validates the deploy by checking its body hash, deploy hash, and approval signatures.
   *
   * @returns `true` if the deploy is valid, otherwise throws an error.
   */
  public validate(): boolean {
    const paymentBytes = this.payment.bytes();
    const sessionBytes = this.session.bytes();
    const concatenatedBytes = concat([paymentBytes, sessionBytes]);
    const calculatedBodyHash = new Hash(byteHash(concatenatedBytes));

    const headerBytes = this.header.toBytes();
    const calculatedHash = new Hash(byteHash(headerBytes));

    if (
      !this.header.bodyHash?.equals(calculatedBodyHash) ||
      !this.hash.equals(calculatedHash)
    ) {
      throw new Error('Invalid deploy hash or body hash');
    }

    this.approvals.forEach(approval => {
      if (
        !approval.signer.verifySignature(
          this.hash.toBytes(),
          approval.signature.bytes
        )
      ) {
        throw new Error('Invalid approval signature');
      }
    });

    return true;
  }

  /**
   * Signs the deploy with a given private key and adds the signature to the approvals list.
   *
   * @param keys The private key used to sign the deploy.
   */
  public async sign(keys: PrivateKey): Promise<void> {
    const signatureBytes = await keys.sign(this.hash.toBytes());
    const signature = new HexBytes(signatureBytes);
    this.approvals.push(new Approval(keys.publicKey, signature));
  }

  /**
   * Converts the deploy object into a byte array for transmission or storage.
   *
   * @returns A `Uint8Array` representing the deploy in byte format.
   */
  toBytes(): Uint8Array {
    return concat([
      this.header.toBytes(),
      this.hash.toBytes(),
      concat([this.payment.bytes(), this.session.bytes()]),
      serializeApprovals(this.approvals)
    ]);
  }

  /**
   * Sets an already generated signature for the deploy.
   *
   * @param deploy The deploy instance.
   * @param signature The Ed25519 or Secp256K1 signature.
   * @param publicKey The public key used to generate the signature.
   * @returns A new `Deploy` instance with the added signature.
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

  /**
   * Creates a new `Deploy` instance with the provided parameters.
   *
   * @param hash The deploy hash identifying this deploy.
   * @param header The deploy header.
   * @param payment The executable deploy item for the payment logic.
   * @param session The executable deploy item for the session logic.
   * @param approvals An array of approvals for the deploy.
   * @returns A new `Deploy` object.
   */
  public static createNew(
    hash: Hash,
    header: DeployHeader,
    payment: ExecutableDeployItem,
    session: ExecutableDeployItem,
    approvals: Approval[] = []
  ): Deploy {
    return new Deploy(hash, header, payment, session, approvals);
  }

  /**
   * Creates a `Deploy` instance from the deploy header and session/payment logic.
   *
   * @param deployHeader The deploy header.
   * @param payment The payment logic of the deploy.
   * @param session The session logic of the deploy.
   * @returns A new `Deploy` object.
   */
  public static fromHeaderAndItems(
    deployHeader: DeployHeader,
    payment: ExecutableDeployItem,
    session: ExecutableDeployItem
  ): Deploy {
    const paymentBytes = payment.bytes();
    const sessionBytes = session.bytes();
    const serializedBody = concat([paymentBytes, sessionBytes]);
    deployHeader.bodyHash = new Hash(byteHash(serializedBody));
    const deployHash = new Hash(byteHash(deployHeader.toBytes()));
    return Deploy.createNew(deployHash, deployHeader, payment, session);
  }

  /**
   * Converts the `Deploy` into a `Transaction` object.
   * This method creates a transaction based on the deploy, including its payment and session logic.
   *
   * @param deploy The deploy object.
   * @returns A new `Transaction` object created from the deploy.
   */
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
   * Converts a JSON representation of a deploy to a `Deploy` object.
   *
   * @param json The JSON representation of a `Deploy`.
   * @returns A `Deploy` object if successful, or throws an error if parsing fails.
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
   * Converts the `Deploy` object into a JSON representation.
   *
   * @param deploy The deploy object to convert to JSON.
   * @returns A JSON representation of the deploy.
   */
  public static toJson = (deploy: Deploy) => {
    const serializer = new TypedJSON(Deploy);
    return serializer.toPlainJson(deploy);
  };

  /**
   * Identifies whether this `Deploy` represents a transfer of CSPR.
   *
   * @returns `true` if the deploy is a transfer, otherwise `false`.
   */
  public isTransfer(): boolean {
    return this.session.isTransfer();
  }

  /**
   * Identifies whether this `Deploy` represents a standard payment, like a gas payment.
   *
   * @returns `true` if the deploy is a standard payment, otherwise `false`.
   */
  public isStandardPayment(): boolean {
    if (this.payment.isModuleBytes()) {
      return this.payment.asModuleBytes()?.moduleBytes.length === 0;
    }
    return false;
  }
}

/**
 * Creates an instance of standard payment logic for use in a `Deploy` object.
 * This method is deprecated. It is recommended to use the `ExecutableDeployItem.standardPayment` method instead.
 *
 * @deprecated Use {ExecutableDeployItem.standardPayment} instead
 * @param paymentAmount The amount of motes to be used to pay for gas. This value should be expressed in motes, where 1 mote = 1 * 10^-9 CSPR.
 * @returns An `ExecutableDeployItem` representing the standard payment logic, to be attached to a `Deploy`.
 *
 * @example
 * const paymentAmount = BigNumber.from('1000000');
 * const paymentItem = standardPayment(paymentAmount);
 */
export const standardPayment = (paymentAmount: BigNumber) => {
  return ExecutableDeployItem.standardPayment(paymentAmount);
};

/**
 * Builds a `Deploy` object from the given parameters, session logic, and payment logic.
 * This method is deprecated. It is recommended to use `Deploy.fromHeaderAndItems` instead.
 *
 * @deprecated Use `Deploy.fromHeaderAndItems` instead
 * @param deployParam The parameters used for creating the deploy. See [DeployParams](#L1323).
 * @param session The session logic of the deploy, represented as an `ExecutableDeployItem`.
 * @param payment The payment logic of the deploy, represented as an `ExecutableDeployItem`.
 * @returns A new `Deploy` object that represents the entire deploy.
 *
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

/**
 * Serializes an array of `Approval`s into a `Uint8Array` typed byte array.
 * This is used to store or transmit the approvals associated with a deploy.
 *
 * @param approvals An array of `Approval` objects that represent signatures from accounts that have approved the deploy.
 * @returns A `Uint8Array` typed byte array that can be deserialized back into an array of `Approval` objects.
 *
 * @example
 * const approvals = [new Approval(publicKey, signature)];
 * const serializedApprovals = serializeApprovals(approvals);
 */
export const serializeApprovals = (approvals: Approval[]): Uint8Array => {
  const len = toBytesU32(approvals.length);
  const bytes = concat(
    approvals.map(approval => {
      return concat([
        Uint8Array.from(Buffer.from(approval.signer.toString(), 'hex')),
        Uint8Array.from(Buffer.from(approval.signature.toString(), 'hex'))
      ]);
    })
  );
  return concat([len, bytes]);
};

/**
 * The parameters of a `Deploy` object.
 * This class is deprecated. Use `Deploy.fromHeaderAndItems` instead.
 *
 * It is used to configure the construction of a `Deploy` object.
 *
 * @deprecated The parameters of a `Deploy` object. Use Deploy.fromHeaderAndItems
 */
export class DeployParams {
  /**
   * Constructor for `DeployParams`.
   *
   * @param accountPublicKey The public key of the deploying account as a `PublicKey`.
   * @param chainName The name of the blockchain chain to avoid the `Deploy` from being accidentally or maliciously included in another chain.
   * @param gasPrice The conversion rate between the cost of Wasm opcodes and the motes sent by the payment code. 1 mote = 1 * 10^-9 CSPR.
   * @param ttl The time-to-live (TTL) for the deploy, in milliseconds. The default value is 30 minutes (1800000 milliseconds).
   * @param dependencies Hex-encoded `Deploy` hashes of deploys that must be executed before this one.
   * @param timestamp The timestamp when the deploy is created, in UTC.
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

/**
 * Default TTL value used for deploys (30 minutes).
 */
export const DEFAULT_DEPLOY_TTL = 1800000;
