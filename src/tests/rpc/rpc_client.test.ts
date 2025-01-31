import { TypedJSON } from 'typedjson';
import { expect } from 'chai';

import {
  ChainGetBlockResult,
  ChainGetBlockResultV1Compatible,
  InfoGetStatusResult,
  InfoGetTransactionResultV1Compatible
} from '../../rpc';
import { BlockBodyV2 } from '../../types';
import {
  getBlockByHashJson,
  getStatusJson,
  infoGetTransactionResultV1Json
} from '../data';

describe('RPC Client', () => {
  it('should be able to parse getTransactionByTransactionHash response', () => {
    const serializer = new TypedJSON(InfoGetTransactionResultV1Compatible);
    const result = serializer.parse(infoGetTransactionResultV1Json.result)!;
    result.rawJSON = infoGetTransactionResultV1Json.result;

    const txResult = InfoGetTransactionResultV1Compatible.newInfoGetTransactionResultFromV1Compatible(
      result,
      result.rawJSON
    );

    expect(txResult).to.be.not.undefined;
    expect(txResult).to.be.not.empty;
    expect(
      txResult.executionInfo?.executionResult.initiator.publicKey?.toHex()
    ).to.deep.equal(
      infoGetTransactionResultV1Json.result.deploy.header.account
    );
    expect(
      txResult.executionInfo?.executionResult.transfers[0].transactionHash.toString()
    ).to.deep.equal(txResult.transaction.hash.toHex());
  });

  it('Should process RPC.getBlockByHash response', () => {
    const serializer = new TypedJSON(ChainGetBlockResultV1Compatible);
    const result = serializer.parse(getBlockByHashJson.result)!;
    result.rawJSON = getBlockByHashJson.result;

    const ser = new TypedJSON(BlockBodyV2);
    const blockV2BodyJson = JSON.stringify(
      ser.toPlainJson(result.blockWithSignatures!.block.blockV2!.body)
    );

    const blockResult = ChainGetBlockResult.newChainGetBlockResultFromV1Compatible(
      result,
      result.rawJSON
    );
    blockResult.rawJSON = getBlockByHashJson.result;

    expect(blockResult).to.be.not.undefined;
    expect(blockResult).to.be.not.empty;
    expect(blockResult.block?.hash.toHex()).to.deep.equal(
      getBlockByHashJson.result.block_with_signatures.block.Version2.hash
    );
    expect(
      result.blockWithSignatures?.block.blockV2?.hash?.toHex()
    ).to.deep.equal(
      getBlockByHashJson.result.block_with_signatures.block.Version2.hash
    );
    expect(blockV2BodyJson).to.equal(
      JSON.stringify(
        getBlockByHashJson.result.block_with_signatures.block.Version2.body
      )
    );
  });

  it('should be able to parse getStatus response', () => {
    const serializer = new TypedJSON(InfoGetStatusResult);
    const result = serializer.parse(getStatusJson.result)!;
    result.rawJSON = getStatusJson.result;

    expect(result).to.be.not.undefined;
    expect(result).to.be.not.empty;
    expect(result.rawJSON).to.deep.equal(getStatusJson.result);
    expect(result.protocolVersion).to.deep.equal(
      getStatusJson.result.protocol_version
    );
    expect(result.buildVersion).to.deep.equal(
      getStatusJson.result.build_version
    );
    expect(result.chainSpecName).to.deep.equal(
      getStatusJson.result.chainspec_name
    );
    expect(result.lastAddedBlockInfo.hash.toHex()).to.deep.equal(
      getStatusJson.result.last_added_block_info.hash
    );
    expect(result.lastAddedBlockInfo.creator.toHex()).to.deep.equal(
      getStatusJson.result.last_added_block_info.creator
    );
    expect(result.lastAddedBlockInfo.eraID).to.deep.equal(
      getStatusJson.result.last_added_block_info.era_id
    );
    expect(result.lastAddedBlockInfo.stateRootHash.toHex()).to.deep.equal(
      getStatusJson.result.last_added_block_info.state_root_hash
    );
    expect(result.lastAddedBlockInfo.height).to.deep.equal(
      getStatusJson.result.last_added_block_info.height
    );
    expect(result.ourPublicSigningKey).to.deep.equal(
      getStatusJson.result.our_public_signing_key
    );
    expect(result.latestSwitchBlockHash.toHex()).to.deep.equal(
      getStatusJson.result.latest_switch_block_hash
    );
    expect(result.lastProgress.toJSON()).to.deep.equal(
      getStatusJson.result.last_progress
    );
    expect(result.blockSync.forward?.blockHash?.toHex()).to.deep.equal(
      getStatusJson.result.block_sync.forward.block_hash
    );
    expect(result.blockSync.forward?.blockHeight).to.deep.equal(
      getStatusJson.result.block_sync.forward.block_height
    );
    expect(result.blockSync.forward?.acquisitionState).to.deep.equal(
      getStatusJson.result.block_sync.forward.acquisition_state
    );
    expect(result.blockSync.historical?.acquisitionState).to.deep.equal(
      getStatusJson.result.block_sync.historical.acquisition_state
    );
    expect(result.blockSync.historical?.blockHeight).to.deep.equal(
      getStatusJson.result.block_sync.historical.block_height
    );
    expect(result.blockSync.historical?.blockHash?.toHex()).to.deep.equal(
      getStatusJson.result.block_sync.historical.block_hash
    );
  });
});
