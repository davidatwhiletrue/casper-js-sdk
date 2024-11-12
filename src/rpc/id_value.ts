export class IDValue {
  private intValue: number | null = null;
  private strValue: string | null = null;
  private isIntValue: boolean;

  constructor(value: string | number) {
    if (typeof value === 'number') {
      this.intValue = value;
      this.isIntValue = true;
    } else {
      this.strValue = value;
      this.isIntValue = false;
    }
  }

  static fromString(value: string): IDValue {
    return new IDValue(value);
  }

  static fromInt(value: number): IDValue {
    return new IDValue(value);
  }

  toString(): string {
    if (this.isIntValue && this.intValue !== null) {
      return this.intValue.toString();
    }
    return this.strValue || '';
  }

  toInt(): number {
    if (this.isIntValue && this.intValue !== null) {
      return this.intValue;
    }

    const val = parseInt(this.strValue || '0', 10);
    return isNaN(val) ? 0 : val;
  }

  toJSON(): string {
    return this.toString();
  }

  static fromJSON(data: string): IDValue {
    try {
      const parsedInt = JSON.parse(data) as number;
      if (typeof parsedInt === 'number') {
        return IDValue.fromInt(parsedInt);
      }
    } catch (e) {
      // Not a number, continue to try parsing as a string
    }

    try {
      const parsedStr = JSON.parse(data) as string;
      if (typeof parsedStr === 'string') {
        return IDValue.fromString(parsedStr);
      }
    } catch (e) {
      throw new Error('IDValue should be an int or string');
    }

    throw new Error('IDValue should be an int or string');
  }
}
