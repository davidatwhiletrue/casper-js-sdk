# Casper JS SDK

The Casper JS SDK provides a convenient way to interact with the Casper Network using JavaScript.

## Get started

```bash
# Basic Node.JS installation
npm install casper-js-sdk --save
```

## Base usage

### RPC client

Provides access to the exported methods of RPC Client and data structures where the response is serialized. [See more details here](src/rpc/README.md)

Example:

```ts
import { HttpHandler, RpcClient } from 'casper-js-sdk';

const rpcHandler = new HttpHandler('http://<Node Address>:7777/rpc');
const rpcCient = new RpcClient(rpcHandler);
const deployHash =
  '3facbc4133e722c5c5630b6ad2331383ba849ef719da582cc026e9dd85e72ac9';

try {
  const deployResult = await rpcCient.getDeploy(deployHash);
} catch (e) {}
```

### SSE

Provides basic functionality to work with Casper events that streamed by SSE server. [See more details here](src/sse/README.md)

Example:

```ts
import { SseClient, EventType } from 'casper-js-sdk';

const sseClient = new SseClient(
  'http://<Node Address>:9999/events/main'
);
sseClient.registerHandler(
  EventType.DeployProcessedEventType,
  async rawEvent => {
    try {
      const deployEvent = rawEvent.parseAsDeployProcessedEvent();
      console.log(
        `Deploy hash: ${deployEvent.deployProcessed.deployHash}`
      );
    } catch (error) {
      console.error('Error processing event:', error);
    }
  }
);

// Start the client with the last known event ID
const lastEventID = 1234;

sseClient.start(lastEventID).catch(error => {
  console.error('Error starting SSE client:', error);
});
```

### Creating a legacy deploy

Example of how to construct a deploy and push it to the network:

```ts
import {
  Deploy,
  DeployHeader,
  ExecutableDeployItem,
  HttpHandler,
  PublicKey,
  RpcClient,
  TransferDeployItem
} from 'casper-js-sdk';
import { KeyAlgorithm } from 'casper-js-sdk/dist/types/keypair/Algorithm';
import { PrivateKey } from 'casper-js-sdk/dist/types/keypair/PrivateKey';

const rpcHandler = new HttpHandler('http://<Node Address>:7777/rpc');
const rpcClient = new RpcClient(rpcHandler);

const senderKey = await PrivateKey.generate(KeyAlgorithm.ED25519);
const recipientKey = PublicKey.fromHex(
  '010068920746ecf5870e18911EE1fC5db975E0e97fFFcBBF52f5045Ad6C9838D2F'
);
const paymentAmount = '10000000000000';
const transferAmount = '10';
const transferId = 35;

const session = new ExecutableDeployItem();

session.transfer = TransferDeployItem.newTransfer(
  transferAmount,
  recipientKey,
  undefined,
  transferId
);

const payment = ExecutableDeployItem.standardPayment(paymentAmount);

const deployHeader = DeployHeader.default();
deployHeader.account = senderKey.publicKey;
deployHeader.chainName = 'casper-test';

const deploy = Deploy.makeDeploy(deployHeader, payment, session);
await deploy.sign(senderKey);

const result = await rpcClient.putDeploy(deploy);

console.log(`Deploy Hash: ${result.deployHash}`);
```

## Migration guides

### v2 to v3

In progress...
