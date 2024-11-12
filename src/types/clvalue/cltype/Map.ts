import { concat } from '@ethersproject/bytes';

import { TypeID, TypeName, CLType } from './CLType';
import { CLTypeParser } from './Parser';

/**
 * Error thrown when there's an issue parsing the Map type from JSON.
 */
export const MapJsonParsingError = new Error('map type parsing error');

/**
 * Represents a Map type in the CasperLabs type system.
 * This class implements the CLType interface for Map types.
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
   * Constructs a new CLTypeMap instance.
   * @param keyType - The CLType of the map's keys.
   * @param valType - The CLType of the map's values.
   */
  constructor(keyType: CLType, valType: CLType) {
    this.key = keyType;
    this.val = valType;
  }

  /**
   * Converts the CLTypeMap to its byte representation.
   * @returns A Uint8Array representing the CLTypeMap, including its type ID and the bytes of its key and value types.
   */
  public toBytes(): Uint8Array {
    return concat([
      Uint8Array.from([this.getTypeID()]),
      this.key.toBytes(),
      this.val.toBytes()
    ]);
  }

  /**
   * Returns a string representation of the CLTypeMap.
   * @returns A string in the format "Map (keyType: valueType)".
   */
  public toString(): string {
    return `${TypeName.Map} (${this.key.toString()}: ${this.val.toString()})`;
  }

  /**
   * Gets the type ID of the CLTypeMap.
   * @returns The TypeID for Map.
   */
  public getTypeID(): TypeID {
    return TypeID.Map;
  }

  /**
   * Gets the name of the CLTypeMap.
   * @returns The TypeName for Map.
   */
  public getName(): TypeName {
    return TypeName.Map;
  }

  /**
   * Converts the CLTypeMap to a JSON representation.
   * @returns An object with a "Map" key containing the key and value types.
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
   * @param source - The JSON representation of the CLTypeMap.
   * @returns A new CLTypeMap instance.
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
