import { AllEventsNames, EventType, RawEvent } from "./event";

export const ErrHandlerNotRegistered = new Error('handler is not registered');

export type HandlerFunc = (rawEvent: RawEvent) => Promise<void>;

export class Consumer {
  private handlers: Map<EventType, HandlerFunc>;

  constructor() {
    this.handlers = new Map<EventType, HandlerFunc>();
  }

  registerHandler(eventType: EventType, handler: HandlerFunc): void {
    this.handlers.set(eventType, handler);
  }

  async run(events: AsyncGenerator<RawEvent>, errCh: (error: Error) => void): Promise<void> {
    try {
      for await (const rawEvent of events) {
        const handler = this.handlers.get(rawEvent.eventType);

        if (!handler) {
          throw new Error(`${ErrHandlerNotRegistered.message}, type: ${AllEventsNames[rawEvent.eventType]}`);
        }

        try {
          await handler(rawEvent);
        } catch (err) {
          errCh(err);
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('events stream was closed');
    }
  }
}
