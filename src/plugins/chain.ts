import { ApiPromise, HttpProvider, WsProvider } from "@polkadot/api"
//@ts-ignore
import { Loading } from "./pop";
import { getWallets, Wallet } from "@talismn/connect-wallets";
import { Metamask } from "@/providers/MetaSnap";
import { chainJson } from "@/utils/chain";
import { MetaMaskProvider } from "@/providers/eth";
import { SubstrateProvider } from "@/providers/substrate";
import store from '@/store';
import { getNetworkLatency } from "@/utils/net";
import { WalletWrap } from "@/providers";
import { ElNotification } from "element-plus";
import { Ink } from "@/providers/chains/ink";
import { ChainInterface } from "@/providers/chains";

// 获取链节点的ping
export async function chainNetPing(): Promise<string> {
  const results = await Promise.all(chainNodes.map(node => getNetworkLatency(node.queryUrl + "node/network")));

  let pings: any = {}
  const rs = results.map((v, i) => {
    pings[i] = v;
    return { i: i, v: v }
  }).filter((result: any) => result.v != null)

  store.dispatch("setPins", pings)
  return chainNodes[rs[Math.floor(Math.random() * rs.length)].i].chainId
}

// 链节点
class ChainNode {
  name: string;
  type: string;
  chainId: string;
  chainUrl: string;
  queryUrl: string;
  secretUrl: string;
  constructor(name: string, type: string, chainId: string, chainUrl: string, queryUrl: string, secretUrl: string) {
    this.name = name
    this.type = type
    this.chainId = chainId
    this.chainUrl = chainUrl
    this.queryUrl = queryUrl
    this.secretUrl = secretUrl
  }
}

// 链节点列表
export const chainNodes: ChainNode[] = [
  {
    name: 'DEV-LOCAL',
    chainId: "dev-local",
    type: "substrate",
    chainUrl: 'wss://xiaobai.asyou.me:30001/ws',
    queryUrl: 'https://xiaobai.asyou.me:30001/',
    secretUrl: 'https://xiaobai.asyou.me:30115/gql',
  },
]

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
  Ink.init(node.queryUrl, node.chainUrl)
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
        const MataMaskSnap = await Metamask.enable!("WeTEE")
        wallet = new MetaMaskProvider(MataMaskSnap)

        wallet.snap = MataMaskSnap
      } catch (e) {
        throw e;
      }
    } else if (userInfo.provider == "substrate") {
      if (userInfo.type == "keyring") {
        wallet = new SubstrateProvider()
      } else {
        const wallet_ins: Wallet | undefined = getWallets().find(wallet => wallet.extensionName === userInfo.wallet);
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