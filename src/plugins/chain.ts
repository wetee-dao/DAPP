import { ApiPromise, HttpProvider, WsProvider } from "@polkadot/api"
//@ts-ignore
import { Loading } from "./pop";
import { getWallets, Wallet } from "@talismn/connect-wallets";
import { chainJson } from "@/utils/substrate";
import { MetaMaskProvider } from "@/providers/eth";
import { SubstrateProvider } from "@/providers/substrate";
import store from '@/store';
import { WalletWrap } from "@/providers";
import { ElNotification } from "element-plus";
import { Ink } from "@/providers/chainapi/ink";
import { ChainInterface } from "@/providers/chainapi";
import { setMainChainContracts, getMainChainSubnetContract, getMainChainCloudContract } from "@/config";
import { saveRpcUrlForChain } from "@/utils/chain_rpc";


// 链节点
export class ChainNode {
  name: string;
  type: string;
  icon: string;
  chainId: string;
  chainUrl: string;
  secretUrl: string;
  /** 来自 GraphQL `chain_info`，切换网络时用于更新 Ink 合约地址 */
  subnetContract?: string;
  cloudContract?: string;
  /** `chain_info.urls` 全部 RPC，用户可在二级菜单中切换 */
  rpcUrls: string[] = [];
  balances: (addr:string) => any;
  constructor(
    name: string,
    icon: string,
    type: string,
    chainId: string,
    chainUrl: string,
    secretUrl: string,
    balances: (addr:string) => any
  ) {
    this.name = name
    this.icon = icon
    this.type = type
    this.chainId = chainId
    this.chainUrl = chainUrl
    this.secretUrl = secretUrl
    this.balances = balances
  }
}

// 链节点列表（启动时由 `main.ts` 根据 GraphQL `chain_info` 填充）
export const chainNodes: ChainNode[] = []

// 获取当前链节点
export const CurrentChainNode = () => {
  const chainId = store.state.chainId
  let c = chainNodes.find(node => node.chainId == chainId)
  if (!c) {
    c = chainNodes[0]
  }
  return c
}

// 初始化 API
export const initChainApi = (chainId: string) => {
  let node = chainNodes.find(node => node.chainId == chainId)
  if (!node) {
    node = chainNodes[0]
  }
  Ink.init(node.chainUrl)
}

/**
 * 切换当前网络后：刷新 Ink RPC、主网合约地址（与当前 `ChainNode` 一致）。
 * 应在 `store.dispatch('setChainId', …)` 之后调用。
 */
export function rebindInkAfterChainSwitch(): void {
  const node = CurrentChainNode()
  initChainApi(node.chainId)
  const s = node.subnetContract?.trim()
  const c = node.cloudContract?.trim()
  if (s && c) {
    try {
      setMainChainContracts(s, c)
    } catch {
      /* 非法地址则保留 config 原值 */
    }
  }
  Ink.subnetContract = getMainChainSubnetContract()
  Ink.cloudContract = getMainChainCloudContract()
}

/**
 * 为指定节点切换 RPC（须在 `rpcUrls` 内；列表为空时不校验），写入 localStorage，若当前即该网络则立即 `Ink.init`。
 */
export function applyRpcUrlToNode(node: ChainNode, url: string): void {
  const u = url.trim()
  if (node.rpcUrls?.length && !node.rpcUrls.includes(u)) return
  node.chainUrl = u
  saveRpcUrlForChain(node.chainId, u)
  if (store.state.chainId == node.chainId) {
    initChainApi(node.chainId)
    Ink.subnetContract = getMainChainSubnetContract()
    Ink.cloudContract = getMainChainCloudContract()
    store.commit('bumpNetworkRpcEpoch')
  }
}

export const CurrentSecretUrl = () => {
  return CurrentChainNode().secretUrl
}

// 获取交易对象
export const $getTxProvider = async (run: (chain: WalletWrap, builder: ChainInterface) => Promise<void>, isTry: boolean = false): Promise<void> => {
  const userInfo: any = store.state.userInfo
  const loading = !isTry ? Loading("Connecting to chain...") : { close: () => { } }

  let wallet = undefined;
  const curl = CurrentChainNode().chainUrl;

  try {
    const provider = curl.startsWith("ws") ? new WsProvider(curl) : new HttpProvider(curl);
    const api = await ApiPromise.create({
      provider: provider,
      types: chainJson,
    });

    if (!userInfo || !userInfo.provider) {
      ElNotification({
        title: 'Error',
        message: 'Please connect wallet first',
        type: 'error',
      })
      throw new Error("Please connect wallet first");
    }

    // await api.rpc.chain.getFinalizedHead();
    if (userInfo.provider == "metamask") {
      try {

      } catch (e) {
        throw e;
      }
    } else if (userInfo.provider == "substrate") {
      if (userInfo.type == "keyring") {
        wallet = new SubstrateProvider()
      } else {
        const wallet_ins: Wallet | undefined = getWallets().find((wallet: any) => wallet.extensionName === userInfo.wallet);
        if (!wallet_ins) {
          throw new Error("polkadot.js " + userInfo.wallet + " not installed");
        }
        wallet = new SubstrateProvider()
      }
    }

    wallet!.client = api;
    loading.close();

    const callBuilder = $getQueryApi()

    await run(wallet as WalletWrap, callBuilder);
    wallet?.close();
  } catch (e) {
    loading.close();
    wallet?.close();
    console.log("chain connect error :", e);
  }
}

// 获取查询对象
export const $getQueryApi = (): ChainInterface => {
  const userInfo: any = store.state.userInfo
  if (!userInfo || !userInfo.provider) {
    ElNotification({
      title: 'Error',
      message: 'Please connect wallet first',
      type: 'error',
    })
    throw new Error("Please connect wallet first");
  }

  switch (userInfo.provider) {
    case "metamask":
      return Ink;
    case "substrate":
      return Ink;
    default:
      break;
  }

  ElNotification({
    title: 'Error',
    message: 'wallet ' + userInfo.provider + ' not support',
    type: 'error',
  })
  throw new Error("wallet " + userInfo.provider + " not support");
}

// export const getConfig = (): any => {
//   if (localStorage.getItem("env") == "dev") {
//     return {
//       "Tokens": {
//         "DEV": [
//           "0"
//         ],
//       },
//       "TokensAmount": {
//         "DEV_0": async (api: ApiPromise, addr: string) => {
//           let account: any = (await api.query.system.account(addr)).toHuman()
//           return account.data;
//         },
//       },
//       "Chains": {
//         "0": {
//           name: "DEV",
//           icon: "/imgs/vStaking/DEV.svg",
//           api: "wss://paseo-rpc.dwellir.com",
//           isParent: true,
//         },
//       }
//     }
//   }
//   return {
//     "Tokens": {
//       "PAS": [
//         "0"
//       ],
//       "vDOT": [
//         "2030"
//       ],
//     },
//     "TokensAmount": {
//       "PAS_0": async (api: ApiPromise, addr: string) => {
//         let account: any = (await api.query.system.account(addr)).toHuman()
//         return account.data;
//       },
//       "vDOT_2030": (api: ApiPromise) => { },
//     },
//     "Chains": {
//       "0": {
//         name: "Paseo",
//         icon: "/imgs/vStaking/PAS.svg",
//         api: "wss://paseo-rpc.dwellir.com",
//         isParent: true,
//       },
//       "2030": {
//         name: "Biforst",
//         icon: "/imgs/chainBifrost.svg",
//         api: "wss://bifrost-rpc.paseo.liebi.com/ws",
//         isParent: false,
//       }
//     }
//   }
// }

// vue 插件入口
export default {
  install: function (app: any) {

  }
}