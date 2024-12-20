import { BigNumber, BigNumberish } from '@ethersproject/bignumber';

import { InitiatorAddr } from './InitiatorAddr';
import { PaymentLimitedMode, PricingMode } from './PricingMode';
import {
  ByPackageHashInvocationTarget,
  ByPackageNameInvocationTarget,
  SessionTarget,
  StoredTarget,
  TransactionInvocationTarget,
  TransactionRuntime,
  TransactionTarget
} from './TransactionTarget';
import {
  TransactionEntryPoint,
  TransactionEntryPointEnum
} from './TransactionEntryPoint';
import { TransactionScheduling } from './TransactionScheduling';
import { Args } from './Args';
import { PublicKey } from './keypair';
import { AccountHash, Hash } from './key';
import { TransactionV1 } from './Transaction';
import { TransactionV1Payload } from './TransactionV1Payload';
import { Duration, Timestamp } from './Time';
import {
  CLValue,
  CLValueByteArray,
  CLValueOption,
  CLValueUInt32,
  CLValueUInt512,
  CLValueUInt64,
  CLValueUInt8
} from './clvalue';

/**
 * Abstract base class for building Transaction V1 instances.
 */
abstract class TransactionV1Builder<T extends TransactionV1Builder<T>> {
  protected _initiatorAddr!: InitiatorAddr;
  protected _chainName!: string;
  protected _timestamp = new Timestamp(new Date());
  protected _ttl = new Duration(1800000);
  protected _pricingMode!: PricingMode;
  protected _invocationTarget!: TransactionTarget;
  protected _entryPoint!: TransactionEntryPoint;
  protected _scheduling: TransactionScheduling = new TransactionScheduling({}); // Standard
  protected _runtimeArgs: Args;

  /**
   * Sets the initiator address using a public key.
   */
  public from(publicKey: PublicKey): T {
    this._initiatorAddr = new InitiatorAddr(publicKey);
    return (this as unknown) as T;
  }

  /**
   * Sets the initiator address using an account hash.
   */
  public fromAccountHash(accountHashKey: AccountHash): T {
    this._initiatorAddr = new InitiatorAddr(undefined, accountHashKey);
    return (this as unknown) as T;
  }

  /**
   * Sets the chain name for the transaction.
   */
  public chainName(chainName: string): T {
    this._chainName = chainName;
    return (this as unknown) as T;
  }

  /**
   * Sets the timestamp for the transaction.
   */
  public timestamp(timestamp: Timestamp): T {
    this._timestamp = timestamp;
    return (this as unknown) as T;
  }

  /**
   * Sets the time-to-live for the transaction.
   */
  public ttl(ttl: number): T {
    this._ttl = new Duration(ttl);
    return (this as unknown) as T;
  }

  /**
   * Sets the payment amount for the transaction.
   */
  public payment(paymentAmount: number): T {
    const pricingMode = new PricingMode();
    const paymentLimited = new PaymentLimitedMode();
    paymentLimited.standardPayment = true;
    paymentLimited.paymentAmount = paymentAmount;
    paymentLimited.gasPriceTolerance = 1;

    pricingMode.paymentLimited = paymentLimited;
    this._pricingMode = pricingMode;
    return (this as unknown) as T;
  }

  /**
   * Builds and returns the TransactionV1 instance.
   */
  public build(): TransactionV1 {
    const transactionPayload = TransactionV1Payload.build({
      initiatorAddr: this._initiatorAddr,
      timestamp: this._timestamp,
      ttl: this._ttl,
      chainName: this._chainName,
      pricingMode: this._pricingMode,
      args: this._runtimeArgs,
      transactionTarget: this._invocationTarget,
      entryPoint: this._entryPoint,
      scheduling: this._scheduling
    });

    return TransactionV1.makeTransactionV1(transactionPayload);
  }
}

/**
 * Builder for creating Native Transfer transactions.
 */
export class NativeTransferBuilder extends TransactionV1Builder<
  NativeTransferBuilder
> {
  private _target!: CLValue;
  private _amount: CLValue = CLValueUInt512.newCLUInt512('0');
  private _idTransfer?: number;

  constructor() {
    super();
    this._invocationTarget = new TransactionTarget({}); // Native
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.Transfer
    );
  }

  /**
   * Sets the target public key for the transfer.
   */
  public target(publicKey: PublicKey): NativeTransferBuilder {
    this._target = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  /**
   * Sets the target account hash for the transfer.
   */
  public targetAccountHash(accountHashKey: AccountHash): NativeTransferBuilder {
    this._target = CLValueByteArray.newCLByteArray(accountHashKey.toBytes());
    return this;
  }

  /**
   * Sets the amount to transfer.
   */
  public amount(amount: BigNumber | string): NativeTransferBuilder {
    this._amount = CLValueUInt512.newCLUInt512(amount);
    return this;
  }

  /**
   * Sets the transfer ID.
   */
  public id(id: number): NativeTransferBuilder {
    this._idTransfer = id;
    return this;
  }

  /**
   * Builds and returns the Native Transfer transaction.
   */
  public build(): TransactionV1 {
    const runtimeArgs = Args.fromMap({});

    runtimeArgs.insert('target', this._target);
    runtimeArgs.insert('amount', this._amount);

    if (this._idTransfer) {
      runtimeArgs.insert(
        'id',
        CLValueOption.newCLOption(CLValueUInt64.newCLUint64(this._idTransfer))
      );
    }

    this._runtimeArgs = runtimeArgs;
    return super.build();
  }
}

export class NativeAddBidBuilder extends TransactionV1Builder<
  NativeAddBidBuilder
> {
  private _validator!: CLValue;
  private _amount!: CLValue;
  private _delegationRate!: CLValue;
  private _minimumDelegationAmount?: CLValue;
  private _maximumDelegationAmount?: CLValue;
  private _reservedSlots?: CLValue;

  constructor() {
    super();
    this._invocationTarget = new TransactionTarget({}); // Native
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.AddBid
    );
  }

  public validator(publicKey: PublicKey): NativeAddBidBuilder {
    this._validator = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  public amount(amount: BigNumber | string): NativeAddBidBuilder {
    this._amount = CLValueUInt512.newCLUInt512(amount);
    return this;
  }

  public delegationRate(delegationRate: number): NativeAddBidBuilder {
    this._delegationRate = CLValueUInt8.newCLUint8(delegationRate);
    return this;
  }

  public minimumDelegationAmount(
    minimumDelegationAmount: BigNumberish
  ): NativeAddBidBuilder {
    this._minimumDelegationAmount = CLValueUInt64.newCLUint64(
      minimumDelegationAmount
    );
    return this;
  }

  public maximumDelegationAmount(
    maximumDelegationAmount: BigNumberish
  ): NativeAddBidBuilder {
    this._maximumDelegationAmount = CLValueUInt64.newCLUint64(
      maximumDelegationAmount
    );
    return this;
  }

  public reservedSlots(reservedSlots: BigNumber): NativeAddBidBuilder {
    this._reservedSlots = CLValueUInt32.newCLUInt32(reservedSlots);
    return this;
  }

  public build(): TransactionV1 {
    const runtimeArgs = Args.fromMap({});

    runtimeArgs.insert('public_key', this._validator);
    runtimeArgs.insert('amount', this._amount);
    runtimeArgs.insert('delegation_rate', this._delegationRate);

    if (this._minimumDelegationAmount) {
      runtimeArgs.insert(
        'minimum_delegation_amount',
        this._minimumDelegationAmount
      );
    }

    if (this._maximumDelegationAmount) {
      runtimeArgs.insert(
        'maximum_delegation_amount',
        this._maximumDelegationAmount
      );
    }

    if (this._reservedSlots) {
      runtimeArgs.insert('reserved_slots', this._reservedSlots);
    }

    this._runtimeArgs = runtimeArgs;

    return super.build();
  }
}

export class NativeWithdrawBidBuilder extends TransactionV1Builder<
  NativeWithdrawBidBuilder
> {
  private _validator!: CLValue;
  private _amount: CLValue = CLValueUInt512.newCLUInt512('0');

  constructor() {
    super();
    this._invocationTarget = new TransactionTarget({}); // Native
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.WithdrawBid
    );
  }

  public validator(publicKey: PublicKey): NativeWithdrawBidBuilder {
    this._validator = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  public amount(amount: BigNumber | string): NativeWithdrawBidBuilder {
    this._amount = CLValueUInt512.newCLUInt512(amount);
    return this;
  }

  public build(): TransactionV1 {
    this._runtimeArgs = Args.fromMap({
      public_key: this._validator,
      amount: this._amount
    });

    return super.build();
  }
}

export class NativeDelegateBuilder extends TransactionV1Builder<
  NativeDelegateBuilder
> {
  private _validator!: CLValue;
  private _amount: CLValue = CLValueUInt512.newCLUInt512('0');

  constructor() {
    super();
    this._invocationTarget = new TransactionTarget({});
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.Delegate
    );
  }

  public validator(publicKey: PublicKey): NativeDelegateBuilder {
    this._validator = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  public amount(amount: BigNumber | string): NativeDelegateBuilder {
    this._amount = CLValueUInt512.newCLUInt512(amount);
    return this;
  }

  public build(): TransactionV1 {
    if (!this._initiatorAddr.publicKey) {
      throw new Error('Initiator addr is not specified');
    }

    this._runtimeArgs = Args.fromMap({
      delegator: CLValue.newCLPublicKey(this._initiatorAddr.publicKey),
      validator: this._validator,
      amount: this._amount
    });

    return super.build();
  }
}

export class NativeUndelegateBuilder extends TransactionV1Builder<
  NativeUndelegateBuilder
> {
  private _validator!: CLValue;
  private _amount: CLValue = CLValueUInt512.newCLUInt512('0');

  constructor() {
    super();
    this._invocationTarget = new TransactionTarget({});
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.Undelegate
    );
  }

  public validator(publicKey: PublicKey): NativeUndelegateBuilder {
    this._validator = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  public amount(amount: BigNumber | string): NativeUndelegateBuilder {
    this._amount = CLValueUInt512.newCLUInt512(amount);
    return this;
  }

  public build(): TransactionV1 {
    if (!this._initiatorAddr.publicKey) {
      throw new Error('Initiator addr is not specified');
    }

    this._runtimeArgs = Args.fromMap({
      delegator: CLValue.newCLPublicKey(this._initiatorAddr.publicKey),
      validator: this._validator,
      amount: this._amount
    });

    return super.build();
  }
}

export class NativeRedelegateBuilder extends TransactionV1Builder<
  NativeRedelegateBuilder
> {
  private _validator!: CLValue;
  private _newValidator!: CLValue;
  private _amount: CLValue = CLValueUInt512.newCLUInt512('0');

  constructor() {
    super();
    this._invocationTarget = new TransactionTarget({});
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.Redelegate
    );
  }

  public validator(publicKey: PublicKey): NativeRedelegateBuilder {
    this._validator = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  public newValidator(publicKey: PublicKey): NativeRedelegateBuilder {
    this._newValidator = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  public amount(amount: BigNumber | string): NativeRedelegateBuilder {
    this._amount = CLValueUInt512.newCLUInt512(amount);
    return this;
  }

  public build(): TransactionV1 {
    if (!this._initiatorAddr.publicKey) {
      throw new Error('Initiator addr is not specified');
    }

    this._runtimeArgs = Args.fromMap({
      delegator: CLValue.newCLPublicKey(this._initiatorAddr.publicKey),
      validator: this._validator,
      amount: this._amount,
      new_validator: this._newValidator
    });

    return super.build();
  }
}

export class NativeActivateBidBuilder extends TransactionV1Builder<
  NativeActivateBidBuilder
> {
  private _validator!: CLValue;

  constructor() {
    super();
    this._invocationTarget = new TransactionTarget({}); // Native
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.ActivateBid
    );
  }

  public validator(publicKey: PublicKey): NativeActivateBidBuilder {
    this._validator = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  public build(): TransactionV1 {
    this._runtimeArgs = Args.fromMap({
      validator: this._validator
    });

    return super.build();
  }
}

export class NativeChangeBidPublicKeyBuilder extends TransactionV1Builder<
  NativeChangeBidPublicKeyBuilder
> {
  private _public_key!: CLValue;
  private _new_public_key!: CLValue;

  constructor() {
    super();
    this._invocationTarget = new TransactionTarget({});
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.ChangeBidPublicKey
    );
  }

  public previousPublicKey(
    publicKey: PublicKey
  ): NativeChangeBidPublicKeyBuilder {
    this._public_key = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  public newPublicKey(publicKey: PublicKey): NativeChangeBidPublicKeyBuilder {
    this._new_public_key = CLValue.newCLPublicKey(publicKey);
    return this;
  }

  public build(): TransactionV1 {
    this._runtimeArgs = Args.fromMap({
      public_key: this._public_key,
      new_public_key: this._new_public_key
    });

    return super.build();
  }
}

export class ContractCallBuilder extends TransactionV1Builder<
  ContractCallBuilder
> {
  constructor() {
    super();
  }

  public byHash(contractHash: string): ContractCallBuilder {
    const invocationTarget = new TransactionInvocationTarget();
    invocationTarget.byHash = Hash.fromHex(contractHash);

    const storedTarget = new StoredTarget();
    storedTarget.id = invocationTarget;
    storedTarget.runtime = TransactionRuntime.vmCasperV1();

    this._invocationTarget = new TransactionTarget(undefined, storedTarget);
    return this;
  }

  public byName(name: string): ContractCallBuilder {
    const invocationTarget = new TransactionInvocationTarget();
    invocationTarget.byName = name;

    const storedTarget = new StoredTarget();
    storedTarget.id = invocationTarget;
    storedTarget.runtime = TransactionRuntime.vmCasperV1();

    this._invocationTarget = new TransactionTarget(undefined, storedTarget);
    return this;
  }

  public byPackageHash(
    contractHash: string,
    version?: number
  ): ContractCallBuilder {
    const packageHashInvocationTarget = new ByPackageHashInvocationTarget();
    packageHashInvocationTarget.addr = Hash.fromHex(contractHash);
    packageHashInvocationTarget.version = version;
    const transactionInvocationTarget = new TransactionInvocationTarget();
    transactionInvocationTarget.byPackageHash = packageHashInvocationTarget;

    const storedTarget = new StoredTarget();

    storedTarget.id = transactionInvocationTarget;
    storedTarget.runtime = TransactionRuntime.vmCasperV1();

    this._invocationTarget = new TransactionTarget(undefined, storedTarget);
    return this;
  }

  public byPackageName(name: string, version?: number): ContractCallBuilder {
    const packageNameInvocationTarget = new ByPackageNameInvocationTarget();
    packageNameInvocationTarget.name = name;
    packageNameInvocationTarget.version = version;
    const transactionInvocationTarget = new TransactionInvocationTarget();
    transactionInvocationTarget.byPackageName = packageNameInvocationTarget;

    const storedTarget = new StoredTarget();

    storedTarget.id = transactionInvocationTarget;
    storedTarget.runtime = TransactionRuntime.vmCasperV1();

    this._invocationTarget = new TransactionTarget(undefined, storedTarget);

    return this;
  }

  public entryPoint(name: string): ContractCallBuilder {
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.Custom,
      name
    );
    return this;
  }

  public runtimeArgs(args: Args): ContractCallBuilder {
    this._runtimeArgs = args;
    return this;
  }
}

export class SessionBuilder extends TransactionV1Builder<SessionBuilder> {
  private _isInstallOrUpgrade = false;

  constructor() {
    super();
    this._entryPoint = new TransactionEntryPoint(
      TransactionEntryPointEnum.Call
    );
  }

  public wasm(wasmBytes: Uint8Array): SessionBuilder {
    const sessionTarget = new SessionTarget();
    sessionTarget.moduleBytes = wasmBytes;
    sessionTarget.isInstallUpgrade = this._isInstallOrUpgrade;
    sessionTarget.runtime = TransactionRuntime.vmCasperV1();

    this._invocationTarget = new TransactionTarget(
      undefined,
      undefined,
      sessionTarget
    );

    return this;
  }

  public installOrUpgrade(): SessionBuilder {
    this._isInstallOrUpgrade = true;
    if (this._invocationTarget?.session) {
      this._invocationTarget.session.isInstallUpgrade = true;
    }
    return this;
  }

  public runtimeArgs(args: Args): SessionBuilder {
    this._runtimeArgs = args;
    return this;
  }
}
