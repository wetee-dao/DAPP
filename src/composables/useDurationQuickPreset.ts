import { ref, watch, type Ref } from 'vue'
import {
  DURATION_QUICK_CUSTOM,
  DURATION_QUICK_PRESET_BLOCKS,
  durationQuickPresetIdForBlocks,
  type DurationQuickPresetId,
} from '@/constants/durationBlocksPreset'

/**
 * 租用区块数 + 快捷下拉（1天/7天/…）联动：选快捷项写入区块数；手改区块数则同步为 custom 或对应项。
 */
export function useDurationQuickPreset(durationBlocks: Ref<number>) {
  const durationQuickPreset = ref<string>(DURATION_QUICK_CUSTOM)

  const syncQuickPreset = () => {
    durationQuickPreset.value = durationQuickPresetIdForBlocks(durationBlocks.value)
  }

  watch(durationBlocks, syncQuickPreset, { immediate: true })

  const onDurationQuickPresetChange = (val: string) => {
    if (!val || val === DURATION_QUICK_CUSTOM) return
    const b = DURATION_QUICK_PRESET_BLOCKS[val as DurationQuickPresetId]
    if (typeof b === 'number') durationBlocks.value = b
  }

  return { durationQuickPreset, onDurationQuickPresetChange }
}
