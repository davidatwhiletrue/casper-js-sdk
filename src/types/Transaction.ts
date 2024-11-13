import { jsonObject, jsonMember, jsonArrayMember, TypedJSON } from 'typedjson';
import { concat } from '@ethersproject/bytes';

import { Hash } from './key';
import { Deploy } from './Deploy';
import { Duration, Timestamp } from './Time';
import { InitiatorAddr } from './InitiatorAddr';
import { PricingMode } from './PricingMode';
import { TransactionTarget } from './TransactionTarget';
import { TransactionEntryPoint } from './TransactionEntryPoint';
import { TransactionScheduling } from './TransactionScheduling';
import { PublicKey } from './keypair';
import { HexBytes } from './HexBytes';
import { PrivateKey } from './keypair/PrivateKey';
import { CLValueString, CLValueUInt64 } from './clvalue';
import { Args } from './Args';
import { deserializeArgs, serializeArgs } from './SerializationUtils';
import { byteHash } from './ByteConverters';

/**
 * Custom error class for handling transaction-related errors.
 */
export class TransactionError extends Error {}

/**
 * Error to indicate an invalid body hash in a transaction.
 */
export const ErrInvalidBodyHash = new TransactionError('invalid body hash');

/**
 * Error to indicate an invalid transaction hash.
 */
export const ErrInvalidTransactionHash = new TransactionError(
  'invalid transaction hash'
);

/**
 * Error to indicate an invalid approval signature in a transaction.
 */
export const ErrInvalidApprovalSignature = new TransactionError(
  'invalid approval signature'
);

/**
 * Error to indicate an issue parsing JSON as a TransactionV1.
 */
export const ErrTransactionV1FromJson = new TransactionError(
  "The JSON can't be parsed as a TransactionV1."
);

/**
 * Enum representing the categories of transactions.
 */
export enum TransactionCategory {
  Mint = 0,
  Auction,
  InstallUpgrade,
  Large,
  Medium,
  Small
}

/**
 * Enum representing the versions of transactions.
 */
export enum TransactionVersion {
  V1 = 0,
  Deploy
}

/**
 * Represents an approval for a transaction with a signer and signature.
 */
@jsonObject
export class Approval {
  /**
   * The public key of the signer.
   */
  @jsonMember({
    name: 'signer',
    constructor: PublicKey,
    deserializer: json => PublicKey.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public signer: PublicKey;

  /**
   * The signature of the transaction signed by the signer.
   */
  @jsonMember({
    name: 'signature',
    constructor: HexBytes,
    deserializer: json => HexBytes.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public signature: HexBytes;

  /**
   * Constructs an `Approval` instance with a signer and signature.
   * @param signer The public key of the signer.
   * @param signature The signature of the transaction.
   */
  constructor(signer: PublicKey, signature: HexBytes) {
    this.signer = signer;
    this.signature = signature;
  }
}

/**
 * Represents the header of a TransactionV1.
 */
@jsonObject
export class TransactionV1Header {
  /**
   * The name of the blockchain.
   */
  @jsonMember({ name: 'chain_name', constructor: String })
  public chainName: string;

  /**
   * The timestamp of the transaction.
   */
  @jsonMember({
    name: 'timestamp',
    constructor: Timestamp,
    deserializer: json => Timestamp.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public timestamp: Timestamp;

  /**
   * The time-to-live (TTL) duration of the transaction.
   */
  @jsonMember({
    name: 'ttl',
    constructor: Duration,
    deserializer: json => Duration.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public ttl: Duration;

  /**
   * The address of the transaction initiator.
   */
  @jsonMember({
    name: 'initiator_addr',
    constructor: InitiatorAddr,
    deserializer: json => InitiatorAddr.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public initiatorAddr: InitiatorAddr;

  /**
   * The pricing mode used for the transaction.
   */
  @jsonMember({ name: 'pricing_mode', constructor: PricingMode })
  public pricingMode: PricingMode;

  /**
   * The hash of the transaction body.
   */
  @jsonMember({
    name: 'body_hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public bodyHash: Hash;

  /**
   * Builds a `TransactionV1Header` from the provided properties.
   * @param initiatorAddr The initiator's address.
   * @param timestamp The timestamp of the transaction.
   * @param ttl The TTL of the transaction.
   * @param chainName The chain name.
   * @param pricingMode The pricing mode for the transaction.
   * @returns The constructed `TransactionV1Header`.
   */
  static build({
    initiatorAddr,
    timestamp,
    ttl,
    chainName,
    pricingMode
  }: {
    initiatorAddr: InitiatorAddr;
    timestamp: Timestamp;
    ttl: Duration;
    chainName: string;
    bodyHash?: Hash;
    pricingMode: PricingMode;
  }): TransactionV1Header {
    const header = new TransactionV1Header();
    header.initiatorAddr = initiatorAddr;
    header.timestamp = timestamp;
    header.ttl = ttl;
    header.pricingMode = pricingMode;
    header.chainName = chainName;
    return header;
  }

  /**
   * Serializes the header to a byte array.
   * @returns The serialized byte array representing the header.
   */
  public toBytes(): Uint8Array {
    const chainNameBytes = CLValueString.newCLString(this.chainName).bytes();
    const timestampMillis = this.timestamp.toMilliseconds();
    const timestampBytes = CLValueUInt64.newCLUint64(
      BigInt(timestampMillis)
    ).bytes();
    const ttlBytes = CLValueUInt64.newCLUint64(
      BigInt(this.ttl.toMilliseconds())
    ).bytes();
    const bodyHashBytes = this.bodyHash.toBytes();
    const pricingModeBytes = this.pricingMode.toBytes();
    const initiatorAddrBytes = this.initiatorAddr.toBytes();

    return concat([
      chainNameBytes,
      timestampBytes,
      ttlBytes,
      bodyHashBytes,
      pricingModeBytes,
      initiatorAddrBytes
    ]);
  }
}

/**
 * Represents the body of a TransactionV1.
 */
@jsonObject
export class TransactionV1Body {
  /**
   * The arguments for the transaction.
   */
  @jsonMember({
    name: 'args',
    constructor: Args,
    deserializer: deserializeArgs,
    serializer: serializeArgs
  })
  public args: Args;

  /**
   * The target of the transaction.
   */
  @jsonMember({
    name: 'target',
    constructor: TransactionTarget,
    deserializer: json => TransactionTarget.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public target: TransactionTarget;

  /**
   * The entry point for the transaction.
   */
  @jsonMember({
    name: 'entry_point',
    constructor: TransactionEntryPoint,
    deserializer: json => TransactionEntryPoint.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public entryPoint: TransactionEntryPoint;

  /**
   * The category of the transaction.
   */
  @jsonMember({ name: 'transaction_category', constructor: Number })
  public category: number;

  /**
   * The scheduling information for the transaction.
   */
  @jsonMember({
    name: 'scheduling',
    constructor: TransactionScheduling,
    deserializer: json => TransactionScheduling.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public scheduling: TransactionScheduling;

  /**
   * Builds a `TransactionV1Body` from the provided properties.
   * @param args The arguments for the transaction.
   * @param target The target of the transaction.
   * @param transactionEntryPoint The entry point for the transaction.
   * @param transactionScheduling The scheduling for the transaction.
   * @param transactionCategory The category of the transaction.
   * @returns The constructed `TransactionV1Body`.
   */
  static build({
    args,
    target,
    transactionEntryPoint,
    transactionScheduling,
    transactionCategory
  }: {
    args: Args;
    target: TransactionTarget;
    transactionEntryPoint: TransactionEntryPoint;
    transactionScheduling: TransactionScheduling;
    transactionCategory: number;
  }): TransactionV1Body {
    const body = new TransactionV1Body();
    body.args = args;
    body.target = target;
    body.entryPoint = transactionEntryPoint;
    body.scheduling = transactionScheduling;
    body.category = transactionCategory;
    return body;
  }

  /**
   * Serializes the body to a byte array.
   * @returns The serialized byte array representing the body.
   */
  toBytes(): Uint8Array {
    const argsBytes = this.args?.toBytes() || new Uint8Array();
    const targetBytes = this.target.toBytes();
    const entryPointBytes = this.entryPoint.bytes();
    const categoryBytes = new Uint8Array([this.category]);
    const schedulingBytes = this.scheduling.bytes();

    return concat([
      argsBytes,
      targetBytes,
      entryPointBytes,
      categoryBytes,
      schedulingBytes
    ]);
  }
}

/**
 * Represents a TransactionV1 object, including its header, body, and approvals.
 */
@jsonObject
export class TransactionV1 {
  /**
   * The hash of the transaction.
   */
  @jsonMember({
    name: 'hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public hash: Hash;

  /**
   * The header of the transaction.
   */
  @jsonMember({ name: 'header', constructor: TransactionV1Header })
  public header: TransactionV1Header;

  /**
   * The body of the transaction.
   */
  @jsonMember({ name: 'body', constructor: TransactionV1Body })
  public body: TransactionV1Body;

  /**
   * The approvals for the transaction.
   */
  @jsonArrayMember(() => Approval)
  public approvals: Approval[];

  constructor(
    hash: Hash,
    header: TransactionV1Header,
    body: TransactionV1Body,
    approvals: Approval[]
  ) {
    this.hash = hash;
    this.header = header;
    this.body = body;
    this.approvals = approvals;
  }

  /**
   * Validates the transaction by checking the body hash and the approval signatures.
   * @throws {TransactionError} Throws errors if validation fails.
   */
  public validate(): void {
    const bodyBytes = this.body.toBytes();

    if (!this.arrayEquals(byteHash(bodyBytes), this.header.bodyHash.toBytes()))
      throw ErrInvalidBodyHash;

    const headerBytes = this.header.toBytes();

    if (!this.arrayEquals(byteHash(headerBytes), this.hash.toBytes()))
      throw ErrInvalidTransactionHash;

    for (const approval of this.approvals) {
      if (
        !approval.signer.verifySignature(
          this.hash.toBytes(),
          approval.signature.bytes
        )
      ) {
        throw ErrInvalidApprovalSignature;
      }
    }
  }

  /**
   * Compares two arrays for equality.
   * @param a The first array.
   * @param b The second array.
   * @returns `true` if the arrays are equal, `false` otherwise.
   */
  private arrayEquals(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  /**
   * Signs the transaction using the provided private key.
   * @param keys The private key to sign the transaction.
   */
  async sign(keys: PrivateKey): Promise<void> {
    const signatureBytes = await keys.sign(this.hash.toBytes());
    const signature = new HexBytes(signatureBytes);

    if (!this.approvals) {
      this.approvals = [];
    }

    this.approvals.push(new Approval(keys.publicKey, signature));
  }

  /**
   * Sets an already generated signature to the transaction.
   * @param transaction The `TransactionV1` instance.
   * @param signature The Ed25519 or Secp256K1 signature.
   * @param publicKey The public key used to generate the signature.
   * @returns The updated `TransactionV1`.
   */
  static setSignature(
    transaction: TransactionV1,
    signature: Uint8Array,
    publicKey: PublicKey
  ): TransactionV1 {
    const hex = new HexBytes(signature);
    transaction.approvals.push(new Approval(publicKey, hex));

    return transaction;
  }

  /**
   * Creates a new `TransactionV1` instance.
   * @param hash The hash of the transaction.
   * @param header The header of the transaction.
   * @param body The body of the transaction.
   * @param approvals The approvals for the transaction.
   * @returns A new `TransactionV1` instance.
   */
  static newTransactionV1(
    hash: Hash,
    header: TransactionV1Header,
    body: TransactionV1Body,
    approvals: Approval[]
  ): TransactionV1 {
    return new TransactionV1(hash, header, body, approvals);
  }

  /**
   * Creates a new `TransactionV1` instance with a header and body.
   * @param transactionHeader The header of the transaction.
   * @param transactionBody The body of the transaction.
   * @returns A new `TransactionV1` instance.
   */
  static makeTransactionV1(
    transactionHeader: TransactionV1Header,
    transactionBody: TransactionV1Body
  ): TransactionV1 {
    const bodyBytes = transactionBody.toBytes();
    transactionHeader.bodyHash = new Hash(new Uint8Array(byteHash(bodyBytes)));

    const headerBytes = transactionHeader.toBytes();
    const transactionHash = new Hash(new Uint8Array(byteHash(headerBytes)));
    return new TransactionV1(
      transactionHash,
      transactionHeader,
      transactionBody,
      []
    );
  }

  /**
   * Converts a JSON representation of a `TransactionV1` to a `TransactionV1` object.
   * @param json A JSON representation of a `TransactionV1`.
   * @returns A `TransactionV1` object.
   * @throws {TransactionError} If parsing fails.
   */
  public static fromJSON(json: any): TransactionV1 {
    let tx: TransactionV1 | undefined;

    try {
      const data: Record<string, any> =
        typeof json === 'string' ? JSON.parse(json) : json;
      const txData: Record<string, any> | null =
        data?.transaction?.Version1 ?? data?.Version1 ?? data ?? null;

      if (!(txData?.hash && txData?.header?.initiator_addr)) {
        throw ErrTransactionV1FromJson;
      }

      const serializer = new TypedJSON(TransactionV1);
      tx = serializer.parse(JSON.stringify(txData));

      if (!tx) {
        throw ErrTransactionV1FromJson;
      }
    } catch (e) {
      throw new Error(`Serialization error: ${e.message}`);
    }

    tx.validate();

    return tx;
  }

  /**
   * Converts the `TransactionV1` object to a JSON representation.
   * @param transaction The `TransactionV1` object.
   * @returns A JSON version of the `TransactionV1`.
   */
  public static toJson = (transaction: TransactionV1) => {
    const serializer = new TypedJSON(TransactionV1);

    return { transaction: serializer.toPlainJson(transaction) };
  };
}

/**
 * Represents the header of a transaction, including details like chain name, timestamp,
 * time-to-live (TTL), initiator address, and pricing mode.
 */
@jsonObject
export class TransactionHeader {
  /**
   * The name of the blockchain chain associated with this transaction.
   */
  @jsonMember({ name: 'chain_name', constructor: String })
  public chainName: string;

  /**
   * The timestamp when the transaction was created.
   */
  @jsonMember({
    name: 'timestamp',
    constructor: Timestamp,
    deserializer: json => Timestamp.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public timestamp: Timestamp;

  /**
   * The time-to-live (TTL) duration of the transaction. It defines the expiration time for the transaction.
   */
  @jsonMember({
    name: 'ttl',
    constructor: Duration,
    deserializer: json => Duration.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public ttl: Duration;

  /**
   * The address of the initiator of the transaction.
   */
  @jsonMember({
    name: 'initiator_addr',
    constructor: InitiatorAddr,
    deserializer: json => InitiatorAddr.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public initiatorAddr: InitiatorAddr;

  /**
   * The pricing mode used for the transaction, which may involve different cost mechanisms.
   */
  @jsonMember({ name: 'pricing_mode', constructor: PricingMode })
  public pricingMode: PricingMode;

  /**
   * Creates a new `TransactionHeader` instance with the given properties.
   * @param chainName The name of the blockchain chain.
   * @param timestamp The timestamp of the transaction.
   * @param ttl The TTL (Time-To-Live) for the transaction.
   * @param initiatorAddr The address of the transaction initiator.
   * @param pricingMode The pricing mode for the transaction.
   */
  constructor(
    chainName: string,
    timestamp: Timestamp,
    ttl: Duration,
    initiatorAddr: InitiatorAddr,
    pricingMode: PricingMode
  ) {
    this.chainName = chainName;
    this.timestamp = timestamp;
    this.ttl = ttl;
    this.initiatorAddr = initiatorAddr;
    this.pricingMode = pricingMode;
  }
}

/**
 * Represents the body of a transaction, containing the arguments, target,
 * entry point, scheduling information, and transaction category.
 */
@jsonObject
export class TransactionBody {
  /**
   * The arguments for the transaction, which can be a map of values required by the entry point.
   */
  @jsonMember({
    constructor: Args,
    name: 'args',
    deserializer: deserializeArgs,
    serializer: serializeArgs
  })
  public args: Args;

  /**
   * The target of the transaction, which specifies where the transaction is directed (e.g., a contract or account).
   */
  @jsonMember({
    name: 'target',
    constructor: TransactionTarget,
    serializer: value => value.toJSON(),
    deserializer: json => TransactionTarget.fromJSON(json)
  })
  public target: TransactionTarget;

  /**
   * The entry point of the transaction, specifying the method or action to be executed.
   */
  @jsonMember({
    name: 'entry_point',
    constructor: TransactionEntryPoint,
    serializer: value => value.toJSON(),
    deserializer: json => TransactionEntryPoint.fromJSON(json)
  })
  public entryPoint: TransactionEntryPoint;

  /**
   * The scheduling information for when the transaction should be executed.
   */
  @jsonMember({
    name: 'scheduling',
    constructor: TransactionScheduling,
    serializer: value => value.toJSON(),
    deserializer: json => TransactionScheduling.fromJSON(json)
  })
  public scheduling: TransactionScheduling;

  /**
   * The category of the transaction, indicating its type (e.g., minting, auction).
   */
  @jsonMember({ name: 'transaction_category', constructor: Number })
  public category: number;

  /**
   * Constructs a `TransactionBody` with the given arguments, target, entry point, scheduling, and category.
   * @param args The arguments for the transaction.
   * @param target The target of the transaction (e.g., a contract or account).
   * @param entryPoint The entry point to specify the method or action of the transaction.
   * @param scheduling The scheduling information for the transaction's execution.
   * @param category The category/type of the transaction (e.g., mint, auction).
   */
  constructor(
    args: Args,
    target: TransactionTarget,
    entryPoint: TransactionEntryPoint,
    scheduling: TransactionScheduling,
    category: number
  ) {
    this.args = args;
    this.target = target;
    this.entryPoint = entryPoint;
    this.scheduling = scheduling;
    this.category = category;
  }
}

/**
 * Represents a transaction in the system, containing information such as its hash,
 * header, body, approvals, and optionally its associated deployment and transaction details.
 */
@jsonObject
export class Transaction {
  /**
   * The hash of the transaction.
   */
  @jsonMember({
    name: 'hash',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  public hash: Hash;

  /**
   * The header of the transaction, which includes metadata about the transaction.
   */
  @jsonMember({ name: 'header', constructor: TransactionHeader })
  public header: TransactionHeader;

  /**
   * The body of the transaction, containing details such as the target, entry point, and arguments.
   */
  @jsonMember({ name: 'body', constructor: TransactionBody })
  public body: TransactionBody;

  /**
   * The list of approvals for this transaction.
   */
  @jsonArrayMember(Approval)
  public approvals: Approval[];

  /**
   * The original deployment associated with this transaction, if applicable.
   * This is optional and only populated if the transaction originated from a deploy.
   */
  private originDeployV1?: Deploy;

  /**
   * The original TransactionV1 associated with this transaction, if applicable.
   * This is optional and only populated if the transaction is based on a TransactionV1.
   */
  private originTransactionV1?: TransactionV1;

  /**
   * Creates a new `Transaction` instance with the specified values.
   * @param hash The hash of the transaction.
   * @param header The header of the transaction.
   * @param body The body of the transaction.
   * @param approvals The list of approvals for this transaction.
   * @param originTransactionV1 The original TransactionV1, if applicable.
   * @param originDeployV1 The original deploy, if applicable.
   */
  constructor(
    hash: Hash,
    header: TransactionHeader,
    body: TransactionBody,
    approvals: Approval[],
    originTransactionV1?: TransactionV1,
    originDeployV1?: Deploy
  ) {
    this.hash = hash;
    this.header = header;
    this.body = body;
    this.approvals = approvals;
    this.originDeployV1 = originDeployV1;
    this.originTransactionV1 = originTransactionV1;
  }

  /**
   * Gets the original deployment associated with this transaction, if available.
   * @returns The original deploy or `undefined` if not available.
   */
  public getDeploy(): Deploy | undefined {
    return this.originDeployV1;
  }

  /**
   * Gets the original TransactionV1 associated with this transaction, if available.
   * @returns The original TransactionV1 or `undefined` if not available.
   */
  public getTransactionV1(): TransactionV1 | undefined {
    return this.originTransactionV1;
  }

  /**
   * Converts a `TransactionV1` to a `Transaction` object.
   * @param v1 The `TransactionV1` to convert.
   * @returns A new `Transaction` instance created from the given `TransactionV1`.
   */
  static fromTransactionV1(v1: TransactionV1): Transaction {
    return new Transaction(
      v1.hash,
      new TransactionHeader(
        v1.header.chainName,
        v1.header.timestamp,
        v1.header.ttl,
        v1.header.initiatorAddr,
        v1.header.pricingMode
      ),
      new TransactionBody(
        v1.body.args,
        v1.body.target,
        v1.body.entryPoint,
        v1.body.scheduling,
        v1.body.category
      ),
      v1.approvals,
      v1
    );
  }
}

/**
 * Wrapper class for transactions, allowing for both `Deploy` and `TransactionV1` to be stored
 * in the same object. This can be useful when working with multiple versions of transactions.
 */
@jsonObject
export class TransactionWrapper {
  /**
   * The deployment object associated with the transaction, if applicable.
   * This will contain the details of the deploy transaction.
   */
  @jsonMember({ name: 'Deploy', constructor: () => Deploy })
  deploy?: Deploy;

  /**
   * The version 1 transaction object, if applicable.
   * This will contain the details of a TransactionV1, which represents the first version of a transaction.
   */
  @jsonMember({ name: 'Version1', constructor: TransactionV1 })
  transactionV1?: TransactionV1;

  /**
   * Constructs a new `TransactionWrapper` instance with the provided `Deploy` and `TransactionV1` values.
   * @param deploy The `Deploy` object, if applicable.
   * @param transactionV1 The `TransactionV1` object, if applicable.
   */
  constructor(deploy?: Deploy, transactionV1?: TransactionV1) {
    this.deploy = deploy;
    this.transactionV1 = transactionV1;
  }
}

/**
 * Represents a transaction hash, which can either be associated with a `Deploy` or a `TransactionV1`.
 * This class helps in wrapping transaction hashes from different transaction types.
 */
@jsonObject
export class TransactionHash {
  /**
   * The hash associated with the deploy transaction, if applicable.
   * This will contain the hash of the `Deploy` transaction.
   */
  @jsonMember({
    name: 'Deploy',
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
  public deploy?: Hash;

  /**
   * The hash associated with the version 1 transaction, if applicable.
   * This will contain the hash of the `TransactionV1`.
   */
  @jsonMember({
    name: 'Version1',
    constructor: Hash,
    deserializer: json => {
      if (!json) return;
      return Hash.fromJSON(json);
    },
    serializer: value => value.toJSON()
  })
  public transactionV1?: Hash;

  /**
   * Constructs a new `TransactionHash` instance, which can hold either a `Deploy` hash or a `TransactionV1` hash.
   * @param deploy The hash of the deploy transaction, if applicable.
   * @param transactionV1 The hash of the version 1 transaction, if applicable.
   */
  constructor(deploy?: Hash, transactionV1?: Hash) {
    this.deploy = deploy;
    this.transactionV1 = transactionV1;
  }
}
