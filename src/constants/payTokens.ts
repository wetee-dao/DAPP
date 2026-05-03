/** 支付代币选项（对应合约 pay_asset，u32）；当前仅原生，后续可追加 */
export type PayTokenOption = {
  payAsset: number
  labelKey: string
}

export const PAY_TOKEN_OPTIONS: PayTokenOption[] = [{ payAsset: 0, labelKey: 'pop.payTokenNative' }]

export const NATIVE_PAY_ASSET = 0 as const
