import { jsonObject, jsonMember } from 'typedjson';

@jsonObject
export class Timestamp {
  @jsonMember({ constructor: Date })
  date: Date;

  constructor(date: Date) {
    this.date = date;
  }

  toMilliseconds(): number {
    //unixMilli
    return this.date.getTime();
  }

  toJSON(): string {
    return this.date.toISOString();
  }

  static fromJSON(data: string): Timestamp {
    return new Timestamp(new Date(data));
  }

  toDate(): Date {
    return this.date;
  }
}

@jsonObject
export class Duration {
  @jsonMember({ constructor: Number })
  duration: number;

  constructor(duration: number) {
    this.duration = duration;
  }

  toJSON(): string {
    let durationStr = this.toDurationString();
    if (durationStr === '24h0m0s') {
      durationStr = '1day';
    }
    if (durationStr.endsWith('h0m0s')) {
      durationStr = durationStr.replace('0m0s', '');
    } else if (durationStr.endsWith('m0s')) {
      durationStr = durationStr.replace('0s', '');
    }
    return durationStr;
  }

  static fromJSON(data: string): Duration {
    let parsedData = data.replace(' ', '');
    if (parsedData === '1day') {
      parsedData = '24h';
    }
    const ms = Duration.parseDurationString(parsedData);
    return new Duration(ms);
  }

  private toDurationString(): string {
    return new Date(this.duration).toISOString().substring(11, 19);
  }

  private static parseDurationString(durationStr: string): number {
    const parts = durationStr.match(/(\d+)([smhd])/g);
    if (!parts) throw new Error('Invalid duration format');

    let totalMs = 0;
    for (const part of parts) {
      const value = parseInt(part.slice(0, -1));
      const unit = part.slice(-1);
      switch (unit) {
        case 's':
          totalMs += value * 1000;
          break;
        case 'm':
          totalMs += value * 60000;
          break;
        case 'h':
          totalMs += value * 3600000;
          break;
        case 'd':
          totalMs += value * 86400000;
          break;
      }
    }
    return totalMs;
  }

  toMilliseconds(): number {
    return this.duration;
  }
}
