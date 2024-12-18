import { jsonObject, jsonMember, jsonArrayMember, AnyT } from 'typedjson';
import { CLTypeRaw } from './clvalue';

/**
 * Enum representing the type of entry point.
 */
export enum EntryPointType {
  Session = 'Session',
  Contract = 'Contract',
  Caller = 'Caller',
  Called = 'Called',
  Factory = 'Factory'
}

/**
 * Enum representing the payment options for an entry point.
 */
export enum EntryPointPayment {
  /**
   * The caller must cover cost.
   */
  Caller = 'Caller',
  /**
   * Will cover cost to execute self but not cost of any subsequent invoked contracts.
   */
  DirectInvocationOnly = 'DirectInvocationOnly',
  /**
   * Will cover cost to execute self and the cost of any subsequent invoked contracts.
   */
  SelfOnward = 'SelfOnward'
}

/**
 * Class representing an argument for an entry point. Each argument has a name and a corresponding `CLTypeRaw`.
 */
@jsonObject
export class EntryPointArg {
  /**
   * The name of the entry point argument.
   */
  @jsonMember({ name: 'name', constructor: String })
  name: string;

  /**
   * The type of the argument, represented by `CLTypeRaw`.
   */
  @jsonMember({
    name: 'cl_type',
    constructor: CLTypeRaw,
    deserializer: json => {
      if (!json) return;
      return CLTypeRaw.parseCLType(json);
    },
    serializer: (value: CLTypeRaw) => {
      if (!value) return;
      return value.toJSON();
    }
  })
  clType: CLTypeRaw;

  /**
   * Constructs an `EntryPointArg` instance.
   * @param name The name of the argument.
   * @param clType The type of the argument.
   */
  constructor(name: string, clType: CLTypeRaw) {
    this.name = name;
    this.clType = clType;
  }
}

/**
 * Class representing access control options for an entry point.
 * This class is used for controlling the permissions required to call the entry point.
 *
 * TODO: Match with Go code when ready
 */
@jsonObject
export class EntryPointAccess {
  /**
   * The access control options for this entry point.
   */
  @jsonMember({ name: 'access_control_options', constructor: AnyT })
  accessControlOptions: any;
}

/**
 * Class representing version 1 of an entry point in the Casper VM.
 * It contains the entry point's access, arguments, type, payment type, name, and return type.
 */
@jsonObject
export class EntryPointV1 {
  /**
   * The access control for the entry point.
   */
  @jsonMember({
    name: 'access',
    constructor: EntryPointAccess
  })
  access: EntryPointAccess;

  /**
   * A list of arguments for the entry point.
   */
  @jsonArrayMember(EntryPointArg, { name: 'args' })
  args: EntryPointArg[];

  /**
   * The type of entry point (e.g., session, contract, etc.).
   */
  @jsonMember({
    name: 'entry_point_type',
    constructor: String
  })
  entryPointType: EntryPointType;

  /**
   * The payment method required to access this entry point.
   */
  @jsonMember({
    name: 'entry_point_payment',
    constructor: String
  })
  entryPointPayment: EntryPointPayment;

  /**
   * The name of the entry point.
   */
  @jsonMember({ name: 'name', constructor: String })
  name: string;

  /**
   * The return type of the entry point.
   */
  @jsonMember({
    name: 'ret',
    constructor: CLTypeRaw,
    deserializer: json => {
      if (!json) return;
      return CLTypeRaw.parseCLType(json);
    },
    serializer: (value: CLTypeRaw) => {
      if (!value) return;
      return value.toJSON();
    }
  })
  ret: CLTypeRaw;

  /**
   * Constructs an `EntryPointV1` instance.
   *
   * @param access The access control for this entry point.
   * @param args A list of arguments for the entry point.
   * @param entryPointType The type of entry point.
   * @param entryPointPayment The payment method for the entry point.
   * @param name The name of the entry point.
   * @param ret The return type of the entry point.
   */
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

/**
 * Class representing version 2 of an entry point in the Casper VM.
 * This version includes flags and a function index.
 */
@jsonObject
export class EntryPointV2 {
  /**
   * Flags associated with this entry point.
   */
  @jsonMember({ name: 'flags', constructor: Number })
  flags: number;

  /**
   * The function index for the entry point.
   */
  @jsonMember({ name: 'functionIndex', constructor: Number })
  functionIndex: number;

  /**
   * Constructs an `EntryPointV2` instance.
   *
   * @param flags The flags for the entry point.
   * @param functionIndex The function index for the entry point.
   */
  constructor(flags = 0, functionIndex = 0) {
    this.flags = flags;
    this.functionIndex = functionIndex;
  }
}

/**
 * A wrapper class that can hold either version 1 or version 2 of an entry point.
 */
@jsonObject
export class EntryPointValue {
  /**
   * Version 1 of the entry point, if available.
   */
  @jsonMember({
    name: 'V1CasperVm',
    constructor: EntryPointV1
  })
  v1CasperVm?: EntryPointV1;

  /**
   * Version 2 of the entry point, if available.
   */
  @jsonMember({
    name: 'V2CasperVm',
    constructor: EntryPointV2
  })
  v2CasperVm?: EntryPointV2;

  /**
   * Constructs an `EntryPointValue` instance.
   *
   * @param v1CasperVm Version 1 of the entry point, if available.
   * @param v2CasperVm Version 2 of the entry point, if available.
   */
  constructor(v1CasperVm?: EntryPointV1, v2CasperVm?: EntryPointV2) {
    this.v1CasperVm = v1CasperVm;
    this.v2CasperVm = v2CasperVm;
  }
}
