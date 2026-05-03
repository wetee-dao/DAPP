import { ApiPromise, HttpProvider } from '@polkadot/api'
import { u8aEq } from '@polkadot/util'
import { decodeAddress } from '@polkadot/util-crypto'
import { web3Enable, web3FromAddress } from '@polkadot/extension-dapp'
import { Subscription } from 'rxjs'
import { toH160Address } from '@/utils/substrate_ink'
import { chainJson } from '@/utils/substrate'

export function httpRpcFromChainUrl(chainUrl: string): string {
  if (chainUrl.startsWith('ws')) {
    return chainUrl.replace(/^ws/, 'http')
  }
  return chainUrl
}

export async function connectApiForReviveCheck(chainUrl: string): Promise<ApiPromise> {
  return ApiPromise.create({
    provider: new HttpProvider(httpRpcFromChainUrl(chainUrl)),
    types: chainJson,
  })
}

/**
 * 与 tee-dsecret `GetOriginalAccountLatest` 一致：存在 `OriginalAccount` 且与当前公钥一致则视为已 MapAccount。
 * 无 `revive.originalAccount` 存储项时返回 null（跳过映射）。
 */
export async function isReviveAccountMapped(api: ApiPromise, ss58Address: string): Promise<boolean | null> {
  const revive = (api.query as Record<string, { originalAccount?: (k: unknown) => Promise<unknown> }>).revive
  if (!revive?.originalAccount) return null
  const pub = decodeAddress(ss58Address)
  const h160hex = toH160Address(pub)
  const key = api.registry.createType('H160', h160hex)
  const opt: any = await revive.originalAccount(key)
  if (!opt || opt.isNone) return false
  try {
    const stored = opt.unwrap()
    const bytes: Uint8Array =
      typeof stored?.toU8a === 'function' ? (stored.toU8a() as Uint8Array) : new Uint8Array(stored as ArrayLike<number>)
    if (bytes?.length >= 32) {
      return u8aEq(bytes.subarray(0, 32), pub.subarray(0, 32))
    }
  } catch {
    /* 元数据差异时退化为 isSome */
  }
  return true
}

function isBenignMapAccountError(api: ApiPromise, dispatchError: any): boolean {
  if (!dispatchError?.isModule) return false
  try {
    const { section, name, docs } = api.registry.findMetaError(dispatchError.asModule)
    const blob = `${section}.${name} ${docs.join(' ')}`
    return /already|mapped|duplicate/i.test(blob)
  } catch {
    return false
  }
}

/** 未映射时提交 `revive.mapAccount` 并等待 InBlock / Finalized。 */
export async function ensureReviveMapAccount(api: ApiPromise, ss58Address: string, appName = 'WeTEE'): Promise<void> {
  const reviveTx = (api.tx as Record<string, { mapAccount?: (...a: unknown[]) => unknown }>).revive
  if (!reviveTx?.mapAccount) {
    throw new Error('revive.mapAccount not available on this chain')
  }
  await web3Enable(appName)
  const injector = await web3FromAddress(ss58Address)
  const tx = reviveTx.mapAccount() as any

  await new Promise<void>((resolve, reject) => {
    let settled = false
    const finish = (fn: () => void) => {
      if (settled) return
      settled = true
      fn()
    }

    const sub: Subscription = tx.signAndSend(ss58Address, { signer: injector.signer }).subscribe({
      next: (result: any) => {
        if (result.dispatchError) {
          finish(() => sub.unsubscribe())
          if (isBenignMapAccountError(api, result.dispatchError)) {
            resolve()
            return
          }
          if (result.dispatchError.isModule) {
            const { docs, name, section } = api.registry.findMetaError(result.dispatchError.asModule)
            reject(new Error(`${section}.${name}: ${docs.join(' ')}`))
          } else {
            reject(new Error(String(result.dispatchError)))
          }
          return
        }
        if (result.status?.isInBlock || result.status?.isFinalized) {
          finish(() => sub.unsubscribe())
          resolve()
        }
      },
      error: (e: unknown) => {
        finish(() => sub.unsubscribe())
        reject(e)
      },
    })
  })
}
