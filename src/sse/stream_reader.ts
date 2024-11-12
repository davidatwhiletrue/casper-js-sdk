import { Readable } from 'stream';

const DefaultBufferSize = 4096;

export class EventStreamReader {
  private scanner: AsyncIterableIterator<Uint8Array> | undefined;
  private maxBufferSize: number;

  constructor(maxBufferSize = DefaultBufferSize) {
    this.maxBufferSize = maxBufferSize;
  }

  registerStream(eventStream: Readable) {
    this.scanner = this.createScanner(eventStream);
  }

  private async *createScanner(
    eventStream: Readable
  ): AsyncIterableIterator<Uint8Array> {
    let buffer = new Uint8Array(0);
    const reader = eventStream[Symbol.asyncIterator]();

    while (true) {
      const { value, done } = await reader.next();
      if (done) break;

      // Concatenate new data to buffer using typed array allocation
      const tempBuffer = new Uint8Array(buffer.length + value.length);
      tempBuffer.set(buffer, 0);
      tempBuffer.set(value, buffer.length);
      buffer = tempBuffer;

      // Enforce max buffer size limit
      if (buffer.length > this.maxBufferSize) {
        buffer = buffer.slice(-this.maxBufferSize);
      }

      let splitIndex: number;
      let delimiterLength: number;

      // Process each complete section separated by double newlines
      while (
        (([splitIndex, delimiterLength] = containsDoubleNewline(buffer)),
        splitIndex >= 0)
      ) {
        yield buffer.slice(0, splitIndex);
        buffer = buffer.slice(splitIndex + delimiterLength);
      }
    }

    // Yield remaining buffer if any data remains
    if (buffer.length > 0) yield buffer;
  }

  async readEvent(): Promise<Uint8Array | null> {
    if (this.scanner) {
      const result = await this.scanner.next();
      return result.done ? null : result.value;
    }
    return null;
  }
}

function containsDoubleNewline(data: Uint8Array): [number, number] {
  const crcr = indexOfSequence(data, new Uint8Array([13, 13]));
  const lflf = indexOfSequence(data, new Uint8Array([10, 10]));
  const crlflf = indexOfSequence(data, new Uint8Array([13, 10, 10]));
  const lfcrlf = indexOfSequence(data, new Uint8Array([10, 13, 10]));
  const crlfcrlf = indexOfSequence(data, new Uint8Array([13, 10, 13, 10]));

  const minPos = minPosInt(
    crcr,
    minPosInt(lflf, minPosInt(crlflf, minPosInt(lfcrlf, crlfcrlf)))
  );

  let nlen = 2;
  if (minPos === crlfcrlf) {
    nlen = 4;
  } else if (minPos === crlflf || minPos === lfcrlf) {
    nlen = 3;
  }
  return [minPos, nlen];
}

function indexOfSequence(data: Uint8Array, sequence: Uint8Array): number {
  for (let i = 0; i <= data.length - sequence.length; i++) {
    let found = true;
    for (let j = 0; j < sequence.length; j++) {
      if (data[i + j] !== sequence[j]) {
        found = false;
        break;
      }
    }
    if (found) return i;
  }
  return -1;
}

function minPosInt(a: number, b: number): number {
  if (a < 0) return b;
  if (b < 0) return a;
  return Math.min(a, b);
}
