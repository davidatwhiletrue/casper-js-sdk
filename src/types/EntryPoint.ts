import { jsonObject, jsonMember, jsonArrayMember, AnyT } from 'typedjson';

import { CLTypeRaw } from './clvalue';

export enum EntryPointType {
  Session = 'Session',
  Contract = 'Contract',
  Caller = 'Caller',
  Called = 'Called',
  Factory = 'Factory'
}

export enum EntryPointPayment {
  Caller = 'Caller',
  SelfOnly = 'SelfOnly',
  SelfOnward = 'SelfOnward'
}

@jsonObject
export class EntryPointArg {
  @jsonMember({ name: 'name', constructor: String })
  name: string;

  @jsonMember({
    name: 'cl_type',
    constructor: CLTypeRaw
  })
  clType: CLTypeRaw;

  constructor(name: string, clType: CLTypeRaw) {
    this.name = name;
    this.clType = clType;
  }
}

// TODO: Match with Go code when ready
@jsonObject
export class EntryPointAccess {
  @jsonMember({ name: 'access_control_options', constructor: AnyT })
  accessControlOptions: any;
}

@jsonObject
export class EntryPointV1 {
  @jsonMember({
    name: 'access',
    constructor: EntryPointAccess
  })
  access: EntryPointAccess;

  @jsonArrayMember(EntryPointArg, { name: 'args' })
  args: EntryPointArg[];

  @jsonMember({
    name: 'entry_point_type',
    constructor: () => EntryPointType
  })
  entryPointType: EntryPointType;

  @jsonMember({
    name: 'entry_point_payment',
    constructor: () => EntryPointPayment
  })
  entryPointPayment: EntryPointPayment;

  @jsonMember({ name: 'name', constructor: String })
  name: string;

  @jsonMember({
    name: 'ret',
    constructor: CLTypeRaw
  })
  ret: CLTypeRaw;

  constructor(
    access: EntryPointAccess,
    args: EntryPointArg[],
    entryPointType: EntryPointType,
    entryPointPayment: EntryPointPayment,
    name: string,
    ret: CLTypeRaw
  ) {
    this.access = access;
    this.args = args;
    this.entryPointType = entryPointType;
    this.entryPointPayment = entryPointPayment;
    this.name = name;
    this.ret = ret;
  }
}

@jsonObject
export class EntryPointV2 {
  @jsonMember({ name: 'flags', constructor: Number })
  flags: number;

  @jsonMember({ name: 'functionIndex', constructor: Number })
  functionIndex: number;

  constructor(flags = 0, functionIndex = 0) {
    this.flags = flags;
    this.functionIndex = functionIndex;
  }
}

@jsonObject
export class EntryPointValue {
  @jsonMember({
    name: 'V1CasperVm',
    constructor: EntryPointV1
  })
  v1CasperVm?: EntryPointV1;

  @jsonMember({
    name: 'V2CasperVm',
    constructor: EntryPointV2
  })
  v2CasperVm?: EntryPointV2;

  constructor(v1CasperVm?: EntryPointV1, v2CasperVm?: EntryPointV2) {
    this.v1CasperVm = v1CasperVm;
    this.v2CasperVm = v2CasperVm;
  }
}
