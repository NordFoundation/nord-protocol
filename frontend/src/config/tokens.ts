export interface TokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
  logo: string
  verified: boolean
}

export const DEFAULT_TOKENS: TokenInfo[] = [
  { address: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629', symbol: 'WFUSE', name: 'Wrapped Fuse', decimals: 18, logo: '🔵', verified: true },
  { address: '0x620fd5fa1BE2af32c40aCb8a1D1C4662a0B0b8e4', symbol: 'USDC', name: 'USD Coin', decimals: 6, logo: '💲', verified: true },
  { address: '0x8a91E08bCcD0F5cD63cD7B26F3F8bEA6c53E1e5c', symbol: 'BUSD', name: 'Binance USD', decimals: 18, logo: '🟡', verified: true },
  { address: '0x0000000000000000000000000000000000000000', symbol: 'NORD', name: 'Nord Protocol', decimals: 18, logo: '💎', verified: true },
]

export const POPULAR_TOKENS = ['WFUSE', 'USDC', 'BUSD', 'NORD']