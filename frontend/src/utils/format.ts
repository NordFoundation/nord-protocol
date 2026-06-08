export function formatAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

export function formatNumber(n: string | number, decimals = 4): string {
  const num = typeof n === 'string' ? parseFloat(n) : n
  if (isNaN(num)) return '0'
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
  return num.toFixed(decimals)
}

export function fromWei(value: bigint, decimals = 18): string {
  const divisor = 10n ** BigInt(decimals)
  const intPart = value / divisor
  const fracPart = value % divisor
  const fracStr = fracPart.toString().padStart(decimals, '0').slice(0, 6)
  return intPart.toString() + '.' + fracStr
}

export function toWei(value: string, decimals = 18): bigint {
  const parts = value.split('.')
  const intPart = parts[0] || '0'
  const fracPart = (parts[1] || '').padEnd(decimals, '0').slice(0, decimals)
  return BigInt(intPart + fracPart) * (decimals > 0 ? 1n : 10n ** BigInt(-decimals))
}