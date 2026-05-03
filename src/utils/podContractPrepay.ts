/**
 * 与链上 Cloud::mint_pod / Subnet 定价一致的前端估算（Subnet level_price + asset 价格 + Cloud mint_interval）。
 */

export type TeeFlavor = 'SGX' | 'CVM'

export type PodPrepayDiskRef = { id: string | number }

export type PodPrepayContainer = {
  cpu: number
  mem: number
  gpu: number
  disk: PodPrepayDiskRef[]
}

export type PodPrepayEstimateInput = {
  teeType: TeeFlavor
  level: number
  payAsset: number
  durationBlocks: number
  containers: PodPrepayContainer[]
  /** 磁盘 id -> 容量（GB），与合约 disk.size() 一致 */
  diskGb: (id: string | number) => bigint
}

export type RunPriceFields = {
  cpuPer: bigint
  cvmCpuPer: bigint
  memoryPer: bigint
  cvmMemoryPer: bigint
  diskPer: bigint
  gpuPer: bigint
}

export function humanToBigInt(v: unknown): bigint {
  if (v == null || v === '') return 0n
  if (typeof v === 'bigint') return v
  if (typeof v === 'number' && Number.isFinite(v)) return BigInt(Math.trunc(v))
  const s = String(v).replace(/,/g, '').trim()
  if (!s) return 0n
  try {
    return BigInt(s)
  } catch {
    return 0n
  }
}

/** Ink Result<T> 的 Ok 载荷 */
export function unwrapInkOk(dry: unknown): unknown {
  if (!dry || typeof dry !== 'object') return undefined
  const o = dry as Record<string, unknown>
  if ('Err' in o && o.Err) return undefined
  if ('Ok' in o) return o.Ok
  return dry
}

/** Option::Some */
export function unwrapInkSome(inner: unknown): unknown {
  if (!inner || typeof inner !== 'object') return inner
  const o = inner as Record<string, unknown>
  if ('Some' in o) return o.Some
  if ('None' in o) return undefined
  return inner
}

export function runPriceFromInkHuman(inner: unknown): RunPriceFields | null {
  const v = unwrapInkSome(unwrapInkOk(inner))
  if (!v || typeof v !== 'object') return null
  const r = v as Record<string, unknown>
  const n = (snake: string, camel: string) => humanToBigInt(r[snake] ?? r[camel])
  const out: RunPriceFields = {
    cpuPer: n('cpu_per', 'cpuPer'),
    cvmCpuPer: n('cvm_cpu_per', 'cvmCpuPer'),
    memoryPer: n('memory_per', 'memoryPer'),
    cvmMemoryPer: n('cvm_memory_per', 'cvmMemoryPer'),
    diskPer: n('disk_per', 'diskPer'),
    gpuPer: n('gpu_per', 'gpuPer'),
  }
  return out
}

/** asset(id) -> Option<(AssetInfo, U256)> 的单价（第二元） */
export function assetPriceFromInkHuman(inner: unknown): bigint | null {
  const v = unwrapInkSome(unwrapInkOk(inner))
  if (v == null) return null
  if (Array.isArray(v) && v.length >= 2) {
    const p = humanToBigInt(v[1])
    return p > 0n ? p : null
  }
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>
    if ('1' in o) {
      const p = humanToBigInt(o['1'])
      return p > 0n ? p : null
    }
  }
  return null
}

export function mintIntervalFromInkHuman(dry: unknown): number {
  if (dry == null) return 0
  const v = unwrapInkOk(dry)
  const n = Number(humanToBigInt(v))
  return n > 0 ? n : 0
}

/** 单段 mint_interval 内的资源计价（与 ink Cloud::mint_pod 中 u64 求和一致，再在外层 *1000/price） */
export function perMintResourceAbstractU64(
  teeType: TeeFlavor,
  containers: PodPrepayContainer[],
  lp: RunPriceFields,
  diskGb: (id: string | number) => bigint,
): bigint {
  let sum = 0n
  for (const c of containers) {
    const cpu = BigInt(Math.max(0, Math.trunc(Number(c.cpu) || 0)))
    const mem = BigInt(Math.max(0, Math.trunc(Number(c.mem) || 0)))
    const gpu = BigInt(Math.max(0, Math.trunc(Number(c.gpu) || 0)))
    let diskCost = 0n
    for (const d of c.disk || []) {
      const gb = diskGb(d.id)
      diskCost += gb * lp.diskPer
    }
    const base =
      teeType === 'SGX'
        ? cpu * lp.cpuPer + mem * lp.memoryPer
        : cpu * lp.cvmCpuPer + mem * lp.cvmMemoryPer
    const gpuCost = gpu * lp.gpuPer
    sum += base + gpuCost + diskCost
  }
  return sum
}

/**
 * 与 mint_pod 一致：每段 (abstract * 1000 / assetPrice)，再按租期覆盖的计费段数（ceil(duration/mint_interval)）累乘。
 */
export function totalPrepayPlanckFromContract(
  abstractPerMint: bigint,
  assetPrice: bigint,
  durationBlocks: number,
  mintInterval: number,
): bigint {
  if (assetPrice <= 0n || mintInterval <= 0) return 0n
  const d = BigInt(Math.max(1, Math.floor(durationBlocks)))
  const iv = BigInt(mintInterval)
  const periods = (d + iv - 1n) / iv
  const perPeriod = (abstractPerMint * 1000n) / assetPrice
  const out = perPeriod * periods
  return out > 0n ? out : 0n
}
