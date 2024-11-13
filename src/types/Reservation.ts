import { jsonMember, jsonObject } from 'typedjson';
import { HexBytes } from './HexBytes';
import { Hash } from './key';

/**
 * Represents a reservation, including a receipt, reservation data, and the type of reservation.
 */
@jsonObject
export class ReservationKind {
  /**
   * The receipt associated with the reservation.
   * This is typically a unique identifier for the reservation.
   */
  @jsonMember({
    name: 'receipt',
    constructor: Hash,
    deserializer: json => Hash.fromJSON(json),
    serializer: value => value.toJSON()
  })
  receipt: Hash;

  /**
   * The reservation data, represented as a `HexBytes` object.
   * This can contain specific details regarding the reservation, encoded as hex.
   */
  @jsonMember({
    name: 'reservation_data',
    constructor: HexBytes,
    deserializer: json => HexBytes.fromJSON(json),
    serializer: value => value.toJSON()
  })
  reservationData: HexBytes;

  /**
   * The kind of reservation, represented as a number.
   * This field can be used to distinguish different types of reservations.
   */
  @jsonMember({ name: 'reservation_kind', constructor: Number })
  reservationKind: number;

  /**
   * Creates a new instance of `ReservationKind`.
   *
   * @param receipt The receipt associated with the reservation.
   * @param reservationData The reservation data encoded as hex.
   * @param reservationKind The type of the reservation, represented by a number.
   */
  constructor(
    receipt: Hash,
    reservationData: HexBytes,
    reservationKind: number
  ) {
    this.receipt = receipt;
    this.reservationData = reservationData;
    this.reservationKind = reservationKind;
  }
}
