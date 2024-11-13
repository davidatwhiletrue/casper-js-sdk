import { jsonMember, jsonObject } from 'typedjson';
import { CLType } from './CLType';
import { CLTypeParser } from './Parser';

/**
 * Represents a raw CLType message that can be parsed into a `CLType` instance.
 * This class utilizes `typedjson` decorators for JSON serialization and deserialization.
 */
@jsonObject
export class CLTypeRaw {
  /**
   * The raw message string representation of a CLType.
   */
  @jsonMember({ constructor: String })
  rawMessage: string;

  /**
   * Initializes a new instance of the CLTypeRaw class.
   * @param rawMessage - A string representing the raw CLType message.
   */
  constructor(rawMessage: string) {
    this.rawMessage = rawMessage;
  }

  /**
   * Parses the raw message into a `CLType` object.
   * @returns A `CLType` instance if parsing is successful.
   * @throws Error if parsing fails, with a descriptive error message.
   */
  parseCLType(): CLType | Error {
    try {
      return CLTypeParser.fromRawJson(this.rawMessage);
    } catch (error) {
      throw new Error(`Error parsing CLType: ${error.message}`);
    }
  }
}
