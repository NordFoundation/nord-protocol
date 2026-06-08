import { useCallback } from 'react'
import { useStore } from '../store'
import { getPublicClient, getWalletClient } from '../config/chains'
import { FACTORY_ADDRESS, ROUTER_ADDRESS, FACTORY_ABI, ROUTER_ABI, PAIR_ABI, ERC20_ABI } from '../config/contracts'
import { fromWei } from '../utils/format'

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)) }

export function useContract() {
  const demoMode = useStore((s) => s.demoMode)
  const publicClient = getPublicClient()

  const getReserves = useCallback(async (pairAddress: `0x${string}`) => {
    if (demoMode) return { reserve0: 10000000000000000000000n, reserve1: 5000000000000000000000n }
    const [r0, r1] = await publicClient.readContract({ address: pairAddress, abi: PAIR_ABI, functionName: 'getReserves' })
    return { reserve0: r0, reserve1: r1 }
  }, [publicClient, demoMode])

  const getAmountsOut = useCallback(async (amountIn: bigint, path: `0x${string}`[]) => {
    if (demoMode) {
      const mid = amountIn * 5000n / 10000n
      return [amountIn, mid]
    }
    try {
      return await publicClient.readContract({ address: ROUTER_ADDRESS, abi: ROUTER_ABI, functionName: 'getAmountsOut', args: [amountIn, path] })
    } catch { return [] }
  }, [publicClient, demoMode])

  const getBalance = useCallback(async (token: `0x${string}`, account: `0x${string}`, decimals = 18) => {
    if (demoMode) return '10000'
    try {
      const bal = await publicClient.readContract({ address: token, abi: ERC20_ABI, functionName: 'balanceOf', args: [account] })
      return fromWei(bal as bigint, decimals)
    } catch { return '0' }
  }, [publicClient, demoMode])

  const getAllowance = useCallback(async (token: `0x${string}`, owner: `0x${string}`, spender: `0x${string}`) => {
    if (demoMode) return BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')
    try {
      return await publicClient.readContract({ address: token, abi: ERC20_ABI, functionName: 'allowance', args: [owner, spender] })
    } catch { return 0n }
  }, [publicClient, demoMode])

  const approve = useCallback(async (token: `0x${string}`, spender: `0x${string}`, amount: bigint, account: `0x${string}`) => {
    if (demoMode) { await delay(1200); return { status: 'success', transactionHash: '0x' + 'a'.repeat(64) } as any }
    const walletClient = getWalletClient(account)
    const hash = await walletClient.writeContract({ address: token, abi: ERC20_ABI, functionName: 'approve', args: [spender, amount], account: account as any })
    return publicClient.waitForTransactionReceipt({ hash })
  }, [publicClient, demoMode])

  const swap = useCallback(async (amountIn: bigint, amountOutMin: bigint, path: `0x${string}`[], to: `0x${string}`, deadline: bigint, account: `0x${string}`) => {
    if (demoMode) { await delay(1500); return { status: 'success', transactionHash: '0x' + 'b'.repeat(64) } as any }
    const walletClient = getWalletClient(account)
    const hash = await walletClient.writeContract({
      address: ROUTER_ADDRESS, abi: ROUTER_ABI, functionName: 'swapExactTokensForTokens',
      args: [amountIn, amountOutMin, path, to, deadline], account: account as any
    })
    return publicClient.waitForTransactionReceipt({ hash })
  }, [publicClient, demoMode])

  const addLiquidity = useCallback(async (tokenA: `0x${string}`, tokenB: `0x${string}`, amountADesired: bigint, amountBDesired: bigint, amountAMin: bigint, amountBMin: bigint, to: `0x${string}`, deadline: bigint, account: `0x${string}`) => {
    if (demoMode) { await delay(1500); return { status: 'success', transactionHash: '0x' + 'c'.repeat(64) } as any }
    const walletClient = getWalletClient(account)
    const hash = await walletClient.writeContract({
      address: ROUTER_ADDRESS, abi: ROUTER_ABI, functionName: 'addLiquidity',
      args: [tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline], account: account as any
    })
    return publicClient.waitForTransactionReceipt({ hash })
  }, [publicClient, demoMode])

  const createPair = useCallback(async (tokenA: `0x${string}`, tokenB: `0x${string}`, account: `0x${string}`) => {
    if (demoMode) { await delay(1000); return { status: 'success', transactionHash: '0x' + 'd'.repeat(64) } as any }
    const walletClient = getWalletClient(account)
    const hash = await walletClient.writeContract({
      address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: 'createPair',
      args: [tokenA, tokenB], account: account as any
    })
    return publicClient.waitForTransactionReceipt({ hash })
  }, [publicClient, demoMode])

  return { getReserves, getAmountsOut, getBalance, getAllowance, approve, swap, addLiquidity, createPair }
}
