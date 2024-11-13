import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';
import { Hash } from './key';
import { Timestamp } from './Time';
import { Proposer } from './BlockProposer';
import { EraEnd, EraEndV1, EraEndV2 } from './EraEnd';
import {
  TransactionCategory,
  TransactionHash,
  TransactionVersion
} from './Transaction';
import { PublicKey } from './keypair';
import { HexBytes } from './HexBytes';

@jsonObject
export class Proof {
  @jsonMember(() => ({
    constructor: PublicKey,
    name: 'public_key',
    deserializer: (json: string) => PublicKey.fromJSON(json),
    serializer: (value: PublicKey) => value.toJSON()
  }))
  public publicKey: PublicKey;

  @jsonMember(() => ({
    name: 'signature',
    constructor: HexBytes,
    deserializer: (json: string) => HexBytes.fromJSON(json),
    serializer: (value: HexBytes) => value.toJSON()
  }))
  public signature: HexBytes;
}

@jsonObject
export class Block {
  @jsonMember(() => ({
    name: 'hash',
    constructor: Hash,
    deserializer: (json: string) => Hash.fromJSON(json),
    serializer: (value: Hash) => value.toJSON()
  }))
  public hash: Hash;

  @jsonMember({ name: 'height', constructor: Number })
  public height: number;

  @jsonMember(() => ({
    name: 'state_root_hash',
    constructor: Hash,
    deserializer: (json: string) => Hash.fromJSON(json),
    serializer: (value: Hash) => value.toJSON()
  }))
  public stateRootHash: Hash;

  @jsonMember(() => ({
    name: 'last_switch_block_hash',
    constructor: Hash,
    deserializer: (json: string) => (json ? Hash.fromJSON(json) : null),
    serializer: (value: Hash) => (value ? value.toJSON() : null),
    preserveNull: true
  }))
  public lastSwitchBlockHash: Hash | null;

  @jsonMember(() => ({
    name: 'parent_hash',
    constructor: Hash,
    deserializer: (json: string) => Hash.fromJSON(json),
    serializer: (value: Hash) => value.toJSON()
  }))
  public parentHash: Hash;

  @jsonMember({ name: 'era_id', constructor: Number })
  public eraID: number;

  @jsonMember(() => ({
    name: 'timestamp',
    constructor: Timestamp,
    deserializer: (json: string) => Timestamp.fromJSON(json),
    serializer: (value: Timestamp) => value.toJSON()
  }))
  public timestamp: Timestamp;

  @jsonMember(() => ({
    name: 'accumulated_seed',
    constructor: Hash,
    deserializer: (json: string) => {
      if (!json) return;

      return Hash.fromJSON(json);
    },
    serializer: (value: Hash) => {
      if (!value) return;

      return value.toJSON();
    }
  }))
  public accumulatedSeed?: Hash;

  @jsonMember({ name: 'random_bit', constructor: Boolean })
  public randomBit: boolean;

  @jsonMember({ name: 'current_gas_price', constructor: Number })
  public currentGasPrice: number;

  @jsonMember(() => ({
    name: 'proposer',
    constructor: Proposer,
    deserializer: (json: string) => Proposer.fromJSON(json),
    serializer: (value: Proposer) => value.toJSON()
  }))
  public proposer: Proposer;

  @jsonMember({ name: 'protocol_version', constructor: String })
  public protocolVersion?: string;

  @jsonMember(() => ({ name: 'era_end', constructor: EraEnd }))
  public eraEnd?: EraEnd;

  @jsonArrayMember(() => BlockTransaction, {
    name: 'transactions',
    deserializer: (json: string) => BlockTransaction.fromJSON(json)
  })
  public transactions: BlockTransaction[];

  @jsonArrayMember(Number, { name: 'rewarded_signatures' })
  public rewardedSignatures: number[];

  @jsonArrayMember(() => Proof, { name: 'proofs' })
  public proofs: Proof[];

  public originBlockV1?: BlockV1;

  public originBlockV2?: BlockV2;

  constructor(
    hash: Hash,
    height: number,
    stateRootHash: Hash,
    lastSwitchBlockHash: Hash | null,
    parentHash: Hash,
    eraID: number,
    timestamp: Timestamp,
    accumulatedSeed: Hash | undefined,
    randomBit: boolean,
    currentGasPrice: number,
    proposer: Proposer,
    protocolVersion: string | undefined,
    eraEnd: EraEnd | undefined,
    transactions: BlockTransaction[],
    rewardedSignatures: number[],
    proofs: Proof[],
    originBlockV1?: BlockV1,
    originBlockV2?: BlockV2
  ) {
    this.hash = hash;
    this.height = height;
    this.stateRootHash = stateRootHash;
    this.lastSwitchBlockHash = lastSwitchBlockHash;
    this.parentHash = parentHash;
    this.eraID = eraID;
    this.timestamp = timestamp;
    this.accumulatedSeed = accumulatedSeed;
    this.randomBit = randomBit;
    this.currentGasPrice = currentGasPrice;
    this.proposer = proposer;
    this.protocolVersion = protocolVersion;
    this.eraEnd = eraEnd;
    this.transactions = transactions;
    this.rewardedSignatures = rewardedSignatures;
    this.proofs = proofs;
    this.originBlockV1 = originBlockV1;
    this.originBlockV2 = originBlockV2;
  }

  getBlockV1(): BlockV1 | undefined {
    return this.originBlockV1;
  }

  getBlockV2(): BlockV2 | undefined {
    return this.originBlockV2;
  }

  static newBlockFromBlockWrapper(
    blockWrapper: BlockWrapper,
    proofs: Proof[]
  ): Block {
    if (blockWrapper.blockV1) {
      const block = Block.newBlockFromBlockV1(blockWrapper.blockV1);
      block.proofs = proofs;
      return block;
    } else if (blockWrapper.blockV2) {
      const blockV2 = blockWrapper.blockV2;
      return new Block(
        blockV2.hash,
        blockV2.header.height,
        blockV2.header.stateRootHash,
        blockV2.header.lastSwitchBlockHash,
        blockV2.header.parentHash,
        blockV2.header.eraID,
        blockV2.header.timestamp,
        blockV2.header.accumulatedSeed,
        blockV2.header.randomBit,
        blockV2.header.currentGasPrice,
        blockV2.header.proposer,
        blockV2.header.protocolVersion,
        EraEnd.fromV2(blockV2.header.eraEnd ?? null) ?? undefined,
        blockV2.body.transactions,
        blockV2.body.rewardedSignatures,
        proofs,
        undefined,
        blockV2
      );
    }
    throw new Error('BlockWrapper must contain either BlockV1 or BlockV2');
  }

  static newBlockFromBlockV1(blockV1: BlockV1): Block {
    const blockTransactions: BlockTransaction[] = [];

    for (const transferHash of blockV1.body.transferHashes) {
      blockTransactions.push(
        new BlockTransaction(
          TransactionCategory.Mint,
          TransactionVersion.Deploy,
          transferHash
        )
      );
    }

    for (const deployHash of blockV1.body.deployHashes) {
      blockTransactions.push(
        new BlockTransaction(
          TransactionCategory.Large,
          TransactionVersion.Deploy,
          deployHash
        )
      );
    }

    return new Block(
      blockV1.hash,
      blockV1.header.height,
      blockV1.header.stateRootHash,
      null,
      blockV1.header.parentHash,
      blockV1.header.eraID,
      blockV1.header.timestamp,
      blockV1.header.accumulatedSeed,
      blockV1.header.randomBit,
      1,
      blockV1.body.proposer,
      blockV1.header.protocolVersion,
      EraEnd.fromV1(blockV1.header.eraEnd ?? null) ?? undefined,
      blockTransactions,
      [],
      blockV1.proofs,
      blockV1
    );
  }
}

@jsonObject
export class BlockTransaction {
  @jsonMember({ name: 'category', constructor: Number })
  public category: TransactionCategory;

  @jsonMember({ name: 'version', constructor: Number })
  public version: TransactionVersion;

  @jsonMember(() => ({
    name: 'hash',
    constructor: Hash,
    deserializer: (json: string) => Hash.fromJSON(json),
    serializer: (value: Hash) => value.toJSON()
  }))
  public hash: Hash;

  constructor(
    category: TransactionCategory,
    version: TransactionVersion,
    hash: Hash
  ) {
    this.category = category;
    this.version = version;
    this.hash = hash;
  }

  public static fromJSON(data: any): BlockTransaction[] {
    // TODO custom serialization
    const source = {
      Mint: data['0'] || [],
      Auction: data['1'] || [],
      InstallUpgrade: data['2'] || [],
      Large: data['3'] || [],
      Medium: data['4'] || [],
      Small: data['5'] || []
    };

    const transactions: BlockTransaction[] = [];
    transactions.push(
      ...getBlockTransactionsFromTransactionHashes(
        source.Mint,
        TransactionCategory.Mint
      ),
      ...getBlockTransactionsFromTransactionHashes(
        source.Auction,
        TransactionCategory.Auction
      ),
      ...getBlockTransactionsFromTransactionHashes(
        source.InstallUpgrade,
        TransactionCategory.InstallUpgrade
      ),
      ...getBlockTransactionsFromTransactionHashes(
        source.Large,
        TransactionCategory.Large
      ),
      ...getBlockTransactionsFromTransactionHashes(
        source.Medium,
        TransactionCategory.Medium
      ),
      ...getBlockTransactionsFromTransactionHashes(
        source.Small,
        TransactionCategory.Small
      )
    );

    return transactions;
  }
}

function getBlockTransactionsFromTransactionHashes(
  hashes: TransactionHash[],
  category: TransactionCategory
): BlockTransaction[] {
  if (hashes.length === 0) {
    return [];
  }

  return hashes.map(hash => {
    const transactionHash = hash.transactionV1;

    if (!transactionHash) {
      throw new Error('Invalid TransactionHash: transactionV1 is undefined');
    }

    return new BlockTransaction(
      category,
      TransactionVersion.V1,
      transactionHash
    );
  });
}

export function parseBlockTransactions(data: string): BlockTransaction[] {
  const source = JSON.parse(data) as {
    '0'?: TransactionHash[];
    '1'?: TransactionHash[];
    '2'?: TransactionHash[];
    '3'?: TransactionHash[];
    '4'?: TransactionHash[];
    '5'?: TransactionHash[];
  };

  const result: BlockTransaction[] = [];
  if (source['0'])
    result.push(
      ...getBlockTransactionsFromTransactionHashes(
        source['0'],
        TransactionCategory.Mint
      )
    );
  if (source['1'])
    result.push(
      ...getBlockTransactionsFromTransactionHashes(
        source['1'],
        TransactionCategory.Auction
      )
    );
  if (source['2'])
    result.push(
      ...getBlockTransactionsFromTransactionHashes(
        source['2'],
        TransactionCategory.InstallUpgrade
      )
    );
  if (source['3'])
    result.push(
      ...getBlockTransactionsFromTransactionHashes(
        source['3'],
        TransactionCategory.Large
      )
    );
  if (source['4'])
    result.push(
      ...getBlockTransactionsFromTransactionHashes(
        source['4'],
        TransactionCategory.Medium
      )
    );
  if (source['5'])
    result.push(
      ...getBlockTransactionsFromTransactionHashes(
        source['5'],
        TransactionCategory.Small
      )
    );

  return result;
}

@jsonObject
export class BlockV1 {
  @jsonMember(() => ({
    name: 'hash',
    constructor: Hash,
    deserializer: (json: string) => Hash.fromJSON(json),
    serializer: (value: Hash) => value.toJSON()
  }))
  public hash: Hash;

  @jsonMember({ name: 'header', constructor: () => BlockHeaderV1 })
  public header: BlockHeaderV1;

  @jsonMember({ name: 'body', constructor: () => BlockBodyV1 })
  public body: BlockBodyV1;

  @jsonArrayMember(Proof, { name: 'proofs' })
  public proofs: Proof[];
}

@jsonObject
export class BlockBodyV1 {
  @jsonArrayMember(() => Hash, {
    name: 'deploy_hashes',
    serializer: (value: Hash[]) => value.map(it => it.toJSON()),
    deserializer: (json: any) => json.map((it: string) => Hash.fromJSON(it))
  })
  public deployHashes: Hash[];

  @jsonMember(() => ({
    name: 'proposer',
    constructor: Proposer,
    deserializer: (json: string) => Proposer.fromJSON(json),
    serializer: (value: Proposer) => value.toJSON()
  }))
  public proposer: Proposer;

  @jsonArrayMember(() => Hash, {
    name: 'transfer_hashes',
    serializer: (value: Hash[]) => value.map(it => it.toJSON()),
    deserializer: (json: any) => json.map((it: string) => Hash.fromJSON(it))
  })
  public transferHashes: Hash[];
}

@jsonObject
export class BlockV2 {
  @jsonMember(() => ({
    name: 'hash',
    constructor: Hash,
    deserializer: (json: string) => Hash.fromJSON(json),
    serializer: (value: Hash) => value.toJSON()
  }))
  public hash: Hash;

  @jsonMember({ name: 'header', constructor: () => BlockHeaderV2 })
  public header: BlockHeaderV2;

  @jsonMember({ name: 'body', constructor: () => BlockBodyV2 })
  public body: BlockBodyV2;
}

@jsonObject
export class BlockHeaderV1 {
  @jsonMember(() => ({
    name: 'accumulated_seed',
    constructor: Hash,
    deserializer: (json: string) => {
      if (!json) return;
      return Hash.fromJSON(json);
    },
    serializer: (value: Hash) => {
      if (!value) return;
      return value.toJSON();
    }
  }))
  public accumulatedSeed?: Hash;

  @jsonMember(() => ({
    name: 'body_hash',
    constructor: Hash,
    deserializer: (json: string) => Hash.fromJSON(json),
    serializer: (value: Hash) => value.toJSON()
  }))
  public bodyHash: Hash;

  @jsonMember({ name: 'era_id', constructor: Number })
  public eraID: number;

  @jsonMember({ name: 'height', constructor: Number })
  public height: number;

  @jsonMember(() => ({
    name: 'parent_hash',
    constructor: Hash,
    deserializer: (json: string) => Hash.fromJSON(json),
    serializer: (value: Hash) => value.toJSON()
  }))
  public parentHash: Hash;

  @jsonMember({ name: 'protocol_version', constructor: String })
  public protocolVersion?: string;

  @jsonMember({ name: 'random_bit', constructor: Boolean })
  public randomBit: boolean;

  @jsonMember(() => ({
    name: 'state_root_hash',
    constructor: Hash,
    deserializer: (json: string) => Hash.fromJSON(json),
    serializer: (value: Hash) => value.toJSON()
  }))
  public stateRootHash: Hash;

  @jsonMember(() => ({
    name: 'timestamp',
    constructor: Timestamp,
    deserializer: (json: string) => Timestamp.fromJSON(json),
    serializer: (value: Timestamp) => value.toJSON()
  }))
  public timestamp: Timestamp;

  @jsonMember(() => ({ name: 'era_end', constructor: EraEndV1 }))
  public eraEnd?: EraEndV1;
}

@jsonObject
export class BlockHeaderV2 {
  @jsonMember(() => ({
    name: 'accumulated_seed',
    constructor: Hash,
    deserializer: (json: string) => {
      if (!json) return;
      return Hash.fromJSON(json);
    },
    serializer: (value: Hash) => {
      if (!value) return;
      return value.toJSON();
    }
  }))
  public accumulatedSeed?: Hash;

  @jsonMember(() => ({
    name: 'body_hash',
    constructor: Hash,
    deserializer: (json: string) => Hash.fromJSON(json),
    serializer: (value: Hash) => value.toJSON()
  }))
  public bodyHash: Hash;

  @jsonMember({ name: 'era_id', constructor: Number })
  public eraID: number;

  @jsonMember({ name: 'current_gas_price', constructor: Number })
  public currentGasPrice: number;

  @jsonMember({ name: 'height', constructor: Number })
  public height: number;

  @jsonMember(() => ({
    name: 'parent_hash',
    constructor: Hash,
    deserializer: (json: string) => Hash.fromJSON(json),
    serializer: (value: Hash) => value.toJSON()
  }))
  public parentHash: Hash;

  @jsonMember(() => ({
    name: 'proposer',
    constructor: Proposer,
    deserializer: (json: string) => Proposer.fromJSON(json),
    serializer: (value: Proposer) => value.toJSON()
  }))
  public proposer: Proposer;

  @jsonMember({ name: 'protocol_version', constructor: String })
  public protocolVersion?: string;

  @jsonMember({ name: 'random_bit', constructor: Boolean })
  public randomBit: boolean;

  @jsonMember(() => ({
    name: 'state_root_hash',
    constructor: Hash,
    deserializer: (json: string) => Hash.fromJSON(json),
    serializer: (value: Hash) => value.toJSON()
  }))
  public stateRootHash: Hash;

  @jsonMember(() => ({
    name: 'last_switch_block_hash',
    constructor: Hash,
    deserializer: (json: string) => Hash.fromJSON(json),
    serializer: (value: Hash) => value.toJSON()
  }))
  public lastSwitchBlockHash: Hash;

  @jsonMember(() => ({
    name: 'timestamp',
    constructor: Timestamp,
    deserializer: (json: string) => Timestamp.fromJSON(json),
    serializer: (value: Timestamp) => value.toJSON()
  }))
  public timestamp: Timestamp;

  @jsonMember(() => ({ name: 'era_end', constructor: EraEndV2 }))
  public eraEnd?: EraEndV2;
}

@jsonObject
export class BlockBodyV2 {
  @jsonArrayMember(BlockTransaction, {
    name: 'transactions',
    deserializer: (json: any) =>
      json.map((it: string) => BlockTransaction.fromJSON(it))
  })
  public transactions: BlockTransaction[];

  @jsonArrayMember(Number, { name: 'rewarded_signatures' })
  public rewardedSignatures: number[];
}

@jsonObject
export class BlockWrapper {
  @jsonMember({ name: 'Version1', constructor: BlockV1 })
  public blockV1?: BlockV1;

  @jsonMember({ name: 'Version2', constructor: BlockV2 })
  public blockV2?: BlockV2;
}

@jsonObject
export class BlockWithSignatures {
  @jsonMember({ name: 'block', constructor: BlockWrapper })
  public block: BlockWrapper;

  @jsonArrayMember(Proof, { name: 'proofs' })
  public proofs: Proof[];
}

@jsonObject
export class BlockHeaderWrapper {
  @jsonMember({ name: 'Version1', constructor: BlockHeaderV1 })
  public blockHeaderV1?: BlockHeaderV1;

  @jsonMember({ name: 'Version2', constructor: BlockHeaderV2 })
  public blockHeaderV2?: BlockHeaderV2;
}

@jsonObject
export class BlockHeader {
  @jsonMember(() => ({
    name: 'accumulated_seed',
    constructor: Hash,
    deserializer: (json: string) => {
      if (!json) return;
      return Hash.fromJSON(json);
    },
    serializer: (value: Hash) => {
      if (!value) return;
      return value.toJSON();
    }
  }))
  public accumulatedSeed?: Hash;

  @jsonMember(() => ({
    name: 'body_hash',
    constructor: Hash,
    deserializer: (json: string) => Hash.fromJSON(json),
    serializer: (value: Hash) => value.toJSON()
  }))
  public bodyHash: Hash;

  @jsonMember({ name: 'era_id', constructor: Number })
  public eraID: number;

  @jsonMember({ name: 'current_gas_price', constructor: Number })
  public currentGasPrice: number;

  @jsonMember({ name: 'height', constructor: Number })
  public height: number;

  @jsonMember(() => ({
    name: 'parent_hash',
    constructor: Hash,
    deserializer: (json: string) => Hash.fromJSON(json),
    serializer: (value: Hash) => value.toJSON()
  }))
  public parentHash: Hash;

  @jsonMember(() => ({
    name: 'proposer',
    constructor: Proposer,
    deserializer: (json: string) => Proposer.fromJSON(json),
    serializer: (value: Proposer) => value.toJSON()
  }))
  public proposer: Proposer;

  @jsonMember({ name: 'protocol_version', constructor: String })
  public protocolVersion?: string;

  @jsonMember({ name: 'random_bit', constructor: Boolean })
  public randomBit: boolean;

  @jsonMember(() => ({
    name: 'state_root_hash',
    constructor: Hash,
    deserializer: (json: string) => Hash.fromJSON(json),
    serializer: (value: Hash) => value.toJSON()
  }))
  public stateRootHash: Hash;

  @jsonMember(() => ({
    name: 'timestamp',
    constructor: Timestamp,
    deserializer: (json: string) => Timestamp.fromJSON(json),
    serializer: (value: Timestamp) => value.toJSON()
  }))
  public timestamp: Timestamp;

  @jsonMember(() => ({ name: 'era_end', constructor: EraEnd }))
  public eraEnd?: EraEnd | null;

  private originBlockHeaderV1?: BlockHeaderV1;
  private originBlockHeaderV2?: BlockHeaderV2;

  public getBlockHeaderV1(): BlockHeaderV1 | undefined {
    return this.originBlockHeaderV1;
  }

  public getBlockHeaderV2(): BlockHeaderV2 | undefined {
    return this.originBlockHeaderV2;
  }

  static newBlockHeaderFromV1(header: BlockHeaderV1): BlockHeader {
    const blockHeader = new BlockHeader();
    blockHeader.accumulatedSeed = header.accumulatedSeed;
    blockHeader.bodyHash = header.bodyHash;
    blockHeader.eraID = header.eraID;
    blockHeader.currentGasPrice = 1;
    blockHeader.height = header.height;
    blockHeader.parentHash = header.parentHash;
    blockHeader.protocolVersion = header.protocolVersion;
    blockHeader.randomBit = header.randomBit;
    blockHeader.stateRootHash = header.stateRootHash;
    blockHeader.timestamp = header.timestamp;
    blockHeader.eraEnd = header.eraEnd
      ? EraEnd.fromV1(header.eraEnd)
      : undefined;
    blockHeader['originBlockHeaderV1'] = header;
    return blockHeader;
  }

  static newBlockHeaderFromV2(header: BlockHeaderV2): BlockHeader {
    const blockHeader = new BlockHeader();
    blockHeader.accumulatedSeed = header.accumulatedSeed;
    blockHeader.bodyHash = header.bodyHash;
    blockHeader.eraID = header.eraID;
    blockHeader.currentGasPrice = header.currentGasPrice;
    blockHeader.height = header.height;
    blockHeader.parentHash = header.parentHash;
    blockHeader.proposer = header.proposer;
    blockHeader.protocolVersion = header.protocolVersion;
    blockHeader.randomBit = header.randomBit;
    blockHeader.stateRootHash = header.stateRootHash;
    blockHeader.timestamp = header.timestamp;
    blockHeader.eraEnd = header.eraEnd
      ? EraEnd.fromV2(header.eraEnd)
      : undefined;
    blockHeader['originBlockHeaderV2'] = header;
    return blockHeader;
  }
}
