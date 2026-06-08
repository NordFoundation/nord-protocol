import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { fuse } from 'viem/chains'

export const CHAIN = fuse

export function getPublicClient() {
  return createPublicClient({ chain: CHAIN, transport: http() })
}

export function getWalletClient(address: `0x${string}`) {
  return createWalletClient({ chain: CHAIN, transport: custom(window.ethereum!), account: address })
}
