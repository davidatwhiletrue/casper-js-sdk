import { Consumer, HandlerFunc } from "./consumer";
import { Streamer } from "./streamer";
import { EventType, RawEvent } from "./event";

type Middleware = (handler: HandlerFunc) => HandlerFunc;

export class Client {
  private streamer: Streamer;
  private consumer: Consumer;

  private eventStream: RawEvent[] = [];
  private streamErrors: Error[] = [];
  private consumerErrors: Error[] = [];

  private streamErrorHandler: (errors: Error[]) => void;
  private consumerErrorHandler: (errors: Error[]) => void;
  private middlewares: Middleware[] = [];
  private workersCount: number;

  constructor(url: string, workersCount = 1) {
    this.streamer = Streamer.defaultStreamer(url);
    this.consumer = new Consumer();
    this.eventStream = [];
    this.streamErrors = [];
    this.consumerErrors = [];
    this.streamErrorHandler = this.logErrors;
    this.consumerErrorHandler = this.logErrors;
    this.workersCount = workersCount;
  }

  async start(lastEventID: number): Promise<void> {
    const tasks: Promise<void>[] = [];

    tasks.push(this.streamer.fillStream(lastEventID, arrayToAsyncIterable(this.eventStream), (err) => this.streamErrorHandler([err])));

    for (let i = 0; i < this.workersCount; i++) {
      tasks.push(this.consumer.run(arrayToAsyncIterable(this.eventStream), (err) => this.streamErrorHandler([err])));
    }

    this.streamErrorHandler(this.streamErrors);
    this.consumerErrorHandler(this.consumerErrors);

    await Promise.all(tasks);
  }

  registerMiddleware(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  registerHandler(eventType: EventType, handler: HandlerFunc) {
    this.streamer.registerEvent(eventType);

    for (let i = this.middlewares.length - 1; i >= 0; i--) {
      handler = this.middlewares[i](handler);
    }

    this.consumer.registerHandler(eventType, handler);
  }

  private logErrors(source: Error[]): void {
    source.forEach((err) => {
      console.error(err);
    });
  }

  stop(): void {
    this.eventStream = [];
    this.streamErrors = [];
    this.consumerErrors = [];
  }
}

async function* arrayToAsyncIterable(events: RawEvent[]): AsyncGenerator<RawEvent> {
  for (const event of events) {
    yield event;
  }
}
