import { ApiPromise, HttpProvider, WsProvider } from "@polkadot/api"
import { base64Encode } from "@polkadot/util-crypto";
import { getSpecTypes } from '@polkadot/types-known';
import type { Injected, MetadataDef } from '@polkadot/extension-inject/types';
import { formatBalance, isNumber } from "@polkadot/util";
import axios from "axios";
//@ts-ignore
import qs from "qs";
import { Loading } from "./pop";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { getWallets, Wallet } from "@talismn/connect-wallets";
import { Metamask } from "@/providers/MetaSnap";
import { chainJson } from "@/utils/chain";
import { MetaMaskProvider } from "@/providers/metamask";
import { SubstrateProvider } from "@/providers/substrate";
import store from '../store';

// 区块链链接
let client: ApiPromise | null = null
export let chainIndexer = 'https://xiaobai.asyou.me:30006/gql'
export let dkgUrl = 'https://xiaobai.asyou.me:31001/gql'

export let chainUrl = () => {
  if (localStorage.getItem("env") == "dev") {
    return "wss://xiaobai.asyou.me:30001/ws"
  }
  if (localStorage.getItem("env") == "paseo") {
    return 'wss://paseo.asyou.me/ws'
  }
  // return 'wss://paseo.asyou.me/ws'
  return "wss://xiaobai.asyou.me:30001/ws"
}

export let getChainHttpApi = (url: string) => {
  return url.replace('ws', 'http').replace("ws", "")
}

export let getChainHttp = (url: string) => {
  return url.replace('ws', 'http')
}

// chain http client
const chainHttpClient = {
  // 查询链上状态
  query: async (pallet: string, storageItem: string, keys: unknown[]) => {
    const response = await axios.get(getChainHttpApi(chainUrl()) + "pallets/" + pallet + "/storage/" + storageItem, {
      params: { keys: keys },
      paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'brackets' }),
    })
    return response.data.value
  },

  // 查询链上状态列表
  entries: async (pallet: string, storageItem: string, keys: unknown[]) => {
    const response = await axios.get(getChainHttpApi(chainUrl()) + "pallets/" + pallet + "/storage/entries/" + storageItem, {
      params: { keys: keys },
      paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'brackets' }),
    })
    return response.data.values
  },

  // 查询lastblock
  lastBlock: async () => {
    const response = await axios.get(getChainHttpApi(chainUrl()) + "blocks/head/header?finalized=false")
    return response.data
  }
}

export type onCallFn = (result: any) => void;

// 链对象封装
export interface ChainWrap {
  client: ApiPromise | undefined;
  signAndSend: (tx: SubmittableExtrinsic<'promise'>, signer: string, onSeccess: onCallFn, onError: onCallFn) => Promise<void>;
  proxysignAndSend: (tx: SubmittableExtrinsic<'promise'>, ProjectId: string, signer: string, onSeccess: onCallFn, onError: onCallFn) => Promise<void>;
  close: () => void;
}

// 获取 http query api
export const getHttpApi = () => {
  return chainHttpClient
}

// 检测是否支持当前链
export async function checkMetaData(api: ApiPromise, ext: Injected): Promise<boolean> {
  const cmeta = (await ext.metadata!.get()).find((m) => m.genesisHash === api.genesisHash.toHex() && m.specVersion == api.runtimeVersion.specVersion.toNumber())

  if (cmeta) {
    return true
  }

  const meta = await getMetaData(api)
  return await ext.metadata!.provide(meta as MetadataDef)
}

// 获取元数据
export async function getMetaData(api: ApiPromise) {
  let chainInfo = await api.rpc.system.chain()
  const chainName = chainInfo.toHuman()

  const meta = {
    chain: chainName,
    chainType: 'substrate',
    color: undefined,
    genesisHash: api.genesisHash.toHex(),
    icon: "",
    metaCalls: base64Encode(api.runtimeMetadata.asCallsOnly.toU8a()),
    specVersion: api.runtimeVersion.specVersion.toNumber(),
    ss58Format: isNumber(api.registry.chainSS58)
      ? api.registry.chainSS58
      : 42,
    tokenDecimals: (api.registry.chainDecimals)[0],
    tokenSymbol: (api.registry.chainTokens || formatBalance.getDefaults().unit)[0],
    types: getSpecTypes(api.registry, chainName, api.runtimeVersion.specName, api.runtimeVersion.specVersion) as unknown as Record<string, string>
  }

  return meta as MetadataDef
}

// 获取链对象
export const $getChainProvider = async (run: (chain: ChainWrap) => Promise<void>, url: string | undefined = undefined, isTry: boolean = false): Promise<void> => {
  const userInfo:any = store.state.userInfo

  const loading = !isTry ? Loading("Connecting to chain...") : { close: () => { } }

  let chain = undefined;
  const curl = url || chainUrl();
  console.log("chain url :", curl);
  try {
    const wsProvider = curl.includes("ws") ? new WsProvider(curl) : new HttpProvider(curl);
    const api = await ApiPromise.create({
      provider: wsProvider,
      types: chainJson,
    });

    await api.rpc.chain.getFinalizedHead();
    if (userInfo && userInfo.provider) {
      if (userInfo.provider == "metamask") {
        try {
          const MataMaskSnap = await Metamask.enable!("WeTEE")
          chain = new MetaMaskProvider(MataMaskSnap)

          chain.snap = MataMaskSnap
        } catch (e) {
          throw e;
        }
      } else if (userInfo.provider == "substrate") {
        if (userInfo.type == "keyring") {
          chain = new SubstrateProvider()
        } else {
          const wallet: Wallet | undefined = getWallets().find(wallet => wallet.extensionName === userInfo.wallet);
          if (!wallet) {
            throw new Error("polkadot.js " + userInfo.wallet + " not installed");
          }
          chain = new SubstrateProvider()
        }
      }
    } else {
      chain = new SubstrateProvider();
    }

    chain!.client = api;
    loading.close();

    await run(chain!);
    chain!.close();
  } catch (e) {
    loading.close();
    chain!.close();
    console.error("chain connect error :", e);
  }
}

export const getConfig = (): any => {
  if (localStorage.getItem("env") == "paseo") {
    return {
      "Tokens": {
        "PAS": [
          "0"
        ],
        "vDOT": [
          "2030"
        ],
      },
      "TokensAmount": {
        "PAS_0": async (api: ApiPromise, addr: string) => {
          let account: any = (await api.query.system.account(addr)).toHuman()
          return account.data;
        },
        "vDOT_2030": (api: ApiPromise) => { },
      },
      "Chains": {
        "0": {
          name: "Paseo",
          icon: "/imgs/vStaking/PAS.svg",
          api: "wss://paseo-rpc.dwellir.com",
          isParent: true,
        },
        "2030": {
          name: "Biforst",
          icon: "/imgs/chainBifrost.svg",
          api: "wss://bifrost-rpc.paseo.liebi.com/ws",
          isParent: false,
        }
      }
    }
  }
  if (localStorage.getItem("env") == "dev") {
    return {
      "Tokens": {
        "DEV": [
          "0"
        ],
      },
      "TokensAmount": {
        "DEV_0": async (api: ApiPromise, addr: string) => {
          let account: any = (await api.query.system.account(addr)).toHuman()
          return account.data;
        },
      },
      "Chains": {
        "0": {
          name: "DEV",
          icon: "/imgs/vStaking/DEV.svg",
          api: "wss://paseo-rpc.dwellir.com",
          isParent: true,
        },
      }
    }
  }

  return {
    "Tokens": {
      "DEV": [
        "0"
      ],
    },
    "TokensAmount": {
      "DEV_0": async (api: ApiPromise, addr: string) => {
        let account: any = (await api.query.system.account(addr)).toHuman()
        return account.data;
      },
    },
    "Chains": {
      "0": {
        name: "DEV",
        icon: "/imgs/vStaking/DEV.svg",
        api: "ws://127.0.0.1:31946",
        isParent: true,
      },
    }
  }
}

// vue 插件入口
export default {
  install: function (app: any) {

  }
}