import { jsonObject, jsonMember } from 'typedjson';
import { Timestamp } from './Time';
import { CLValueUInt64 } from './clvalue';

export enum TransactionSchedulingTag {
  Native = 0,
  FutureEra,
  FutureTimestamp
}

@jsonObject
class FutureEraScheduling {
  @jsonMember({ constructor: Number })
  eraID: number;

  constructor(eraID: number) {
    this.eraID = eraID;
  }
}

@jsonObject
class FutureTimestampScheduling {
  @jsonMember({ name: 'FutureTimestamp', constructor: Timestamp })
  timestamp: Timestamp;

  constructor(timestamp: Timestamp) {
    this.timestamp = timestamp;
  }
}

@jsonObject
export class TransactionScheduling {
  @jsonMember({ name: 'Standard', constructor: Object })
  standard?: object;

  @jsonMember({ name: 'FutureEra', constructor: FutureEraScheduling })
  futureEra?: FutureEraScheduling;

  @jsonMember({
    name: 'FutureTimestamp',
    constructor: FutureTimestampScheduling
  })
  futureTimestamp?: FutureTimestampScheduling;

  constructor(
    standard?: object,
    futureEra?: FutureEraScheduling,
    futureTimestamp?: FutureTimestampScheduling
  ) {
    this.standard = standard;
    this.futureEra = futureEra;
    this.futureTimestamp = futureTimestamp;
  }

  tag(): TransactionSchedulingTag {
    if (this.standard) return TransactionSchedulingTag.Native;
    if (this.futureEra) return TransactionSchedulingTag.FutureEra;
    if (this.futureTimestamp) return TransactionSchedulingTag.FutureTimestamp;
    return 0;
  }

  bytes(): Uint8Array {
    const result = [this.tag()];

    if (this.futureEra) {
      result.push(...new CLValueUInt64(BigInt(this.futureEra.eraID)).bytes());
    } else if (this.futureTimestamp) {
      const timestampBytes = new CLValueUInt64(
        BigInt(this.futureTimestamp.timestamp.toMilliseconds())
      ).bytes();
      result.push(...timestampBytes);
    }

    return new Uint8Array(result);
  }

  static fromJSON(json: string): TransactionScheduling {
    const parsed = JSON.parse(json);
    if (parsed === 'Standard') {
      return new TransactionScheduling({});
    }
    if (typeof parsed === 'object') {
      if ('FutureEra' in parsed) {
        return new TransactionScheduling(
          undefined,
          new FutureEraScheduling(parsed.FutureEra)
        );
      }
      if ('FutureTimestamp' in parsed) {
        return new TransactionScheduling(
          undefined,
          undefined,
          new FutureTimestampScheduling(parsed.FutureEra)
        );
      }
    }
    throw new Error('Invalid JSON format for TransactionScheduling');
  }

  fromJSON(json: string): TransactionScheduling {
    const data = JSON.parse(json);

    if (typeof data === 'object' && data !== null) {
      if ('FutureTimestamp' in data) {
        return new TransactionScheduling(
          undefined,
          undefined,
          new FutureTimestampScheduling(data.FutureTimestamp)
        );
      }

      if ('FutureEra' in data) {
        return new TransactionScheduling(
          undefined,
          new FutureEraScheduling(data.FutureEra)
        );
      }
    } else if (data === 'Standard') {
      return new TransactionScheduling({});
    }

    throw new Error('Invalid JSON format for TransactionScheduling');
  }

  toJSON(): unknown {
    if (this.standard) {
      return 'Standard';
    }
    if (this.futureTimestamp) {
      return {
        FutureTimestamp: this.futureTimestamp.timestamp.date.toISOString()
      };
    }
    if (this.futureEra) {
      return { FutureEra: this.futureEra.eraID };
    }
    throw new Error('Unknown scheduling type');
  }
}
