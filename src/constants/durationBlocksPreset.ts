/** 链上出块间隔（秒/区块），用于「天/月」与区块数换算 */
export const BLOCK_SECONDS = 2

const secondsToBlocks = (seconds: number) => Math.floor(seconds / BLOCK_SECONDS)

/** 快捷时长对应的 duration_blocks（与合约 duration_blocks 一致） */
export const DURATION_QUICK_PRESET_BLOCKS = {
  d1: secondsToBlocks(86400),
  d7: secondsToBlocks(86400 * 7),
  m1: secondsToBlocks(86400 * 30),
  m6: secondsToBlocks(86400 * 30 * 6),
  y1: secondsToBlocks(86400 * 365),
} as const

export type DurationQuickPresetId = keyof typeof DURATION_QUICK_PRESET_BLOCKS

export const DURATION_QUICK_PRESET_ORDER: DurationQuickPresetId[] = ['d1', 'd7', 'm1', 'm6', 'y1']

/** 下拉「自定义」：仅展示，不自动改区块数 */
export const DURATION_QUICK_CUSTOM = 'custom' as const

export function durationQuickPresetIdForBlocks(
  n: number,
): DurationQuickPresetId | typeof DURATION_QUICK_CUSTOM {
  for (const id of DURATION_QUICK_PRESET_ORDER) {
    if (DURATION_QUICK_PRESET_BLOCKS[id] === n) return id
  }
  return DURATION_QUICK_CUSTOM
}
