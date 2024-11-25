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

In progress...
