import { concat } from '@ethersproject/bytes';

import { AllEventsNames, EventType, RawEvent } from './event';
import { ErrUnknownEventType } from './errors';

const headerID = 'id:';
const headerData = 'data:';

export class EventParser {
  private eventsToParse: Map<number, string> = new Map();

  constructor() {
    this.eventsToParse = new Map<EventType, string>();
  }

  registerEvent(eventType: EventType): void {
    const eventName = AllEventsNames[eventType];

    if (eventName) {
      this.eventsToParse.set(eventType, eventName);
    }
  }

  parseRawEvent(data: Uint8Array | string): RawEvent | Error {
    let eventID: Uint8Array | undefined;
    let eventData: Uint8Array | undefined;

    const lines = this.splitData(data);

    for (const line of lines) {
      if (this.hasPrefix(line, headerID)) {
        eventID = this.trimPrefix(headerID.length, line);
      } else if (this.hasPrefix(line, headerData)) {
        const lineData = this.trimPrefix(headerData.length, line);
        if (eventData) {
          eventData = concat([
            eventData,
            lineData,
            Uint8Array.of('\n'.charCodeAt(0))
          ]);
        } else {
          eventData = lineData;
        }
      }
    }

    return this.parseEventType(eventID, eventData);
  }

  parseEventType(
    eventID: Uint8Array | undefined,
    eventData: Uint8Array | undefined
  ): RawEvent | Error {
    if (!eventID || !eventData) {
      return new Error('Missing eventID or eventData');
    }

    let eventType: EventType | undefined;
    const trimmedData = this.trimPrefix('{"'.length, eventData);

    // Convert entries to an array to allow iteration in ES5
    const eventEntries = Array.from(this.eventsToParse.entries());

    for (let i = 0; i < eventEntries.length; i++) {
      const [eType, typeName] = eventEntries[i];
      if (this.hasPrefix(trimmedData, typeName)) {
        eventType = eType;
        break;
      }
    }

    if (eventType === undefined) {
      return new ErrUnknownEventType(eventData);
    }

    if (eventType === EventType.APIVersionEventType) {
      const idString = Buffer.from(eventID).toString();
      return new RawEvent(
        eventType,
        Buffer.from(eventData).toString(),
        Number(idString)
      );
    }

    const parsedID = parseInt(new TextDecoder().decode(eventID), 10);
    if (isNaN(parsedID)) {
      return new Error('Error parsing event id');
    }

    return new RawEvent(eventType, Buffer.from(eventData).toString(), parsedID);
  }

  private hasPrefix(line: Uint8Array, prefix: string): boolean {
    const lineString = Buffer.from(line.slice(0, prefix.length)).toString();
    return lineString === prefix;
  }

  private splitData(data: Uint8Array | string): Uint8Array[] {
    const strData =
      typeof data === 'string' ? data : new TextDecoder().decode(data);
    return strData.split(/\r?\n/).map(line => new TextEncoder().encode(line));
  }

  trimPrefix(size: number, data: Uint8Array): Uint8Array {
    if (!data || data.length < size) {
      return data;
    }

    data = data.slice(size);

    if (data.length > 0 && data[0] === 32) {
      data = data.slice(1);
    }

    if (data.length > 0 && data[data.length - 1] === 10) {
      data = data.slice(0, data.length - 1);
    }

    return data;
  }
}
