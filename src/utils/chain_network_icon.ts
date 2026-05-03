import paseoMiniUrl from '@/assets/svg/paseo_mini.svg?url'
import polkadotMiniUrl from '@/assets/svg/polkadot_mini.svg?url'

const DEFAULT_CHAIN_ICON = '/dapp/imgs/wetee.svg'

/**
 * 根据 GraphQL `network_label` / `chain_type` 选择网络标识图（header、网络切换等）。
 */
export function iconUrlForChainNetwork(networkLabel: string, chainType?: string): string {
  const hay = `${networkLabel ?? ''} ${chainType ?? ''}`.toLowerCase()
  if (hay.includes('paseo')) return paseoMiniUrl
  if (hay.includes('polkadot')) return polkadotMiniUrl
  return DEFAULT_CHAIN_ICON
}
