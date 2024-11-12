import { jsonMember, jsonObject } from 'typedjson';
import { HexBytes } from './HexBytes';
import { Hash } from './key';

@jsonObject
export class ReservationKind {
  @jsonMember({ name: 'receipt', constructor: Hash })
  receipt: Hash;

  @jsonMember({ name: 'reservation_data', constructor: HexBytes })
  reservationData: HexBytes;

  @jsonMember({ name: 'reservation_kind', constructor: Number })
  reservationKind: number;

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
