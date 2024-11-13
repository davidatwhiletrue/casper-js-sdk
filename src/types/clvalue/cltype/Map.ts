import { concat } from '@ethersproject/bytes';
import { TypeID, TypeName, CLType } from './CLType';
import { CLTypeParser } from './Parser';

/**
 * Error thrown when there's an issue parsing the Map type from JSON.
 */
export const MapJsonParsingError = new Error('map type parsing error');

/**
 * Represents a Map type in the Casper type system.
 * This class implements the CLType interface, allowing the use of key-value pairs with specified types.
 */
export class CLTypeMap implements CLType {
  /**
   * The CLType of the map's keys.
   */
  public key: CLType;

  /**
   * The CLType of the map's values.
   */
  public val: CLType;

  /**
   * Initializes a new instance of the CLTypeMap class.
   * @param keyType - The CLType of the map's keys.
   * @param valType - The CLType of the map's values.
   */
  constructor(keyType: CLType, valType: CLType) {
    this.key = keyType;
    this.val = valType;
  }

  /**
   * Converts the CLTypeMap instance to its byte representation.
   * This includes the type ID for Map followed by the byte representations of the key and value types.
   * @returns A Uint8Array representing the CLTypeMap.
   */
  public toBytes(): Uint8Array {
    return concat([
      Uint8Array.from([this.getTypeID()]),
      this.key.toBytes(),
      this.val.toBytes()
    ]);
  }

  /**
   * Provides a string representation of the CLTypeMap.
   * @returns A string in the format "Map (keyType: valueType)".
   */
  public toString(): string {
    return `${TypeName.Map} (${this.key.toString()}: ${this.val.toString()})`;
  }

  /**
   * Retrieves the type ID of the CLTypeMap.
   * @returns The TypeID associated with Map.
   */
  public getTypeID(): TypeID {
    return TypeID.Map;
  }

  /**
   * Retrieves the name of the CLTypeMap.
   * @returns The TypeName for Map.
   */
  public getName(): TypeName {
    return TypeName.Map;
  }

  /**
   * Converts the CLTypeMap instance to a JSON-compatible representation.
   * The JSON object includes a "Map" key containing the JSON representations of the key and value types.
   * @returns A JSON object representing the map type and its key and value types.
   */
  public toJSON(): { Map: { key: CLType; value: CLType } } {
    return {
      Map: {
        key: this.key.toJSON(),
        value: this.val.toJSON()
      }
    };
  }

  /**
   * Creates a CLTypeMap instance from a JSON representation.
   * Parses JSON input to determine the key and value types of the map.
   * @param source - The JSON representation of the CLTypeMap.
   * @returns A new CLTypeMap instance with parsed key and value types.
   * @throws {MapJsonParsingError} If the JSON structure is invalid.
   */
  public static fromJSON(source: any): CLTypeMap {
    if (typeof source !== 'object' || source === null) {
      throw MapJsonParsingError;
    }

    const key = source.key;
    if (key === undefined) {
      throw MapJsonParsingError;
    }
    const keyType = CLTypeParser.fromInterface(key);

    const val = source.value;
    if (val === undefined) {
      throw MapJsonParsingError;
    }
    const valType = CLTypeParser.fromInterface(val);

    return new CLTypeMap(keyType, valType);
  }
}
