import { AllEventsNames, EventType, RawEvent } from "./event";
import { ErrUnknownEventType } from "./errors";

const headerID = "id:";
const headerData = "data:";

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
        if (eventData) {
          eventData = new Uint8Array([...eventData, ...this.trimPrefix(headerData.length, line), '\n'.charCodeAt(0)]);
        } else {
          eventData = this.trimPrefix(headerData.length, line);
        }
      }
    }
    return this.parseEventType(eventID, eventData);
  }

  parseEventType(eventID: Uint8Array | undefined, eventData: Uint8Array | undefined): RawEvent | Error {
    if (!eventID || !eventData) {
      return new Error("Missing eventID or eventData");
    }

    let eventType: EventType | undefined;
    const trimmedData = this.trimPrefix("{\"".length, eventData);

    for (const [eType, typeName] of this.eventsToParse.entries()) {
      if (this.hasPrefix(trimmedData, typeName)) {
        eventType = eType;
        break;
      }
    }

    if (eventType === undefined) {
      return new ErrUnknownEventType(eventData);
    }

    if (eventType === EventType.APIVersionEventType) {
      return new RawEvent(eventType, eventData.toString(), Number(eventID.toString()));
    }

    const parsedID = parseInt(new TextDecoder().decode(eventID), 10);
    if (isNaN(parsedID)) {
      return new Error("Error parsing event id");
    }

    return new RawEvent(eventType, eventData.toString(), parsedID);
  }

  private hasPrefix(line: Uint8Array, prefix: string): boolean {
    return String.fromCharCode(...line.slice(0, prefix.length)) === prefix;
  }

  private splitData(data: Uint8Array | string): Uint8Array[] {
    const strData = typeof data === 'string' ? data : new TextDecoder().decode(data);
    return strData.split(/\r?\n/).map((line) => new TextEncoder().encode(line));
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

