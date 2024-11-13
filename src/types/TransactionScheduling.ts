import { jsonObject, jsonMember } from 'typedjson';
import { concat } from '@ethersproject/bytes';

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
  @jsonMember({
    name: 'FutureTimestamp',
    constructor: Timestamp,
    deserializer: json => Timestamp.fromJSON(json),
    serializer: value => value.toJSON()
  })
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
    const tagBytes = Uint8Array.of(this.tag());

    if (this.futureEra) {
      const eraBytes = new CLValueUInt64(BigInt(this.futureEra.eraID)).bytes();
      return concat([tagBytes, eraBytes]);
    } else if (this.futureTimestamp) {
      const timestampBytes = new CLValueUInt64(
        BigInt(this.futureTimestamp.timestamp.toMilliseconds())
      ).bytes();
      return concat([tagBytes, timestampBytes]);
    }

    return tagBytes;
  }

  static fromJSON(json: any): TransactionScheduling {
    if (json === 'Standard') {
      return new TransactionScheduling({});
    }
    if (typeof json === 'object') {
      if ('FutureEra' in json) {
        return new TransactionScheduling(
          undefined,
          new FutureEraScheduling(json.FutureEra)
        );
      }
      if ('FutureTimestamp' in json) {
        return new TransactionScheduling(
          undefined,
          undefined,
          new FutureTimestampScheduling(json.FutureEra)
        );
      }
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
