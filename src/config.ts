let mainChainSubnetContract = ""
let mainChainCloudContract = ""

export function getMainChainSubnetContract(): string {
  return mainChainSubnetContract
}

export function getMainChainCloudContract(): string {
  return mainChainCloudContract
}

function assertMainChainContractAddr(label: string, value: string): void {
  if (!/^0x[0-9a-fA-F]{40}$/.test(value)) {
    throw new Error(`invalid contract address: ${label}`)
  }
}

/** 由 GraphQL `fetchChainContractsSlice` 启动流程写入 */
export function setMainChainContracts(subnet: string, cloud: string): void {
  const s = subnet.trim()
  const c = cloud.trim()
  assertMainChainContractAddr("subnet_contract", s)
  assertMainChainContractAddr("cloud_contract", c)
  mainChainSubnetContract = s
  mainChainCloudContract = c
}
