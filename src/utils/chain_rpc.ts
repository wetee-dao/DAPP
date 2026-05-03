const STORAGE_KEY = 'wetee_chain_rpc_by_id'

function normRpc(u: string): string {
  return u.trim().replace(/\/+$/, '')
}

/** 与列表项或已保存字符串比对（忽略首尾空白与末尾斜杠） */
export function sameRpcUrl(a: string, b: string): boolean {
  return normRpc(a) === normRpc(b)
}

/** 在 urls 中找到与 saved 等价的项，返回列表中的规范字符串 */
export function matchRpcFromList(saved: string, urls: string[]): string | undefined {
  return urls.find((u) => sameRpcUrl(u, saved))
}

export function pickChainRpcUrl(urls: string[]): string {
  if (!urls?.length) {
    throw new Error('chain_info: urls 为空')
  }
  const wss = urls.find((u) => u.startsWith('wss://') || u.startsWith('ws://'))
  if (wss) return wss
  const https = urls.find((u) => u.startsWith('https://') || u.startsWith('http://'))
  if (https) return https
  return urls[0]
}

export function getSavedRpcUrl(chainId: string): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const map = JSON.parse(raw) as Record<string, string>
    const u = map[chainId]
    return typeof u === 'string' && u.trim() ? u.trim() : null
  } catch {
    return null
  }
}

export function saveRpcUrlForChain(chainId: string, url: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const map: Record<string, string> = raw ? JSON.parse(raw) : {}
    map[chainId] = url.trim()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

/** 优先使用本地为该 chainId 保存的 RPC，且必须在 urls 列表内（含宽松匹配） */
export function resolveRpcUrlForNode(chainId: string, urls: string[]): string {
  const saved = getSavedRpcUrl(chainId)
  if (saved) {
    const exact = urls.find((u) => u === saved)
    if (exact) return exact
    const matched = matchRpcFromList(saved, urls)
    if (matched) {
      if (matched !== saved) saveRpcUrlForChain(chainId, matched)
      return matched
    }
  }
  return pickChainRpcUrl(urls)
}

export function shortRpcLabel(url: string, max = 44): string {
  if (!url || url.length <= max) return url
  return `${url.slice(0, max - 8)}…${url.slice(-6)}`
}
