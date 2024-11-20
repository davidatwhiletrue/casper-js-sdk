# SSE client

Provide basic functionality to work with Casper events that streamed by SSE server. It connects to the server and collect events, from other side consumers obtain this stream and delegate the process to specific handlers.

## Usage

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

## Events List

- [ApiVersion](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/sse/event.ts#L138)
- [BlockAdded](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/sse/event.ts#L162)
- [DeployProcessed](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/sse/event.ts#L287)
- [DeployAccepted](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/sse/event.ts#L296)
- [DeployExpired](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/sse/event.ts#L313)
- [TransactionProcessed](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/sse/event.ts#L114)
- [TransactionAccepted](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/sse/event.ts#L328)
- [TransactionExpired](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/sse/event.ts#L382)
- [FinalitySignature](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/sse/event.ts#L674)
- [Step](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/sse/event.ts#L766)
- [Fault](https://github.com/casper-ecosystem/casper-js-sdk/blob/573b563d0bc038e46b07f12789286d336536f8c9/src/sse/event.ts#L748)

## Key components

- `SseClient` is a facade that provide convenient interface to process data stream, and unites `Streamer` and `Consumer` under implementation.
- `Streamer` fills the events' channel
  - `HttpConnection` establish, controls and watches connections, throw error (notify stream) if connection broken
  - `StreamReader` read bytes lines from the response stream, detect data messages and corespondent ID
  - `EventParser` parse event type from byte data, return event type and raw data
-
- `Consumer` read events stream and delegate to process each to the specific handler
- `Handler` accepts `RawEvent` for certain type, parse body, provide business logic
