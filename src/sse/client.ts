import EventSource from 'eventsource';
import { Result, Ok, Err } from 'ts-results';

import { EventName, RawEvent } from './event';
import { EventParser } from './event_parser';

/**
 * Type definition for an event handler function.
 *
 * @param result - A RawEvent instance representing the event.
 */
export type EventHandlerFn = (result: RawEvent) => void;

/**
 * Interface representing an event subscription.
 */
export interface EventSubscription {
  /**
   * The name of the event to subscribe to.
   */
  eventName: EventName;
  /**
   * The event handler function to invoke when the event occurs.
   */
  eventHandlerFn: EventHandlerFn;
}

/**
 * Client for managing Server-Sent Events (SSE) connections.
 */
export class SseClient {
  private subscribedTo: EventSubscription[] = [];
  private eventSource?: EventSource;
  private parser: EventParser;

  /**
   * Creates an instance of SseClient.
   *
   * @param eventStreamUrl - The URL of the event stream.
   */
  constructor(private eventStreamUrl: string) {
    this.parser = new EventParser();
  }

  /**
   * Subscribes to a specified event.
   *
   * @param eventName - The name of the event to subscribe to.
   * @param eventHandlerFn - The function to handle the event when it occurs.
   * @returns A Result indicating success (Ok(true)) or failure (Err with an error message).
   */
  public subscribe(
    eventName: EventName,
    eventHandlerFn: EventHandlerFn
  ): Result<boolean, string> {
    if (this.subscribedTo.some(e => e.eventName === eventName)) {
      return Err('Already subscribed to this event');
    }
    this.subscribedTo.push({ eventName, eventHandlerFn });
    return Ok(true);
  }

  /**
   * Unsubscribes from a specified event.
   *
   * @param eventName - The name of the event to unsubscribe from.
   * @returns A Result indicating success (Ok(true)) or failure (Err with an error message).
   */
  public unsubscribe(eventName: EventName): Result<boolean, string> {
    if (!this.subscribedTo.some(e => e.eventName === eventName)) {
      return Err('Cannot find provided subscription');
    }
    this.subscribedTo = this.subscribedTo.filter(
      e => e.eventName !== eventName
    );
    return Ok(true);
  }

  /**
   * Processes incoming messages from the event source and dispatches them to the appropriate handlers.
   *
   * @param event - The message event containing the event data.
   */
  private runEventsLoop(event: MessageEvent<string>): void {
    this.subscribedTo.forEach(sub => {
      if (this.parser.shouldHandleEvent(event.data, sub.eventName)) {
        const rawEvent = this.parser.parseEvent(
          event.data,
          event.type,
          event.lastEventId
        );
        sub.eventHandlerFn(rawEvent);
      }
    });
  }

  /**
   * Starts the SSE connection.
   *
   * @param eventId - (Optional) The event ID to start streaming from.
   */
  public start(eventId?: number): void {
    const separator = this.eventStreamUrl.includes('?') ? '&' : '?';
    let requestUrl = `${this.eventStreamUrl}${separator}`;
    if (eventId !== undefined) {
      requestUrl += `start_from=${eventId}`;
    }
    this.eventSource = new EventSource(requestUrl);

    this.eventSource.onmessage = e => this.runEventsLoop(e);
    this.eventSource.onerror = err => {
      throw err;
    };
  }

  /**
   * Stops the SSE connection.
   */
  public stop(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}
