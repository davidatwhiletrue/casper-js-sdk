import { jsonMember, jsonObject } from 'typedjson';

@jsonObject
export class IDValue {
  @jsonMember({ constructor: Number, isRequired: false, preserveNull: true })
  intValue: number | null = null;

  @jsonMember({ constructor: String, isRequired: false, preserveNull: true })
  strValue: string | null = null;

  @jsonMember({ constructor: Boolean })
  isIntValue: boolean;

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

  static fromJSON(data: string | number): IDValue {
    if (typeof data === 'number') {
      return IDValue.fromInt(data);
    } else if (typeof data === 'string') {
      return IDValue.fromString(data);
    }
    throw new Error('IDValue should be an int or string');
  }
}
