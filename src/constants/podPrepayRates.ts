/**
 * 各 pay_asset 每区块预付（Planck）：仅在合约询价失败时作回退（见 useContractPrepayAutoFill）。
 * 正常情况由 Subnet::asset / level_price 与 Cloud::mint_interval 链上查询计算。
 */
const R = (s: string) => BigInt(s)

export const PREPAY_PLANCK_PER_BLOCK: Record<number, bigint> = {
  0: R('10'),
}

/** prepay = durationBlocks * perBlock * weightBps / 1000 ，weightBps 默认 1000（1.0） */
export function estimatePrepayPlanckString(
  durationBlocks: number,
  payAsset: number,
  weightBps: number,
): string {
  const per = PREPAY_PLANCK_PER_BLOCK[payAsset] ?? PREPAY_PLANCK_PER_BLOCK[0]
  const d = BigInt(Math.max(1, Math.floor(durationBlocks)))
  const w = BigInt(Math.max(1, Math.floor(weightBps)))
  const out = (d * per * w) / 1000n
  return (out > 0n ? out : 1n).toString()
}
