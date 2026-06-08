import { useCallback } from 'react'
import { getPublicClient, getWalletClient } from '../config/chains'
import { FACTORY_ADDRESS, ROUTER_ADDRESS, FACTORY_ABI, ROUTER_ABI, PAIR_ABI, ERC20_ABI } from '../config/contracts'
import { fromWei } from '../utils/format'

export function useContract() {
  const publicClient = getPublicClient()

  const getReserves = useCallback(async (pairAddress: `0x${string}`) => {
    const [r0, r1] = await publicClient.readContract({ address: pairAddress, abi: PAIR_ABI, functionName: 'getReserves' })
    return { reserve0: r0, reserve1: r1 }
  }, [publicClient])

  const getAmountsOut = useCallback(async (amountIn: bigint, path: `0x${string}`[]) => {
    try {
      return await publicClient.readContract({ address: ROUTER_ADDRESS, abi: ROUTER_ABI, functionName: 'getAmountsOut', args: [amountIn, path] })
    } catch { return [] }
  }, [publicClient])

  const getBalance = useCallback(async (token: `0x${string}`, account: `0x${string}`, decimals = 18) => {
    try {
      const bal = await publicClient.readContract({ address: token, abi: ERC20_ABI, functionName: 'balanceOf', args: [account] })
      return fromWei(bal as bigint, decimals)
    } catch { return '0' }
  }, [publicClient])

  const getAllowance = useCallback(async (token: `0x${string}`, owner: `0x${string}`, spender: `0x${string}`) => {
    try {
      return await publicClient.readContract({ address: token, abi: ERC20_ABI, functionName: 'allowance', args: [owner, spender] })
    } catch { return 0n }
  }, [publicClient])

  const approve = useCallback(async (token: `0x${string}`, spender: `0x${string}`, amount: bigint, account: `0x${string}`) => {
    const walletClient = getWalletClient(account)
    const hash = await walletClient.writeContract({ address: token, abi: ERC20_ABI, functionName: 'approve', args: [spender, amount], account: account as any })
    return publicClient.waitForTransactionReceipt({ hash })
  }, [publicClient])

  const swap = useCallback(async (amountIn: bigint, amountOutMin: bigint, path: `0x${string}`[], to: `0x${string}`, deadline: bigint, account: `0x${string}`) => {
    const walletClient = getWalletClient(account)
    const hash = await walletClient.writeContract({
      address: ROUTER_ADDRESS, abi: ROUTER_ABI, functionName: 'swapExactTokensForTokens',
      args: [amountIn, amountOutMin, path, to, deadline], account: account as any
    })
    return publicClient.waitForTransactionReceipt({ hash })
  }, [publicClient])

  const addLiquidity = useCallback(async (tokenA: `0x${string}`, tokenB: `0x${string}`, amountADesired: bigint, amountBDesired: bigint, amountAMin: bigint, amountBMin: bigint, to: `0x${string}`, deadline: bigint, account: `0x${string}`) => {
    const walletClient = getWalletClient(account)
    const hash = await walletClient.writeContract({
      address: ROUTER_ADDRESS, abi: ROUTER_ABI, functionName: 'addLiquidity',
      args: [tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline], account: account as any
    })
    return publicClient.waitForTransactionReceipt({ hash })
  }, [publicClient])

  const createPair = useCallback(async (tokenA: `0x${string}`, tokenB: `0x${string}`, account: `0x${string}`) => {
    const walletClient = getWalletClient(account)
    const hash = await walletClient.writeContract({
      address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: 'createPair',
      args: [tokenA, tokenB], account: account as any
    })
    return publicClient.waitForTransactionReceipt({ hash })
  }, [publicClient])

  return { getReserves, getAmountsOut, getBalance, getAllowance, approve, swap, addLiquidity, createPair }
}
