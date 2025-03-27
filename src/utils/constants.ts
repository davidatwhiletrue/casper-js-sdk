import { CasperNetworkName } from '../@types';

export const AuctionManagerContractHashMap: Record<
  CasperNetworkName,
  string
> = {
  [CasperNetworkName.Mainnet]:
    'ccb576d6ce6dec84a551e48f0d0b7af89ddba44c7390b690036257a04a3ae9ea',
  [CasperNetworkName.Testnet]:
    '93d923e336b20a4c4ca14d592b60e5bd3fe330775618290104f9beb326db7ae2',
  [CasperNetworkName.Integration]:
    'e22d38bcf3454a93face78a353feaccbf1d637d1ef9ef2e061a655728ff59bbe',
  [CasperNetworkName.DevNet]:
    '93d923e336b20a4c4ca14d592b60e5bd3fe330775618290104f9beb326db7ae2'
};

export const DEFAULT_MINIMUM_DELEGATION_AMOUNT =
  BigInt(500) * BigInt(1_000_000_000);
export const DEFAULT_MAXIMUM_DELEGATION_AMOUNT =
  BigInt(1_000_000_000) * BigInt(1_000_000_000);
