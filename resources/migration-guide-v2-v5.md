# V2 to V5 Migration Guide

`Casper JS SDK V5` introduces significant **breaking changes**, essentially rewriting the SDK from the ground up to enhance usability, align it with Casper SDKs in other languages, and incorporate new features for the Casper 2.0 (Condor) update.

This guide will walk you through the key changes and provide detailed examples to help you transition your code seamlessly.

---

## Key Highlights of the Migration

1. Simplified APIs and modular design.
2. Improved alignment with Casper SDKs in other languages.
3. Enhanced functionality for Casper 2.0.
4. Transition from deploy-based operations to transaction-based architecture.

---

## Changes and Migration Steps

### 1. **`CasperServiceByJsonRPC` and `CasperClient` Replaced with `RpcClient`**

#### Overview

- The `CasperServiceByJsonRPC` and `CasperClient` classes have been **removed**.
- Introduced the new `RpcClient` class as their replacement.

#### Migration Example

##### Old Syntax (2.x)

```typescript
const client = new CasperServiceByJsonRPC(
  'http://<Node Address>:7777/rpc'
);
const stateRootHash = await client.getStateRootHash();
```

##### New Syntax (5.x)

```typescript
import { HttpHandler, RpcClient } from 'casper-js-sdk';

const rpcHandler = new HttpHandler('http://<Node Address>:7777/rpc');
const rpcClient = new RpcClient(rpcHandler);

try {
  const stateRootHash = await rpcClient.getLatestBlock();
  console.log(stateRootHash);
} catch (error) {
  console.error(error);
}
```

For details on `RpcClient` methods, refer to the [documentation](https://github.com/casper-ecosystem/casper-js-sdk/blob/feat-5.0.0/src/rpc/README.md).

---

### 2. **`CLValueBuilder` Replaced by `CLValue` Constructors**

#### Overview

- The `CLValueBuilder` class has been **removed**.
- Use `CLValue` constructors like `newCL..` methods.

#### Migration Example

##### Old Syntax (2.x)

```typescript
const list = CLValueBuilder.list([
  CLValueBuilder.u32(1),
  CLValueBuilder.u32(2),
  CLValueBuilder.u32(3)
]);
const bool = CLValueBuilder.bool(false);
```

##### New Syntax (5.x)

```typescript
import {
  CLValueList,
  CLValueUInt32,
  CLValueBool
} from 'casper-js-sdk';

const list = CLValueList.newCLList(CLTypeUInt32, [
  CLValueUInt32.newCLUInt32(1),
  CLValueUInt32.newCLUInt32(2),
  CLValueUInt32.newCLUInt32(3)
]);
const bool = CLValueBool.newCLValueBool(false);
```

More examples are available in the [unit tests](https://github.com/casper-ecosystem/casper-js-sdk/tree/feat-5.0.0/src/types/clvalue).

---

### 3. **`CLPublicKey` Renamed to `PublicKey`**

#### Overview

- `CLPublicKey` is now `PublicKey` with added features for better cryptographic key management.

#### Migration Example

```typescript
import { Args, CLValue, PublicKey } from 'casper-js-sdk';

const args = Args.fromMap({
  target: CLValue.newCLPublicKey(PublicKey.fromHex('0202f5a92ab6...'))
});
```

Detailed documentation is available [here](https://github.com/casper-ecosystem/casper-js-sdk/blob/feat-5.0.0/src/types/keypair/PublicKey.ts).

---

### 4. **Changes to Deploy Management**

#### Overview

- The `DeployUtil` module is now replaced by the `Deploy` class with static methods.
- Serialization/deserialization now uses `TypedJSON`.

#### Migration Example

##### Old Syntax (2.x)

```typescript
const deploy = DeployUtil.makeDeploy(deployHeader, payment, session);
DeployUtil.signDeploy(deploy, keyPair);
```

##### New Syntax (5.x)

```typescript
import { Deploy } from 'casper-js-sdk';

const deploy = Deploy.makeDeploy(deployHeader, payment, session);
deploy.sign(privateKey);
```

For details, refer to the [Deploy class documentation](https://github.com/casper-ecosystem/casper-js-sdk/blob/feat-5.0.0/src/types/Deploy.ts).

---

### 5. **Key Management Overhaul**

#### Overview

- The `Keys` class from the old SDK (located in src/lib/Keys.ts) has been replaced with separate classes for `PublicKey` and `PrivateKey`, each based on the specific cryptographic algorithm.
- These new classes are located in the [keypair folder](https://github.com/casper-ecosystem/casper-js-sdk/tree/feat-5.0.0/src/types/keypair).
- AsymmetricKey was splitted into to classes [PrivateKey](../src/types/keypair/PrivateKey.ts) and [PublicKey](../src/types/keypair/PublicKey.ts).

#### Key Differences

1. **Structure**:
   - Old Keys class included functionality for both public and private keys in a single class.
   - New structure separates concerns into distinct PublicKey and PrivateKey classes.
2. **Enhanced Features**:
   - The new classes provide extended functionality and better alignment with modern cryptographic standards.
   - Includes support for additional key generation, validation, and serialization methods.

#### Migration Example

#### Old Syntax (2.x):

```tsx
import { Keys } from 'casper-js-sdk';

const keyPair = Keys.Ed25519.new();
const publicKey = keyPair.publicKey.toHex();
const privateKey = keyPair.privateKey;
```

#### New Syntax (5.x):

```tsx
import { PublicKey, PrivateKey, KeyAlgorithm } from 'casper-js-sdk';

// Generating a new key pair
const keys = await PrivateKey.generate(KeyAlgorithm.ED25519);
const publicKey = keys.publicKey.toHex();

// Serialization
console.log('Public Key (Hex):', publicKey.toHex());
console.log('Private Key (PEM):', privateKey.toPem());
```

Refer to the [keypair folder](https://github.com/casper-ecosystem/casper-js-sdk/tree/feat-5.0.0/src/types/keypair) for detailed implementation and examples.

---

### 6. **`PurseIdentifier` Enum Replaced with a Class**

### Changes

- The PurseIdentifier enum has been replaced by a class with the same name, offering more flexibility and functionality.
- The new class is located in the [request.ts](https://github.com/casper-ecosystem/casper-js-sdk/blob/feat-5.0.0/src/rpc/request.ts#L542) file.

#### Migration Example

#### Old Syntax (2.x):

```tsx
import { PurseIdentifier } from 'casper-js-sdk';

const balanceByPublicKey = await client.queryBalance(
  PurseIdentifier.MainPurseUnderPublicKey,
  privateKey.publicKey.toHex(false)
);

const balanceByAccountHash = await client.queryBalance(
  PurseIdentifier.MainPurseUnderAccountHash,
  privateKey.publicKey.toAccountHashStr()
);
```

#### New Syntax (5.x):

```tsx
import {
  PurseIdentifier,
  RpcClient,
  HttpHandler
} from 'casper-js-sdk';

const rpcHandler = new HttpHandler('http://<Node Address>:7777/rpc');
const rpcClient = new RpcClient(rpcHandler);

try {
  const balanceByPublicKey = await rpcClient.queryLatestBalance(
    PurseIdentifier.fromPublicKey(privateKey.publicKey.toHex(false))
  );

  const balanceByAccountHash = await rpcClient.queryLatestBalance(
    PurseIdentifier.fromAccountHash(
      privateKey.publicKey.accountHash()
    )
  );
} catch (e) {}
```

Explore the new PurseIdentifier class [here](https://github.com/casper-ecosystem/casper-js-sdk/blob/feat-5.0.0/src/rpc/request.ts#L542).

---

### 7. **`DeployUtil` to `Deploy`**

The `DeployUtil` module in the previous versions of casper-js-sdk has been replaced with the `Deploy` class in version 5.x. Functionality for deploy creation `DeployUtil` become [Deploy](../src/types/Deploy.ts) class with static methods. [See how to create Deploy here](../README.md#creating-a-legacy-deploy-1)

### Key Differences

1. **Module Structure**:
   - The old DeployUtil module had multiple static utility methods.
   - The new Deploy class organizes these functionalities as methods on a single object.
2. **Serialization and Deserialization**:
   - The new module uses TypedJSON for serialization/deserialization, ensuring type safety.
3. **Improved Method Organization**:
   - Methods are grouped logically, providing a cleaner and more intuitive API.

### Additional Notes

- The new Deploy class provides a more type-safe and modular approach, reducing errors and improving code readability.
- Refer to the [Deploy Class Documentation](https://github.com/casper-ecosystem/casper-js-sdk/blob/feat-5.0.0/src/types/Deploy.ts) for a complete list of available methods.
- Ensure that you update your dependencies and verify compatibility with the 5.x SDK before migrating.

---

### 8. **`Contracts` Abstraction Removed**

In the newer version of `casper-js-sdk`, we’ve removed the abstraction previously used for interacting with smart contracts. To provide greater flexibility and clarity, we have introduced two distinct classes: `ContractHash` and `ContractPackageHash`. These allow developers to directly install and call smart contracts with greater control. Below are two popular examples to help you transition smoothly:

**Example 1: Installing a Smart Contract on the Casper Network.**

This example demonstrates how to install a new smart contract using the new SDK structure. You can now directly work with `ExecutableDeployItem.newModuleBytes()` to include your `.wasm` file and deployment arguments.

```tsx
import {
  PrivateKey,
  PublicKey,
  Args,
  DeployHeader,
  ExecutableDeployItem,
  Deploy,
  DEFAULT_DEPLOY_TTL,
  StoredContractByHash,
  ContractHash
} from 'casper-js-sdk';

// Install a smart contract on a Casper Network
export const install = (
  wasm: Uint8Array,
  args: Args,
  paymentAmount: string,
  sender: PublicKey,
  chainName: string,
  signingKey: PrivateKey
): Deploy => {
  const deployHeader = DeployHeader.default();
  deployHeader.account = sender;
  deployHeader.chainName = chainName;

  const payment = ExecutableDeployItem.standardPayment(paymentAmount);
  const deploy = Deploy.makeDeploy(
    deployHeader,
    payment,
    ExecutableDeployItem.newModuleBytes(wasm, args)
  );
  const signedDeploy = deploy.sign(signingKeys);

  return signedDeploy;
};
```

**Example 2: Calling a Smart Contract Entrypoint.**

In this example, you can see how to call an entrypoint of a smart contract using the new `ContractHash` class. This approach removes the dependency on previous abstractions, making your code easier to manage and more explicit.

Key Changes

- Removed Abstraction: The Contracts abstraction has been replaced with the explicit use of ContractHash and ContractPackageHash.
- Direct Control: Developers now have full control over contract installation and entry point calls.
- Improved Clarity: The separation of logic enhances readability and reduces confusion.

```tsx
import {
  PrivateKey,
  PublicKey,
  Args,
  DeployHeader,
  ExecutableDeployItem,
  Deploy,
  DEFAULT_DEPLOY_TTL,
  StoredContractByHash,
  ContractHash
} from 'casper-js-sdk';

// Call an entrypoint of a smart contract.
export const callEntrypoint = (
  entryPoint: string,
  args: Args,
  sender: PublicKey,
  chainName: string,
  paymentAmount: string,
  signingKeys: PrivateKey,
  ttl: number = DEFAULT_DEPLOY_TTL
): Deploy => {
  const deployHeader = DeployHeader.default();
  deployHeader.account = sender;
  deployHeader.chainName = chainName;
  deployHeader.ttl = ttl;
  deployHeader.gasPrice = 1;

  const session = new ExecutableDeployItem();
  session.storedContractByHash = new StoredContractByHash(
    ContractHash.newContract(
      '93d923e336b20a4c4ca14d592b60e5bd3fe330775618290104f9beb326db7ae2'
    ),
    entryPoint,
    args
  );

  const payment = ExecutableDeployItem.standardPayment(paymentAmount);
  const deploy = Deploy.makeDeploy(deployHeader, payment, session);
  const signedDeploy = deploy.sign(signingKeys);

  return signedDeploy;
};
```

---

### 9. **Introduction of Casper 2.0 Transactions**

#### Overview

Casper 2.0 replaces deploys with a robust transaction-based system. Key components include:

- `TransactionEntryPoint`
- `TransactionTarget`
- `TransactionScheduling`
- `PricingMode`

Refer to the [full guide](./casper-2.0.md) for detailed examples and explanations.

---

### 10. **Miscellaneous Changes**

- `EventStream` become [SseClient](../src/sse/client.ts). The `SseClient` is the main place to interact with Casper events. [See more details here](../src/sse/README.md)
- `RuntimeArgs` become [Args](../src/types/Args.ts)
- `CasperHDKey`now deprecated and out of scope of this lib. You can use `@scure/bip39` lib to achieve same result as in previous SKD version.
- Injected `CasperWallet` provider now out of scope of this lib.
- Most classes that previously was in `src/lib` folder was redesigned and you can find them in `src/types` folder

---

For any issues, feel free to open a discussion or create a ticket in the [repository](https://github.com/casper-ecosystem/casper-js-sdk/issues).

---
