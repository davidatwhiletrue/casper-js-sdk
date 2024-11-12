import { EventType, RawEvent } from './event';
import { HttpConnection } from './http_connection';
import { EventStreamReader } from './stream_reader';
import { EventParser } from './event_parser';
import axios from 'axios';

const ErrFullStreamTimeoutError = new Error(
  "can't fill the stream because it is full"
);

export class Streamer {
  private connection: HttpConnection;
  private eventParser: EventParser;
  private streamReader: EventStreamReader;
  private blockedStreamLimit: number;

  constructor(
    connection: HttpConnection,
    streamReader: EventStreamReader,
    blockedStreamLimit: number
  ) {
    this.connection = connection;
    this.streamReader = streamReader;
    this.blockedStreamLimit = blockedStreamLimit;
    this.eventParser = new EventParser();
  }

  static defaultStreamer(url: string): Streamer {
    return new Streamer(
      new HttpConnection(axios.create(), url),
      new EventStreamReader(1024 * 1024 * 50),
      30000
    );
  }

  registerEvent(eventType: EventType) {
    this.eventParser.registerEvent(eventType);
  }

  async fillStream(
    lastEventID: number,
    stream: AsyncGenerator<RawEvent>,
    errorsCh: (err: Error) => void
  ): Promise<void> {
    const response = await this.connection.request(lastEventID);
    const reader = response?.data?.getReader();

    if (!reader) throw new Error('No reader from response');

    this.streamReader.registerStream(reader);

    try {
      for await (const eventBytes of this.eventGenerator()) {
        const eventStr = new TextDecoder().decode(eventBytes);

        if (eventStr === ':') {
          continue; // Skip empty events
        }

        try {
          const eventData = this.eventParser.parseRawEvent(eventBytes);

          if (eventData instanceof Error) {
            throw eventData;
          }

          await this.addData(stream, eventData);
        } catch (err) {
          errorsCh(err as Error);
        }
      }
    } finally {
      reader.cancel();
    }
  }

  private async addData(
    stream: AsyncGenerator<RawEvent>,
    data: RawEvent
  ): Promise<void> {
    const timeout = setTimeout(() => {
      throw ErrFullStreamTimeoutError;
    }, this.blockedStreamLimit);

    try {
      await stream.next(data);
    } finally {
      clearTimeout(timeout);
    }
  }

  private async *eventGenerator(): AsyncGenerator<Uint8Array> {
    let eventBytes: Uint8Array | null;
    while ((eventBytes = await this.streamReader.readEvent()) !== null) {
      yield eventBytes;
    }
  }
}
