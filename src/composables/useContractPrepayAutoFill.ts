import { onUnmounted, watch, type Ref } from 'vue'
import { Ink } from '@/providers/chainapi/ink'
import type { PodPrepayEstimateInput } from '@/utils/podContractPrepay'
import { estimatePrepayPlanckString } from '@/constants/podPrepayRates'

/**
 * 根据租期、支付资产、容器配置等，通过合约查询 Subnet 价格与 Cloud mint_interval 写入 prepayAmount；
 * 查询失败时回退到本地占位费率（podPrepayRates）。
 */
export function useContractPrepayAutoFill(
  prepayAmount: Ref<string>,
  durationBlocks: Ref<number>,
  payAsset: Ref<number>,
  getEstimateInput: () => PodPrepayEstimateInput,
  extraDeps?: () => unknown,
  debounceMs = 400,
) {
  let timer: ReturnType<typeof setTimeout> | undefined
  let seq = 0
  let cancelled = false

  onUnmounted(() => {
    cancelled = true
    if (timer) clearTimeout(timer)
  })

  const schedule = () => {
    if (timer) clearTimeout(timer)
    const mySeq = ++seq
    timer = setTimeout(async () => {
      const input = getEstimateInput()
      let planck: string | null = null
      try {
        planck = await Ink.estimatePodPrepay(input)
      } catch {
        planck = null
      }
      if (cancelled || mySeq !== seq) return
      if (planck && /^\d+$/.test(planck) && BigInt(planck) > 0n) {
        prepayAmount.value = planck
      } else {
        prepayAmount.value = estimatePrepayPlanckString(input.durationBlocks, input.payAsset, 1000)
      }
    }, debounceMs)
  }

  watch([durationBlocks, payAsset], schedule, { immediate: true })
  if (extraDeps) {
    watch(extraDeps, schedule, { deep: true })
  }

  return { refreshPrepay: schedule }
}
