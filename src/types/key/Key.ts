import { jsonObject, jsonMember } from 'typedjson';
import { AccountHash } from './Account';
import { Hash } from './Hash';
import { TransferHash } from './Transfer';
import { Era } from './Era';
import { EntityAddr } from './EntityAddr';
import { BidAddr } from './BidAddr';
import { ByteCode } from './ByteCode';
import { MessageAddr } from './MessageAddr';
import { NamedKeyAddr } from './NewNamedKeyAddr';
import { BlockGlobalAddr } from './BlockGlobalAddr';
import { BalanceHoldAddr } from './BalanceHoldAddr';
import { EntryPointAddr } from './EntryPointAddr';
import { URef } from './URef';
import { IResultWithBytes } from '../clvalue';

/**
 * Enum that defines prefixes used to identify different types of blockchain entities and objects.
 */
export enum PrefixName {
  Account = 'account-hash-',
  AddressableEntity = 'addressable-entity-',
  Hash = 'hash-',
  ContractPackageWasm = 'contract-package-wasm',
  ContractPackage = 'contract-package-',
  ContractWasm = 'contract-wasm-',
  Contract = 'contract-',
  URef = 'uref-',
  Transfer = 'transfer-',
  DeployInfo = 'deploy-',
  EraId = 'era-',
  Bid = 'bid-',
  Balance = 'balance-',
  Withdraw = 'withdraw-',
  Dictionary = 'dictionary-',
  SystemContractRegistry = 'system-contract-registry-',
  EraSummary = 'era-summary-',
  Unbond = 'unbond-',
  ChainspecRegistry = 'chainspec-registry-',
  ChecksumRegistry = 'checksum-registry-',
  BidAddr = 'bid-addr-',
  Package = 'package-',
  Entity = 'entity-',
  ByteCode = 'byte-code-',
  Message = 'message-',
  NamedKey = 'named-key-',
  BlockGlobal = 'block-',
  BalanceHold = 'balance-hold-',
  EntryPoint = 'entry-point-'
}

/**
 * Enum representing different types of blockchain key types used in the system.
 */
const enum TypeID {
  Account = 0,
  Hash,
  URef,
  Transfer,
  DeployInfo,
  EraId,
  Balance,
  Bid,
  Withdraw,
  Dictionary,
  SystemContractRegistry,
  EraSummary,
  Unbond,
  ChainspecRegistry,
  ChecksumRegistry,
  BidAddr,
  Package,
  AddressableEntity,
  ByteCode,
  Message,
  NamedKey,
  BlockGlobal,
  BalanceHold,
  EntryPoint
}

/**
 * Enum for human-readable key type names, used to represent various key entities in the blockchain.
 */
export enum KeyTypeName {
  Account = 'Account',
  Hash = 'Hash',
  URef = 'URef',
  Transfer = 'Transfer',
  Deploy = 'Deploy',
  Era = 'Era',
  Bid = 'Bid',
  Balance = 'Balance',
  Withdraw = 'Withdraw',
  Dictionary = 'Dictionary',
  SystemContractRegistry = 'SystemContractRegistry',
  EraSummary = 'EraSummary',
  Unbond = 'Unbond',
  ChainspecRegistry = 'ChainspecRegistry',
  ChecksumRegistry = 'ChecksumRegistry'
}

/**
 * Mapping of key type names to their corresponding TypeID values.
 */
export const typeIDbyNames = new Map<KeyTypeName, TypeID>([
  [KeyTypeName.Account, TypeID.Account],
  [KeyTypeName.Hash, TypeID.Hash],
  [KeyTypeName.URef, TypeID.URef],
  [KeyTypeName.Transfer, TypeID.Transfer],
  [KeyTypeName.Deploy, TypeID.DeployInfo],
  [KeyTypeName.Era, TypeID.EraId],
  [KeyTypeName.Bid, TypeID.Bid],
  [KeyTypeName.Balance, TypeID.Balance],
  [KeyTypeName.Withdraw, TypeID.Withdraw],
  [KeyTypeName.Dictionary, TypeID.Dictionary],
  [KeyTypeName.SystemContractRegistry, TypeID.SystemContractRegistry],
  [KeyTypeName.EraSummary, TypeID.EraSummary],
  [KeyTypeName.Unbond, TypeID.Unbond],
  [KeyTypeName.ChainspecRegistry, TypeID.ChainspecRegistry],
  [KeyTypeName.ChecksumRegistry, TypeID.ChecksumRegistry]
]);

/**
 * Mapping of blockchain key prefixes to their corresponding TypeID values.
 */
export const keyIDbyPrefix = new Map<PrefixName, TypeID>([
  [PrefixName.Account, TypeID.Account],
  [PrefixName.Hash, TypeID.Hash],
  [PrefixName.Transfer, TypeID.Transfer],
  [PrefixName.URef, TypeID.URef],
  [PrefixName.DeployInfo, TypeID.DeployInfo],
  [PrefixName.EraId, TypeID.EraId],
  [PrefixName.Bid, TypeID.Bid],
  [PrefixName.Balance, TypeID.Balance],
  [PrefixName.Withdraw, TypeID.Withdraw],
  [PrefixName.Dictionary, TypeID.Dictionary],
  [PrefixName.SystemContractRegistry, TypeID.SystemContractRegistry],
  [PrefixName.EraSummary, TypeID.EraSummary],
  [PrefixName.Unbond, TypeID.Unbond],
  [PrefixName.ChainspecRegistry, TypeID.ChainspecRegistry],
  [PrefixName.ChecksumRegistry, TypeID.ChecksumRegistry],
  [PrefixName.BidAddr, TypeID.BidAddr],
  [PrefixName.Package, TypeID.Package],
  [PrefixName.Entity, TypeID.AddressableEntity],
  [PrefixName.ByteCode, TypeID.ByteCode],
  [PrefixName.Message, TypeID.Message],
  [PrefixName.NamedKey, TypeID.NamedKey],
  [PrefixName.BlockGlobal, TypeID.BlockGlobal],
  [PrefixName.BalanceHold, TypeID.BalanceHold],
  [PrefixName.EntryPoint, TypeID.EntryPoint]
]);

/**
 * Default byte length for keys.
 */
export const KEY_DEFAULT_BYTE_LENGTH = 32;

/**
 * Represents a Key that can identify different types of entities in the system.
 */
@jsonObject
export class Key {
  @jsonMember({ name: 'Type', constructor: Number })
  type: TypeID;

  @jsonMember({
    name: 'Account',
    constructor: () => AccountHash
  })
  account?: AccountHash;

  @jsonMember({
    name: 'Hash',
    constructor: Hash
  })
  hash?: Hash;

  @jsonMember({
    name: 'URef',
    constructor: URef
  })
  uRef?: URef;

  @jsonMember({
    name: 'Transfer',
    constructor: TransferHash
  })
  transfer?: TransferHash;

  @jsonMember({
    name: 'Deploy',
    constructor: Hash
  })
  deploy?: Hash;

  @jsonMember({
    name: 'Era',
    constructor: Era
  })
  era?: Era;

  @jsonMember({
    name: 'Balance',
    constructor: Hash
  })
  balance?: Hash;

  @jsonMember({
    name: 'Bid',
    constructor: () => AccountHash
  })
  bid?: AccountHash;

  @jsonMember({
    name: 'Withdraw',
    constructor: () => AccountHash
  })
  withdraw?: AccountHash;

  @jsonMember({
    name: 'Dictionary',
    constructor: Hash
  })
  dictionary?: Hash;

  @jsonMember({
    name: 'SystemContactRegistry',
    constructor: Hash
  })
  systemContactRegistry?: Hash;

  @jsonMember({
    name: 'EraSummary',
    constructor: Hash
  })
  eraSummary?: Hash;

  @jsonMember({
    name: 'Unbond',
    constructor: () => AccountHash
  })
  unbond?: AccountHash;

  @jsonMember({
    name: 'ChainspecRegistry',
    constructor: Hash
  })
  chainspecRegistry?: Hash;

  @jsonMember({
    name: 'ChecksumRegistry',
    constructor: Hash
  })
  checksumRegistry?: Hash;

  @jsonMember({
    name: 'BidAddr',
    constructor: BidAddr
  })
  bidAddr?: BidAddr;

  @jsonMember({
    name: 'Package',
    constructor: Hash
  })
  package?: Hash;

  @jsonMember({
    name: 'AddressableEntity',
    constructor: EntityAddr
  })
  addressableEntity?: EntityAddr;

  @jsonMember({
    name: 'ByteCode',
    constructor: ByteCode
  })
  byteCode?: ByteCode;

  @jsonMember({
    name: 'Message',
    constructor: MessageAddr
  })
  message?: MessageAddr;

  @jsonMember({
    name: 'NamedKey',
    constructor: NamedKeyAddr
  })
  namedKey?: NamedKeyAddr;

  @jsonMember({
    name: 'BlockGlobal',
    constructor: BlockGlobalAddr
  })
  blockGlobal?: BlockGlobalAddr;

  @jsonMember({
    name: 'BalanceHold',
    constructor: BalanceHoldAddr
  })
  balanceHold?: BalanceHoldAddr;

  @jsonMember({
    name: 'EntryPoint',
    constructor: EntryPointAddr
  })
  entryPoint?: EntryPointAddr;

  /**
   * Converts the key to bytes.
   * @returns A Uint8Array representing the serialized key.
   */
  bytes(): Uint8Array {
    const typeBytes = new Uint8Array([this.type]);

    switch (this.type) {
      case TypeID.Balance:
        return Key.concatBytes(typeBytes, this.balance?.toBytes());
      case TypeID.Bid:
        return Key.concatBytes(typeBytes, this.bid?.toBytes());
      case TypeID.Withdraw:
        return Key.concatBytes(typeBytes, this.withdraw?.toBytes());
      case TypeID.SystemContractRegistry:
        return Key.concatBytes(
          typeBytes,
          this.systemContactRegistry?.toBytes()
        );
      case TypeID.Unbond:
        return Key.concatBytes(typeBytes, this.unbond?.toBytes());
      case TypeID.ChainspecRegistry:
        return Key.concatBytes(typeBytes, this.chainspecRegistry?.toBytes());
      case TypeID.ChecksumRegistry:
        return Key.concatBytes(typeBytes, this.checksumRegistry?.toBytes());
      case TypeID.EraSummary:
        return Key.concatBytes(typeBytes, this.eraSummary?.toBytes());
      case TypeID.Account:
        return Key.concatBytes(typeBytes, this.account?.toBytes());
      case TypeID.Hash:
        return Key.concatBytes(typeBytes, this.hash?.toBytes());
      case TypeID.EraId:
        return Key.concatBytes(typeBytes, this.era?.toBytes());
      case TypeID.URef:
        return Key.concatBytes(typeBytes, this.uRef?.data);
      case TypeID.Transfer:
        return Key.concatBytes(typeBytes, this.transfer?.toBytes());
      case TypeID.DeployInfo:
        return Key.concatBytes(typeBytes, this.deploy?.toBytes());
      case TypeID.Dictionary:
        return Key.concatBytes(typeBytes, this.dictionary?.toBytes());
      case TypeID.BidAddr:
        return Key.concatBytes(typeBytes, this.bidAddr?.toBytes());
      case TypeID.Package:
        return Key.concatBytes(typeBytes, this.package?.toBytes());
      case TypeID.AddressableEntity:
        return Key.concatBytes(typeBytes, this.addressableEntity?.toBytes());
      case TypeID.ByteCode:
        return Key.concatBytes(typeBytes, this.byteCode?.toBytes());
      case TypeID.Message:
        return Key.concatBytes(typeBytes, this.message?.toBytes());
      case TypeID.NamedKey:
        return Key.concatBytes(typeBytes, this.namedKey?.toBytes());
      case TypeID.BlockGlobal:
        return Key.concatBytes(typeBytes, this.blockGlobal?.toBytes());
      case TypeID.BalanceHold:
        return Key.concatBytes(typeBytes, this.balanceHold?.toBytes());
      case TypeID.EntryPoint:
        return Key.concatBytes(typeBytes, this.entryPoint?.toBytes());
      default:
        return new Uint8Array();
    }
  }

  /**
   * Concatenates the type and field bytes.
   * @param typeBytes - The bytes representing the type.
   * @param fieldBytes - The bytes representing the field.
   * @returns A Uint8Array with concatenated type and field bytes.
   */
  private static concatBytes(
    typeBytes: Uint8Array,
    fieldBytes: Uint8Array = Uint8Array.from([])
  ): Uint8Array {
    const result = new Uint8Array(typeBytes.length + fieldBytes.length);
    result.set(typeBytes);
    result.set(fieldBytes, typeBytes.length);
    return result;
  }

  /**
   * Converts the key to a prefixed string representation.
   * @returns The prefixed string of the key.
   */
  toPrefixedString(): string {
    switch (this.type) {
      case TypeID.Account:
        return this.account!.toPrefixedString();
      case TypeID.Hash:
        return `${PrefixName.Hash}${this.hash?.toHex()}`;
      case TypeID.EraId:
        return `${PrefixName.EraId}${this.era?.toString()}`;
      case TypeID.URef:
        return this.uRef!.toPrefixedString();
      case TypeID.Transfer:
        return this.transfer!.toPrefixedString();
      case TypeID.DeployInfo:
        return `${PrefixName.DeployInfo}${this.deploy!.toHex()}`;
      case TypeID.Dictionary:
        return `${PrefixName.Dictionary}${this.dictionary!.toHex()}`;
      case TypeID.Balance:
        return `${PrefixName.Balance}${this.balance!.toHex()}`;
      case TypeID.Bid:
        return `${PrefixName.Bid}${this.bid!.toHex()}`;
      case TypeID.Withdraw:
        return `${PrefixName.Withdraw}${this.withdraw!.toHex()}`;
      case TypeID.SystemContractRegistry:
        return `${
          PrefixName.SystemContractRegistry
        }${this.systemContactRegistry!.toHex()}`;
      case TypeID.EraSummary:
        return `${PrefixName.EraSummary}${this.eraSummary!.toHex()}`;
      case TypeID.Unbond:
        return `${PrefixName.Unbond}${this.unbond!.toHex()}`;
      case TypeID.ChainspecRegistry:
        return `${
          PrefixName.ChainspecRegistry
        }${this.chainspecRegistry!.toHex()}`;
      case TypeID.ChecksumRegistry:
        return `${
          PrefixName.ChecksumRegistry
        }${this.checksumRegistry!.toHex()}`;
      case TypeID.BidAddr:
        return this.bidAddr!.toPrefixedString();
      case TypeID.Package:
        return `${PrefixName.Package}${this.package!.toHex()}`;
      case TypeID.AddressableEntity:
        return this.addressableEntity!.toPrefixedString();
      case TypeID.ByteCode:
        return this.byteCode!.toPrefixedString();
      case TypeID.Message:
        return this.message!.toPrefixedString();
      case TypeID.NamedKey:
        return this.namedKey!.toPrefixedString();
      case TypeID.BlockGlobal:
        return this.blockGlobal!.toPrefixedString();
      case TypeID.BalanceHold:
        return this.balanceHold!.toPrefixedString();
      case TypeID.EntryPoint:
        return this.entryPoint!.toPrefixedString();
      default:
        return '';
    }
  }

  /**
   * Converts the key to a string representation.
   * @returns The string representation of the key.
   */
  toString(): string {
    return this.toPrefixedString();
  }

  /**
   * Creates a Key instance from a byte array.
   * @param bytes - The byte array containing serialized key data.
   * @returns A new Key instance.
   * @throws Error if deserialization fails.
   */
  public static fromBytes(bytes: Uint8Array): IResultWithBytes<Key> {
    const keyType = bytes[0] as TypeID;
    const contentBytes = bytes.subarray(1);

    const result = new Key();
    result.type = keyType;

    switch (keyType) {
      case TypeID.Account:
        const accountHash = Hash.fromBytes(contentBytes);
        result.account = new AccountHash(accountHash?.result);
        return { result, bytes: accountHash?.bytes };
      case TypeID.Hash:
        const hashParsed = Hash.fromBytes(contentBytes);
        result.hash = hashParsed?.result;
        return { result, bytes: hashParsed?.bytes };
      case TypeID.URef:
        const uref = URef.fromBytes(contentBytes);
        result.uRef = uref?.result;
        return { result, bytes: uref?.bytes };
      case TypeID.Transfer:
        const [transferBytes, remainder] = splitAt(
          KEY_DEFAULT_BYTE_LENGTH,
          contentBytes
        );
        result.transfer = new TransferHash(transferBytes);
        return { result, bytes: remainder };
      case TypeID.DeployInfo:
        const [deployBytes, deployRemainder] = splitAt(
          KEY_DEFAULT_BYTE_LENGTH,
          contentBytes
        );
        result.deploy = Hash.fromBytes(deployBytes)?.result;
        return { result, bytes: deployRemainder };
      case TypeID.EraId:
        const [eraBytes, eraRemainder] = splitAt(64, contentBytes);
        result.era = Era.fromBytes(eraBytes);
        return { result, bytes: eraRemainder };
      case TypeID.Balance:
        const [balanceBytes, balanceRemainder] = splitAt(
          KEY_DEFAULT_BYTE_LENGTH,
          contentBytes
        );
        result.balance = Hash.fromBytes(balanceBytes)?.result;

        return { result, bytes: balanceRemainder };
      case TypeID.Bid:
        const [bidBytes, bidRemainder] = splitAt(
          KEY_DEFAULT_BYTE_LENGTH,
          contentBytes
        );
        const bidHash = Hash.fromBytes(bidBytes)?.result;
        result.bid = new AccountHash(bidHash);

        return { result, bytes: bidRemainder };
      case TypeID.Withdraw:
        const [withdrawBytes, withDrawRemainder] = splitAt(
          KEY_DEFAULT_BYTE_LENGTH,
          contentBytes
        );
        const withdrawHash = Hash.fromBytes(withdrawBytes)?.result;
        result.withdraw = new AccountHash(withdrawHash);
        return { result, bytes: withDrawRemainder };
      case TypeID.Dictionary:
        const [dictBytes, dictRemainder] = splitAt(
          KEY_DEFAULT_BYTE_LENGTH,
          contentBytes
        );
        result.dictionary = Hash.fromBytes(dictBytes)?.result;
        return { result, bytes: dictRemainder };
      case TypeID.SystemContractRegistry:
        const [systemBytes, systenRemainder] = splitAt(
          KEY_DEFAULT_BYTE_LENGTH,
          contentBytes
        );
        result.systemContactRegistry = Hash.fromBytes(systemBytes)?.result;
        return { result, bytes: systenRemainder };
      case TypeID.EraSummary:
        const [eraSummaryBytes, eraSummaryRemainder] = splitAt(
          KEY_DEFAULT_BYTE_LENGTH,
          contentBytes
        );
        result.eraSummary = Hash.fromBytes(eraSummaryBytes)?.result;
        return { result, bytes: eraSummaryRemainder };
      case TypeID.Unbond:
        const { result: unbondHash, bytes: unbondBytes } = Hash.fromBytes(
          contentBytes
        );
        result.unbond = new AccountHash(unbondHash);
        return { result, bytes: unbondBytes };
      case TypeID.ChainspecRegistry:
        const [chainBytes, chainspecRegistryBytes] = splitAt(
          KEY_DEFAULT_BYTE_LENGTH,
          contentBytes
        );
        result.chainspecRegistry = Hash.fromBytes(chainBytes)?.result;
        return { result, bytes: chainspecRegistryBytes };
      case TypeID.ChecksumRegistry:
        const [checksumBytes, checksumRegistry] = splitAt(
          KEY_DEFAULT_BYTE_LENGTH,
          contentBytes
        );
        result.checksumRegistry = Hash.fromBytes(checksumBytes)?.result;
        return { result, bytes: checksumRegistry };
      case TypeID.BidAddr:
        const { result: bidAddr, bytes: bidAddrBytes } = BidAddr.fromBytes(
          contentBytes
        );
        result.bidAddr = bidAddr;

        return { result, bytes: bidAddrBytes };
      case TypeID.Package:
        const [packageBytes, packageBytesRemainder] = splitAt(
          KEY_DEFAULT_BYTE_LENGTH,
          contentBytes
        );
        result.package = Hash.fromBytes(packageBytes)?.result;
        return { result, bytes: packageBytesRemainder };
      case TypeID.AddressableEntity:
        const {
          result: entityAddr,
          bytes: entityAddrBytes
        } = EntityAddr.fromBytes(contentBytes);
        result.addressableEntity = entityAddr;
        return { result, bytes: entityAddrBytes };
      case TypeID.ByteCode:
        const { result: byteCode, bytes: byteCodeBytes } = ByteCode.fromBytes(
          contentBytes
        );
        result.byteCode = byteCode;

        return { result, bytes: byteCodeBytes };
      case TypeID.Message:
        const {
          result: messageAddr,
          bytes: messageAddrBytes
        } = MessageAddr.fromBytes(contentBytes);
        result.message = messageAddr;
        return { result, bytes: messageAddrBytes };
      case TypeID.NamedKey:
        const {
          result: namedKey,
          bytes: namedKeyBytes
        } = NamedKeyAddr.fromBytes(contentBytes);
        result.namedKey = namedKey;
        return { result, bytes: namedKeyBytes };
      case TypeID.BlockGlobal:
        const {
          result: blockGlobal,
          bytes: blockGlobalBytes
        } = BlockGlobalAddr.fromBytes(contentBytes);
        result.blockGlobal = blockGlobal;
        return { result, bytes: blockGlobalBytes };
      case TypeID.BalanceHold:
        const {
          result: balanceHold,
          bytes: balanceHoldBytes
        } = BalanceHoldAddr.fromBytes(contentBytes);
        result.balanceHold = balanceHold;
        return { result, bytes: balanceHoldBytes };
      case TypeID.EntryPoint:
        const {
          result: entryPoint,
          bytes: entryPointBytes
        } = EntryPointAddr.fromBytes(contentBytes);
        result.entryPoint = entryPoint;
        return { result, bytes: entryPointBytes };
      default:
        throw new Error('Missing key type');
    }
  }

  /**
   * Finds the prefix name by matching the source string with a map of prefixes.
   * @param source - The string to check for a matching prefix.
   * @param prefixes - The map of prefix names to TypeID.
   * @returns The matching PrefixName or undefined if not found.
   */
  static findPrefixByMap(
    source: string,
    prefixes: Map<PrefixName, TypeID>
  ): PrefixName {
    let result: PrefixName = '' as PrefixName;

    prefixes.forEach((_, prefix) => {
      if (source.startsWith(prefix)) {
        if (
          prefix === PrefixName.EraId &&
          source.startsWith(PrefixName.EraSummary)
        ) {
          result = PrefixName.EraSummary;
        } else if (
          prefix === PrefixName.Bid &&
          source.startsWith(PrefixName.BidAddr)
        ) {
          result = PrefixName.BidAddr;
        } else if (
          prefix === PrefixName.Balance &&
          source.startsWith(PrefixName.BalanceHold)
        ) {
          result = PrefixName.BalanceHold;
        } else {
          result = prefix;
        }
        return; // Exit early from forEach if a match is found
      }
    });

    return result;
  }

  /**
   * Creates a Key instance based on the type ID and source string.
   * @param source - The string containing the key data.
   * @param typeID - The TypeID of the key.
   * @returns A new Key instance.
   * @throws Error if the type is not found or invalid.
   */
  static createByType(source: string, typeID: TypeID): Key {
    const result = new Key();
    result.type = typeID;

    switch (result.type) {
      case TypeID.EraId:
        result.era = Era.fromJSON(source.replace(PrefixName.EraId, ''));

        break;
      case TypeID.Hash:
        result.hash = Hash.fromHex(source.replace(PrefixName.Hash, ''));
        break;
      case TypeID.URef:
        result.uRef = URef.fromString(source);
        break;
      case TypeID.Account:
        result.account = AccountHash.fromString(source);
        break;
      case TypeID.Transfer:
        result.transfer = TransferHash.fromJSON(source);
        break;
      case TypeID.DeployInfo:
        result.deploy = Hash.fromHex(source.replace(PrefixName.DeployInfo, ''));
        break;
      case TypeID.Balance:
        result.balance = Hash.fromHex(source.replace(PrefixName.Balance, ''));
        break;
      case TypeID.Bid:
        result.bid = AccountHash.fromString(source.replace(PrefixName.Bid, ''));
        break;
      case TypeID.Withdraw:
        result.withdraw = AccountHash.fromString(
          source.replace(PrefixName.Withdraw, '')
        );
        break;
      case TypeID.Dictionary:
        result.dictionary = Hash.fromHex(
          source.replace(PrefixName.Dictionary, '')
        );
        break;
      case TypeID.SystemContractRegistry:
        result.systemContactRegistry = Hash.fromHex(
          source.replace(PrefixName.SystemContractRegistry, '')
        );
        break;
      case TypeID.EraSummary:
        result.eraSummary = Hash.fromHex(
          source.replace(PrefixName.EraSummary, '')
        );
        break;
      case TypeID.Unbond:
        result.unbond = AccountHash.fromString(
          source.replace(PrefixName.Unbond, '')
        );
        break;
      case TypeID.ChainspecRegistry:
        result.chainspecRegistry = Hash.fromHex(
          source.replace(PrefixName.ChainspecRegistry, '')
        );
        break;
      case TypeID.ChecksumRegistry:
        result.checksumRegistry = Hash.fromHex(
          source.replace(PrefixName.ChecksumRegistry, '')
        );
        break;
      case TypeID.BidAddr:
        result.bidAddr = BidAddr.fromHex(
          source.replace(PrefixName.BidAddr, '')
        );
        break;
      case TypeID.Package:
        result.package = Hash.fromHex(source.replace(PrefixName.Package, ''));
        break;
      case TypeID.AddressableEntity:
        result.addressableEntity = EntityAddr.fromPrefixedString(
          source.replace(PrefixName.AddressableEntity, '')
        );
        break;
      case TypeID.ByteCode:
        result.byteCode = ByteCode.fromJSON(
          source.replace(PrefixName.ByteCode, '')
        );
        break;
      case TypeID.Message:
        result.message = MessageAddr.fromString(
          source.replace(PrefixName.Message, '')
        );
        break;
      case TypeID.NamedKey:
        result.namedKey = NamedKeyAddr.fromString(
          source.replace(PrefixName.NamedKey, '')
        );
        break;
      case TypeID.BlockGlobal:
        result.blockGlobal = BlockGlobalAddr.fromString(
          source.replace(PrefixName.BlockGlobal, '')
        );
        break;
      case TypeID.BalanceHold:
        result.balanceHold = BalanceHoldAddr.fromString(
          source.replace(PrefixName.BalanceHold, '')
        );
        break;
      case TypeID.EntryPoint:
        result.entryPoint = EntryPointAddr.fromString(
          source.replace(PrefixName.EntryPoint, '')
        );
        break;
      default:
        throw new Error(`type is not found -> source: ${source}`);
    }
    return result;
  }

  /**
   * Parses a Key instance from a string representation.
   * @param source - The string containing the key data.
   * @returns A new Key instance.
   * @throws Error if the format is invalid or unexpected.
   */
  static parseTypeByString(source: string): Key {
    const openBracketIndex = source.indexOf('(');
    if (openBracketIndex === -1) {
      throw new Error('invalid key format');
    }

    const typeIndexStart = 5;
    const keyTypeStr = source.slice(typeIndexStart, openBracketIndex);
    const keyValue = source.slice(openBracketIndex + 1, -1);
    const typeID = typeIDbyNames.get(keyTypeStr as KeyTypeName);
    if (typeID === undefined) {
      throw new Error('unexpected KeyType');
    }

    return Key.createByType(keyValue, typeID);
  }

  /**
   * Creates a new Key instance from a source string.
   * @param source - The string containing the key data.
   * @returns A new Key instance.
   * @throws Error if the prefix is not found or the source is invalid.
   */
  static newKey(source: string): Key {
    if (source.length === Hash.StringHashLen) {
      const defaultHash = Hash.fromHex(source);
      const result = new Key();
      result.type = TypeID.Hash;
      result.hash = defaultHash;
      return result;
    }

    if (source.startsWith('Key::')) {
      return Key.parseTypeByString(source);
    }

    if (source.startsWith('00') && source.length === Hash.StringHashLen + 2) {
      return Key.createByType(source.slice(2), TypeID.Account);
    }

    const prefix = Key.findPrefixByMap(source, keyIDbyPrefix);
    if (!prefix) {
      throw new Error(`prefix is not found, source: ${source}`);
    }

    return Key.createByType(source, keyIDbyPrefix.get(prefix)!);
  }
}

/**
 * Splits the array at a given index.
 * @param i - The index to split the array.
 * @param arr - The Uint8Array to split.
 * @returns A new Uint8Array from the start to index i.
 * @throws Error if the index is out of bounds.
 */
export const splitAt = (i: number, arr: Uint8Array) => {
  if (i > arr.length - 1) {
    throw new Error('Early end of stream when deserializing data.');
  }
  const clonedArray = new Uint8Array(arr);
  return [clonedArray.subarray(0, i), clonedArray.subarray(i)];
};
