import { AnyT, jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import { Account } from './Account';
import { TransferV1 } from './Transfer';
import { DeployInfo } from './DeployInfo';
import { EraInfo } from './EraInfo';
import { Bid } from './Bid';
import { UnbondingPurse } from './UnbondingPurse';
import { AddressableEntity } from './AddressableEntity';
import { BidKind } from './BidKind';
import { Package } from './Package';
import { MessageChecksum, MessageTopicSummary } from './MessageTopic';
import { NamedKeyValue } from './NamedKey';
import { EntryPointValue } from './EntryPoint';
import { ReservationKind } from './Reservation';

import { ByteCode } from './key';
import { Contract } from './Contract';
import { ContractPackage } from './ContractPackage';
import { CLValue, CLValueParser } from './clvalue';

@jsonObject
export class StoredValue {
  @jsonMember({
    name: 'CLValue',
    constructor: CLValue,
    deserializer: json => {
      if (!json) return;
      return CLValueParser.fromJSON(json);
    },
    serializer: value => {
      if (!value) return;
      return CLValueParser.toJSON(value);
    }
  })
  clValue?: CLValue;

  @jsonMember({ name: 'Account', constructor: Account })
  account?: Account;

  @jsonMember({ name: 'Contract', constructor: Contract })
  contract?: Contract;

  @jsonMember({ name: 'ContractWASM', constructor: AnyT })
  contractWASM?: any;

  @jsonMember({ name: 'ContractPackage', constructor: ContractPackage })
  contractPackage?: ContractPackage;

  @jsonMember({ name: 'LegacyTransfer', constructor: TransferV1 })
  legacyTransfer?: TransferV1;

  @jsonMember({ name: 'DeployInfo', constructor: DeployInfo })
  deployInfo?: DeployInfo;

  @jsonMember({ name: 'EraInfo', constructor: EraInfo })
  eraInfo?: EraInfo;

  @jsonMember({ name: 'Bid', constructor: Bid })
  bid?: Bid;

  @jsonArrayMember(UnbondingPurse, { name: 'Withdraw' })
  withdraw?: UnbondingPurse[];

  @jsonMember({ name: 'Unbonding', constructor: UnbondingPurse })
  unbonding?: UnbondingPurse;

  @jsonMember({ name: 'AddressableEntity', constructor: AddressableEntity })
  addressableEntity?: AddressableEntity;

  @jsonMember({ name: 'BidKind', constructor: BidKind })
  bidKind?: BidKind;

  @jsonMember({ name: 'Package', constructor: Package })
  package?: Package;

  @jsonMember({ name: 'ByteCode', constructor: ByteCode })
  byteCode?: ByteCode;

  @jsonMember({ name: 'MessageTopic', constructor: MessageTopicSummary })
  messageTopic?: MessageTopicSummary;

  @jsonMember({ name: 'Message', constructor: String })
  message?: MessageChecksum;

  @jsonMember({ name: 'NamedKey', constructor: NamedKeyValue })
  namedKey?: NamedKeyValue;

  @jsonMember({ name: 'Reservation', constructor: ReservationKind })
  reservation?: ReservationKind;

  @jsonMember({ name: 'EntryPoint', constructor: EntryPointValue })
  entryPoint?: EntryPointValue;
}
