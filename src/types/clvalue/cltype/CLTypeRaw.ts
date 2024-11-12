import { jsonMember, jsonObject } from 'typedjson';
import { CLType } from './CLType';
import { CLTypeParser } from './Parser';

/**
 * Represents a raw CLType message that can be parsed into a CLType.
 * This class is decorated with typedjson for JSON serialization/deserialization.
 */
@jsonObject
export class CLTypeRaw {
  /**
   * The raw message string representing a CLType.
   */
  @jsonMember({ constructor: String })
  rawMessage: string;

  /**
   * Constructs a new CLTypeRaw instance.
   * @param rawMessage - The raw message string representing a CLType.
   */
  constructor(rawMessage: string) {
    this.rawMessage = rawMessage;
  }

  /**
   * Parses the raw message into a CLType.
   * @returns A CLType instance if parsing is successful.
   * @throws Error if parsing fails.
   */
  parseCLType(): CLType | Error {
    try {
      return CLTypeParser.fromRawJson(this.rawMessage);
    } catch (error) {
      throw new Error(`Error parsing CLType: ${error.message}`);
    }
  }
}
