import { CurrentSecretUrl } from '@/plugins/chain'
import { getMainChainCloudContract, getMainChainSubnetContract, setMainChainContracts } from '@/config'
import { GraphqlClient } from '@/utils/gql'
import { Ink } from '@/providers/chainapi/ink'

/** 与 tee-dsecret `ChainInfo` / `chain.graphqls` 对齐 */
export interface ChainInfoRow {
  is_main: boolean
  cloud_contract: string
  subnet_contract: string
  chain_type: string
  network_label: string
  urls: string[]
}

const CHAIN_INFO_QUERY = `query ChainInfo {
  chain_info {
    is_main
    cloud_contract
    subnet_contract
    chain_type
    network_label
    urls
  }
}`

/** tee-dsecret GraphQL 基址（可带或不带 `/gql`） */
export function normalizeSecretGqlUrl(u: string): string {
  const t = u.trim().replace(/\/$/, '')
  if (t.endsWith('/gql')) return t
  return `${t}/gql`
}

/**
 * 首次启动：不依赖 `CurrentSecretUrl`，用环境变量中的基址拉取 `chain_info`。
 */
export async function fetchChainInfoRows(gqlBaseUrl: string): Promise<ChainInfoRow[]> {
  const url = normalizeSecretGqlUrl(gqlBaseUrl)
  const data = await new GraphqlClient(url).query<{ chain_info: ChainInfoRow[] }>({
    query: CHAIN_INFO_QUERY,
  })
  const rows = data?.chain_info
  return Array.isArray(rows) ? rows : []
}

export async function fetchChainContractsSlice(): Promise<ChainInfoRow[]> {
  const data = await new GraphqlClient(CurrentSecretUrl()).query<{ chain_info: ChainInfoRow[] }>({
    query: CHAIN_INFO_QUERY,
  })
  const rows = data?.chain_info
  return Array.isArray(rows) ? rows : []
}

/**
 * 应用启动：用已拉取的 `chain_info` 写入主链合约；未传参时走当前节点的 GraphQL。
 */
export async function bootstrapApplyMainChainContractsFromSlice(rows?: ChainInfoRow[]): Promise<void> {
  const slice = rows ?? (await fetchChainContractsSlice())
  if (!slice.length) {
    throw new Error('chain_info: empty list')
  }
  const info = slice.find((r) => r.is_main) ?? slice[0]
  const subnet = (info.subnet_contract ?? '').trim()
  const cloud = (info.cloud_contract ?? '').trim()
  if (!subnet || !cloud) {
    throw new Error('chain_info: missing subnet_contract or cloud_contract')
  }
  setMainChainContracts(subnet, cloud)
}

export function syncInkMainChainContracts() {
  Ink.subnetContract = getMainChainSubnetContract()
  Ink.cloudContract = getMainChainCloudContract()
}
