import { concat } from '@ethersproject/bytes';

import { CLType, CLTypeList } from './cltype';
import { CLValue, IResultWithBytes } from './CLValue';
import { CLValueUInt32 } from './Uint32';
import { CLValueParser } from './Parser';
import { toBytesU32 } from '../ByteConverters';

/**
 * Represents a List value in the CasperLabs type system.
 */
export class CLValueList {
  /**
   * The type of the list.
   */
  public type: CLTypeList;

  /**
   * The elements contained in the list.
   */
  public elements: CLValue[];

  /**
   * Constructs a new CLValueList instance.
   * @param type - The CLTypeList representing the type of the list.
   * @param elements - Optional array of CLValues to initialize the list with.
   */
  constructor(type: CLTypeList, elements: CLValue[] = []) {
    this.type = type;
    this.elements = elements;
  }

  /**
   * Returns the byte representation of the list.
   * @returns A Uint8Array representing the bytes of the list, including its length and elements.
   */
  public bytes(): Uint8Array {
    const valueByteList = this.elements.map(e => e.bytes());
    valueByteList.splice(0, 0, toBytesU32(this.size()));
    return concat(valueByteList);
  }

  /**
   * Returns a string representation of the list.
   * @returns A string representation of the list in the format "[elem1,elem2,...]".
   */
  public toString(): string {
    const strData = this.elements.map(one => `"${one.toString()}"`);
    return `[${strData.join(',')}]`;
  }

  /**
   * Checks if the list is empty.
   * @returns true if the list is empty, false otherwise.
   */
  public isEmpty(): boolean {
    return this.size() === 0;
  }

  /**
   * Appends a new element to the list.
   * @param value - The CLValue to append to the list.
   */
  public append(value: CLValue): void {
    this.elements.push(value);
  }

  /**
   * Removes an element from the list at the specified index.
   * @param index - The index of the element to remove.
   */
  public remove(index: number): void {
    this.elements.splice(index, 1);
  }

  /**
   * Removes and returns the last element from the list.
   * @returns The last element of the list, or undefined if the list is empty.
   */
  public pop(): CLValue | undefined {
    return this.elements.pop();
  }

  /**
   * Returns the number of elements in the list.
   * @returns The number of elements in the list.
   */
  public size(): number {
    return this.elements.length;
  }

  /**
   * Sets the element at the specified index.
   * @param index - The index at which to set the element.
   * @param item - The CLValue to set at the specified index.
   * @throws Error if the index is out of bounds.
   */
  public set(index: number, item: CLValue): void {
    if (index >= this.elements.length) {
      throw new Error('List index out of bounds.');
    }
    this.elements[index] = item;
  }

  /**
   * Gets the element at the specified index.
   * @param index - The index of the element to get.
   * @returns The CLValue at the specified index.
   * @throws Error if the index is out of bounds.
   */
  public get(index: number): CLValue {
    if (index >= this.elements.length) {
      throw new Error('List index out of bounds.');
    }
    return this.elements[index];
  }

  /**
   * Returns a JSON representation of the list.
   * @returns An array of string representations of the list elements.
   */
  public toJSON(): any {
    return this.elements.map(d => d.toString());
  }

  /**
   * Creates a new CLValue instance with a List value.
   * @param elementType - The CLType for the elements of the list.
   * @returns A new CLValue instance with CLTypeList and a CLValueList.
   */
  public static newCLList(elementType: CLType): CLValue {
    const listType = new CLTypeList(elementType);
    const clValue = new CLValue(listType);
    clValue.list = new CLValueList(listType);
    return clValue;
  }

  /**
   * Creates a CLValueList instance from a Uint8Array.
   * @param source - The Uint8Array containing the byte representation of the List value.
   * @param clType - The CLTypeList representing the type of the list.
   * @returns A new CLValueList instance.
   */
  public static fromBytes(
    source: Uint8Array,
    clType: CLTypeList
  ): IResultWithBytes<CLValueList> {
    const { result: u32, bytes: u32Bytes } = CLValueUInt32.fromBytes(source);
    const size = u32.getValue().toNumber();
    let remainder = u32Bytes;
    const elements: CLValue[] = [];

    for (let i = 0; i < size; i++) {
      const {
        result: inner,
        bytes: innerBytes
      } = CLValueParser.fromBytesByType(remainder, clType.elementsType);

      elements.push(inner);
      remainder = innerBytes;
    }

    if (elements.length === 0) {
      return { result: new CLValueList(clType, []), bytes: remainder };
    }

    return { result: new CLValueList(clType, elements), bytes: remainder };
  }
}
