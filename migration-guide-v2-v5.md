# V2 to V5 Migration Guide

`Casper JS SDK V5` makes many **breaking changes** to the SDK behavior, effectively rewriting it from scratch.

The purpose of these changes is to improve and simplify the SDK, as well as to bring the Casper JS SDK to the same look and behavior as the Casper SDK in other languages.

Also added new functionality to work with the Casper 2.0 (Condor) update

## Changes

- `CasperServiceByJsonRPC` and `CasperClient` become [RpcClient](./src/rpc/rpc_client.ts). The `RpcClient` is much broader in functionality and is the main place to interact with the rpc. [See more details here](src/rpc/README.md)
- `EventStream` become [SseClient](./src/sse/client.ts). The `SseClient` is the main place to interact with Casper events. [See more details here](src/sse/README.md)
- `AsymmetricKey` was splitted into to classes [PrivateKey](./src/types/keypair/PrivateKey.ts)` and [PublicKey](./src/types/keypair/PublicKey.ts).
- `CLPublicKey` become [PublicKey](./src/types/keypair/PublicKey.ts).
- `RuntimeArgs` become [Args](./src/types/Args.ts)
- Most classes that previously was in `src/lib` folder was redesigned and you can find them in `src/types` folder
- Functionality for deploy creation `DeployUtil` become [Deploy](./src/types/Deploy.ts) class with static methods. [See how to create Deploy here](./README.md#creating-a-legacy-deploy-1)
- Instead of `CLValueBuilder` it's possible to use `CLValue` constructors. For example `CLValueBuilder.bool(false)` become `new CLValueBool(false)`
- `CasperHDKey`now deprecated and out of scope of this lib. You can use `@scure/bip39` lib to achieve same result as in previous SKD version.
- Injected `CasperWallet` provider now out of scope of this lib.

## Casper 2.0 (Condor)

### Overview

Casper 2.0 introduces a robust transaction system to replace deploys, simplifying blockchain interactions while enhancing flexibility, scalability, and extensibility. This SDK allows developers to create, configure, and manage transactions on the Casper blockchain seamlessly.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Core Components](#core-components)
   - [InitiatorAddr](#initiatoraddr)
   - [TransactionEntryPoint](#transactionentrypoint)
   - [TransactionTarget](#transactiontarget)
   - [TransactionScheduling](#transactionscheduling)
   - [PricingMode](#pricingmode)
3. [Creating a Transaction](#creating-a-transaction)
4. [Serialization and JSON Interoperability](#serialization-and-json-interoperability)
5. [Examples](#examples)
6. [Resources](#resources)

---

## Introduction

Casper 2.0 transitions from deploys to transactions, creating a more standardized approach to blockchain operations. Transactions are now encapsulated in a modular architecture, enabling simpler implementation and future expansion.

---

## Core Components

### 1. **InitiatorAddr**

Represents the address of the transaction initiator.

#### Example:

```typescript
const privateKey = await PrivateKey.generate(KeyAlgorithm.ED25519);
const initiatorAddr = new InitiatorAddr(privateKey.publicKey);
```

---

### 2. **TransactionEntryPoint**

Represents a transaction entry point, which defines an action to be executed within the system. All entry points defined in `TransactionEntryPointEnum`

#### Example:

```typescript
const entryPoint = new TransactionEntryPoint(
  TransactionEntryPointEnum.Transfer
);
```

---

### 3. **TransactionTarget**

Defines the transaction's target, which could be:

- **Native**: For simple transfers.
- **Stored**: For invoking stored contracts.
- **Session**: For session-specific logic.

#### Examples:

- **Native Target**:

```typescript
const nativeTarget = new TransactionTarget({});
```

- **Stored Contract Target**:

```typescript
const stored = new StoredTarget();
const invocationTarget = new TransactionInvocationTarget();
invocationTarget.byHash = new Hash(Uint8Array.from([])); // an example of hash
storedTarget.runtime = 'VmCasperV1'; // an example of runtime
storedTarget.id = invocationTarget;

const storedTransactionTarget = new TransactionTarget(
  undefined,
  stored
);
// OR
const storedTransactionTarget1 = new TransactionTarget();
storedTransactionTarget1.stored = stored;
```

- **Session Target**:

```typescript
const sessionTarget = new SessionTarget();
sessionTarget.moduleBytes = Uint8Array.from([]); // an example of module bytes
sessionTarget.runtime = 'VmCasperV1'; // an example of runtime
sessionTarget.transferredValue = 1000; // an example of transferredValue
sessionTarget.isInstallUpgrade = true; // an example of isInstallUpgrade
sessionTarget.seed = new Hash(Uint8Array.from([])); // an example of seed

const sessionTransactionTarget = new TransactionTarget(
  undefined,
  undefined,
  sessionTarget
);
// OR
const sessionTransactionTarget1 = new TransactionTarget();
sessionTransactionTarget1.session = sessionTarget;
```

---

### 4. **TransactionScheduling**

Configures when and how a transaction is executed, allowing for prioritization.

#### Examples:

- **Standard Scheduling**:

```typescript
const standardScheduling = new TransactionScheduling({});
```

---

### 5. **PricingMode**

Specifies how transaction fees are calculated. Supports three modes:

- **PaymentLimitedMode**: Classic pricing with limits.
- **FixedMode**: Uses fixed gas pricing with an optional computation factor.
- **PrepaidMode**: Receipt-based prepaid pricing.

#### Examples:

- **FixedMode**:

```typescript
const fixedMode = new FixedMode();
fixedMode.gasPriceTolerance = 2;
fixedMode.additionalComputationFactor = 1;
```

- **Assign Pricing Mode**:

```typescript
const pricingMode = new PricingMode();
pricingMode.fixed = fixedMode;
```

---

## Creating a Transaction

### Steps:

1. **Initialize the RPC Client**:

```typescript
const rpcHandler = new HttpHandler('http://<Node Address>:7777/rpc');
const rpcClient = new RpcClient(rpcHandler);
```

2. **Generate Keys**:

```typescript
const privateKey = await PrivateKey.generate(KeyAlgorithm.ED25519);
const publicKey = privateKey.publicKey;
```

3. **Define Runtime Arguments**:

```typescript
const args = Args.fromMap({
   target: CLValue.newCLPublicKey(
           PublicKey.fromHex('<Recipient Public Key>')
   ),
   amount: CLValueUInt512.newCLUInt512('2000000000') // 2 CSPR
});
```

4. **Configure Components**:

- **Target**:

```typescript
const transactionTarget = new TransactionTarget({}); // Native target;
```

- **Entry Point**:

```typescript
const entryPoint = new TransactionEntryPoint(
        TransactionEntryPointEnum.Transfer
);
```

- **Scheduling**:

```typescript
const scheduling = new TransactionScheduling({}); // Standard;
```

- **Pricing Mode**:

```typescript
const pricingMode = new PricingMode();
const paymentLimitedMode = new PaymentLimitedMode();
paymentLimitedMode.gasPriceTolerance = 1;
paymentLimitedMode.paymentAmount = paymentAmount;
paymentLimitedMode.standardPayment = true;

pricingMode.paymentLimited = paymentLimitedMode;
```

5. **Create and Sign Transaction**:

```typescript
const transactionPayload = TransactionV1Payload.build({
   initiatorAddr: new InitiatorAddr(publicKey),
   ttl: new Duration(1800000),
   args,
   timestamp: new Timestamp(new Date()),
   entryPoint,
   scheduling,
   transactionTarget,
   chainName: 'casper-net-1',
   pricingMode
});

const transaction = TransactionV1.makeTransactionV1(
        transactionPayload
);
await transaction.sign(privateKey);
```

6. **Submit Transaction**:

```typescript
const result = await rpcClient.putTransactionV1(transaction);
console.log(`Transaction Hash: ${result.transactionHash}`);
```
