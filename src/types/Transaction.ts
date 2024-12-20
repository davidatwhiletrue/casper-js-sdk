import { jsonObject, jsonMember, jsonArrayMember, TypedJSON } from 'typedjson';

import { Hash } from './key';
import { Deploy } from './Deploy';
import { Duration, Timestamp } from './Time';
import { InitiatorAddr } from './InitiatorAddr';
import { PricingMode } from './PricingMode';
import { TransactionTarget } from './TransactionTarget';
import { TransactionEntryPoint } from './TransactionEntryPoint';
import { TransactionScheduling } from './TransactionScheduling';
import { PublicKey, PrivateKey } from './keypair';
import { HexBytes } from './HexBytes';
import { Args } from './Args';
import { deserializeArgs, serializeArgs } from './SerializationUtils';
import { byteHash } from './ByteConverters';
import { TransactionV1Payload } from './TransactionV1Payload';

/**
 * Custom error class for handling transaction-related errors.
 */
export class TransactionError extends Error {}

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
 * Represents a TransactionV1 object, including its hash, payload, and approvals.
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
   * The payload of the transaction.
   * A merge of header and body concepts from before.
   */
  @jsonMember({
    name: 'payload',
    constructor: TransactionV1Payload
  })
  public payload: TransactionV1Payload;

  /**
   * The approvals for the transaction.
   */
  @jsonArrayMember(() => Approval)
  public approvals: Approval[];

  constructor(
    hash: Hash,
    payload: TransactionV1Payload,
    approvals: Approval[]
  ) {
    this.hash = hash;
    this.payload = payload;
    this.approvals = approvals;
  }

  /**
   * Validates the transaction by checking the transaction hash and the approval signatures.
   * @throws {TransactionError} Throws errors if validation fails.
   */
  public validate(): boolean {
    const payloadBytes = this.payload!.toBytes();
    const calculatedHash = new Hash(byteHash(payloadBytes));

    if (!this.hash.equals(calculatedHash)) throw ErrInvalidTransactionHash;

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

    return true;
  }

  /**
   * Signs the transaction using the provided private key.
   * @param keys The private key to sign the transaction.
   */
  async sign(keys: PrivateKey): Promise<void> {
    const signatureBytes = await keys.signAndAddAlgorithmBytes(
      this.hash.toBytes()
    );
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
   * @param payload The payload of the transaction. A merge of header and body concepts from before.
   * @param approvals The approvals for the transaction.
   * @returns A new `TransactionV1` instance.
   */
  static newTransactionV1(
    hash: Hash,
    payload: TransactionV1Payload,
    approvals: Approval[]
  ): TransactionV1 {
    return new TransactionV1(hash, payload, approvals);
  }

  /**
   * Creates a new `TransactionV1` instance with a header and body.
   * @param payload The payload of the transaction. A merge of header and body concepts from before.
   * @returns A new `TransactionV1` instance.
   */
  static makeTransactionV1(payload: TransactionV1Payload): TransactionV1 {
    const payloadBytes = payload.toBytes();
    const transactionHash = new Hash(byteHash(payloadBytes));
    return new TransactionV1(transactionHash, payload, []);
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

      if (!(txData?.hash && txData?.payload?.initiator_addr)) {
        throw ErrTransactionV1FromJson;
      }

      const serializer = new TypedJSON(TransactionV1);
      tx = serializer.parse(txData);

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

    return serializer.toPlainJson(transaction);
  };
}

/**
 * A wrapper for a TransactionV1 or Deploy.
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
   * The arguments for the transaction, which can be a map of values required by the entry point.
   */
  @jsonMember(() => Args, {
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
   * @param chainName The blockchain chain name associated with this transaction.
   * @param timestamp The timestamp of transaction creation.
   * @param ttl The time-to-live duration of the transaction.
   * @param initiatorAddr The address of the transaction initiator.
   * @param pricingMode The pricing mode for this transaction.
   * @param args The arguments for the transaction.
   * @param target The target of the transaction.
   * @param entryPoint The entry point of the transaction.
   * @param scheduling The scheduling information for the transaction.
   * @param approvals The list of approvals for this transaction.
   * @param originTransactionV1 The original TransactionV1, if applicable.
   * @param originDeployV1 The original deploy, if applicable.
   */
  constructor(
    hash: Hash,
    chainName: string,
    timestamp: Timestamp,
    ttl: Duration,
    initiatorAddr: InitiatorAddr,
    pricingMode: PricingMode,
    args: Args,
    target: TransactionTarget,
    entryPoint: TransactionEntryPoint,
    scheduling: TransactionScheduling,
    approvals: Approval[],
    originTransactionV1?: TransactionV1,
    originDeployV1?: Deploy
  ) {
    this.hash = hash;
    this.chainName = chainName;
    this.timestamp = timestamp;
    this.ttl = ttl;
    this.initiatorAddr = initiatorAddr;
    this.pricingMode = pricingMode;
    this.args = args;
    this.target = target;
    this.entryPoint = entryPoint;
    this.scheduling = scheduling;
    this.approvals = approvals;

    this.originDeployV1 = originDeployV1;
    this.originTransactionV1 = originTransactionV1;

    if (!(this.originDeployV1 || this.originTransactionV1)) {
      throw new Error(
        'Incorrect Transaction instance. Missing originTransactionV1 or originDeploy'
      );
    }

    if (this.originDeployV1 && this.originTransactionV1) {
      throw new Error(
        'Incorrect Transaction instance. Should be only one of originTransactionV1 or originDeploy'
      );
    }
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

  public getTransactionWrapper(): TransactionWrapper {
    return new TransactionWrapper(
      this.originDeployV1,
      this.originTransactionV1
    );
  }

  /**
   * Validates the transaction by checking the transaction hash and the approval signatures.
   * @throws {TransactionError} Throws errors if validation fails.
   */
  public validate(): boolean {
    if (this.originTransactionV1) {
      return this.originTransactionV1.validate();
    } else if (this.originDeployV1) {
      return this.originDeployV1.validate();
    }

    throw new Error('Incorrect Transaction instance. Missing origin value');
  }

  /**
   * Signs the transaction using the provided private key.
   * @param key The private key to sign the transaction.
   */
  async sign(key: PrivateKey): Promise<void> {
    const signatureBytes = await key.signAndAddAlgorithmBytes(
      this.hash.toBytes()
    );
    this.setSignature(signatureBytes, key.publicKey);
  }

  /**
   * Sets an already generated signature to the transaction.
   * @param signature The Ed25519 or Secp256K1 signature.
   * @param publicKey The public key used to generate the signature.
   */
  setSignature(signature: Uint8Array, publicKey: PublicKey) {
    const hex = new HexBytes(signature);
    const approval = new Approval(publicKey, hex);

    if (this.originTransactionV1) {
      this.originTransactionV1.approvals.push(approval);
    } else if (this.originDeployV1) {
      this.originDeployV1.approvals.push(approval);
    } else {
      throw new Error('Incorrect Transaction instance. Missing origin value');
    }
  }

  /**
   * Converts a `TransactionV1` to a `Transaction` object.
   * @param v1 The `TransactionV1` to convert.
   * @returns A new `Transaction` instance created from the given `TransactionV1`.
   */
  static fromTransactionV1(v1: TransactionV1): Transaction {
    return new Transaction(
      v1.hash,
      v1.payload.chainName,
      v1.payload.timestamp,
      v1.payload.ttl,
      v1.payload.initiatorAddr,
      v1.payload.pricingMode,
      v1.payload.fields.args,
      v1.payload.fields.target,
      v1.payload.fields.entryPoint,
      v1.payload.fields.scheduling,
      v1.approvals,
      v1, // originTransactionV1
      undefined // originDeployV1 is not applicable for this method
    );
  }

  /**
   * Converts a `TransactionV1` to a `Transaction` object.
   * @param deploy The `Deploy` to convert.
   * @returns A new `Transaction` instance created from the given `Deploy`.
   */
  static fromDeploy(deploy: Deploy): Transaction {
    return Deploy.newTransactionFromDeploy(deploy);
  }

  static fromJson(json: any): Transaction {
    try {
      const txV1 = TransactionV1.fromJSON(json);

      return Transaction.fromTransactionV1(txV1);
    } catch (e) {}

    try {
      const deploy = Deploy.fromJSON(json);

      return Transaction.fromDeploy(deploy);
    } catch (e) {}

    throw new Error("The JSON can't be parsed as a Transaction.");
  }

  static toJSON(tx: Transaction) {
    const serializer = new TypedJSON(Transaction);
    return serializer.toPlainJson(tx);
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
  @jsonMember(() => Deploy, { name: 'Deploy' })
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

  static toJSON(wrapper: TransactionWrapper) {
    const serializer = new TypedJSON(TransactionWrapper);
    return serializer.toPlainJson(wrapper);
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
    serializer: value => {
      if (!value) return;
      return value.toJSON();
    }
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
