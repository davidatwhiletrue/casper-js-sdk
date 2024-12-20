# TransactionV1 Builders

TransactionBuilder contains classes and methods for building and managing Casper blockchain transactions. The provided classes extend the `TransactionV1Builder` base class to create specific types of transactions, such as transfers, bids, delegations, and contract calls.

## Table of Contents

- [Overview](#overview)
- [Classes](#classes)
  - [TransactionV1Builder](#transactionv1builder)
  - [NativeTransferBuilder](#nativetransferbuilder)
  - [NativeAddBidBuilder](#nativeaddbidbuilder)
  - [NativeWithdrawBidBuilder](#nativewithdrawbidbuilder)
  - [NativeDelegateBuilder](#nativedelegatebuilder)
  - [NativeUndelegateBuilder](#nativeundelegatebuilder)
  - [NativeRedelegateBuilder](#nativeredelegatebuilder)
  - [NativeActivateBidBuilder](#nativeactivatebidbuilder)
  - [NativeChangeBidPublicKeyBuilder](#nativechangebidpublickeybuilder)
  - [ContractCallBuilder](#contractcallbuilder)
  - [SessionBuilder](#sessionbuilder)

## Overview

The provided classes allow developers to build, customize, and execute transactions on the Casper blockchain. By using builder patterns, developers can chain methods to configure each aspect of the transaction before calling `build()` to create the final `TransactionV1` instance.

## Classes

### TransactionV1Builder

The abstract base class for all transaction builders. This class provides common methods for setting basic transaction parameters such as:

- `from(publicKey: PublicKey)`: Sets the initiator of the transaction.
- `chainName(chainName: string)`: Sets the name of the target blockchain.
- `timestamp(timestamp: Timestamp)`: Sets the timestamp for the transaction.
- `ttl(ttl: number)`: Sets the transaction's time-to-live (TTL).
- `payment(paymentAmount: number)`: Sets the payment details.

### NativeTransferBuilder

Used to create native transfers on the Casper blockchain.

#### Key Methods:

- `target(publicKey: PublicKey)`: Sets the transfer target using a public key.
- `targetAccountHash(accountHashKey: AccountHash)`: Sets the transfer target using an account hash.
- `amount(amount: BigNumber | string)`: Sets the amount to be transferred.
- `id(id: number)`: Sets the optional ID for the transfer.

### NativeAddBidBuilder

Used to create an add-bid transaction.

#### Key Methods:

- `validator(publicKey: PublicKey)`: Sets the validator's public key.
- `amount(amount: BigNumber | string)`: Sets the bid amount.
- `delegationRate(delegationRate: number)`: Sets the delegation rate.
- `minimumDelegationAmount(amount: BigNumberish)`: Sets the minimum delegation amount.
- `maximumDelegationAmount(amount: BigNumberish)`: Sets the maximum delegation amount.

### NativeWithdrawBidBuilder

Used to create a withdraw-bid transaction.

#### Key Methods:

- `validator(publicKey: PublicKey)`: Sets the validator's public key.
- `amount(amount: BigNumber | string)`: Sets the amount to be withdrawn.

### NativeDelegateBuilder

Used to create a delegate transaction.

#### Key Methods:

- `validator(publicKey: PublicKey)`: Sets the validator's public key.
- `amount(amount: BigNumber | string)`: Sets the delegation amount.

### NativeUndelegateBuilder

Used to create an undelegate transaction.

#### Key Methods:

- `validator(publicKey: PublicKey)`: Sets the validator's public key.
- `amount(amount: BigNumber | string)`: Sets the amount to be undelegated.

### NativeRedelegateBuilder

Used to create a redelegate transaction.

#### Key Methods:

- `validator(publicKey: PublicKey)`: Sets the validator's public key.
- `newValidator(publicKey: PublicKey)`: Sets the new validator's public key.
- `amount(amount: BigNumber | string)`: Sets the redelegation amount.

### NativeActivateBidBuilder

Used to create an activate-bid transaction.

#### Key Methods:

- `validator(publicKey: PublicKey)`: Sets the validator's public key.

### NativeChangeBidPublicKeyBuilder

Used to change the public key for an existing bid.

#### Key Methods:

- `previousPublicKey(publicKey: PublicKey)`: Sets the previous public key.
- `newPublicKey(publicKey: PublicKey)`: Sets the new public key.

### ContractCallBuilder

Used to create and call stored contracts.

#### Key Methods:

- `byHash(contractHash: string)`: Calls a contract by its hash.
- `byName(name: string)`: Calls a contract by its name.
- `byPackageHash(contractHash: string, version?: number)`: Calls a contract within a package by its hash.
- `byPackageName(name: string, version?: number)`: Calls a contract within a package by its name.
- `entryPoint(name: string)`: Sets the entry point for the contract call.
- `runtimeArgs(args: Args)`: Sets the runtime arguments for the contract call.

### SessionBuilder

Used to create session transactions.

#### Key Methods:

- `wasm(wasmBytes: Uint8Array)`: Sets the session WebAssembly (WASM) module.
- `installOrUpgrade()`: Sets the transaction as an install or upgrade.
- `runtimeArgs(args: Args)`: Sets the runtime arguments for the session.

## Usage Example

```typescript
import { PublicKey, Args, PrivateKey } from 'casper-js-sdk';

const sender = await PrivateKey.generate(KeyAlgorithm.ED25519);

// Create a simple native transfer
const transactionV1 = new NativeTransferBuilder()
  .from(sender.publicKey)
  .target(PublicKey.fromHex('abcdef0123456789'))
  .amount('25000000000') // Amount in motes
  .id(Date.now())
  .chainName('casper-net-1')
  .payment(100_000_000)
  .build();

await transactionV1.sign(sender);

// Create a contract call
const transactionV1ContractCall = new ContractCallBuilder()
  .from(sender.publicKey)
  .byHash('example_contract')
  .entryPoint('unstake')
  .runtimeArgs(Args.fromMap({ key: 'value' }))
  .payment(3_000000000) // Amount in motes
  .chainName('casper-net-1')
  .build();

await transactionV1ContractCall.sign(sender);
```
