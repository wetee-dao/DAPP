import { getSpecTypes } from '@polkadot/types-known';
import { Loading } from "@/plugins/pop";
import { keyring } from "@/utils/chain";
import { ApiPromise } from "@polkadot/api";
import type { SubmittableExtrinsic } from "@polkadot/api/types";
import { Injected, MetadataDef } from "@polkadot/extension-inject/types";
import { formatBalance, isNumber } from "@polkadot/util";
import { base64Encode } from "@polkadot/util-crypto";
import { type Wallet, getWallets } from "@talismn/connect-wallets";
import { ElNotification } from "element-plus";
import { onCallFn } from '.';

// Substrate 交易对象
export class SubstrateProvider {
  // 区块链链接
  client: ApiPromise | undefined;
  unsubscribe: any;

  // 提交交易
  signAndSend = async (tx: SubmittableExtrinsic<'promise'>, signer: string, onSeccess: onCallFn, onError: onCallFn): Promise<void> => {
    let keypair = JSON.parse(window.localStorage.getItem("keypair") || "{}")
    let ps = [];
    if (keypair[signer]) {
      const pair = keyring.addFromUri(keypair[signer], { name: 'x' }, 'sr25519');
      ps = [pair];
    } else {
      let userInfo = null
      if (window.localStorage.getItem("userInfo")) {
        userInfo = JSON.parse(window.localStorage.getItem("userInfo") || "{}")
      }

      // 获取钱包
      const wallet: Wallet | undefined = getWallets().find(wallet => wallet.extensionName === userInfo.wallet);
      await wallet!.enable("WeTEE");

      // 检查元数据版本
      await checkMetaData(this.client!, wallet!.extension)
      const account = (await wallet!.getAccounts()).find(account => account.address === signer);
      if (!account) {
        ElNotification({
          title: 'Error',
          message: 'Account ' + signer + ' not found',
          type: 'error',
        })
        return
      }
      ps = [signer, { signer: account!.wallet!.signer }];
    }

    const loading = Loading(null)

    return new Promise(async (resolve, reject) => {
      try {
        // @ts-ignore
        const unsub = await tx.signAndSend(...ps, ({ events = [], status, dispatchError }: any) => {
          if (dispatchError) {
            let error = "";
            if (dispatchError.isModule) {
              const decoded = this.client!.registry.findMetaError(dispatchError.asModule);
              const { docs, name, section } = decoded;
              error = `${section}.${name}: ${docs.join(' ')}`;
            } else {
              error = `client.dispatchError.toString())`
            }
            loading.close();
            unsub();

            ElNotification({
              title: 'Error',
              message: error,
              type: 'error',
            })

            onError(error);
            reject()
            return
          }

          if (status.isInBlock) {
            console.log(`Transaction included at blockHash ${status.asInBlock}`);
            loading.close();
            unsub();
            onSeccess(status);
            resolve(status);
          } else if (status.isFinalized) {
            console.log(`Transaction finalized at blockHash ${status.asFinalized}`);
            loading.close();
            unsub();
            onSeccess(status);
            resolve(status);
          }
        });
      } catch (e: any) {
        loading.close();
        ElNotification({
          title: 'Error',
          message: e.toString(),
          type: 'error',
        })

        onError(e)
        reject()
      }
    })
  }

  // 提交代理交易
  proxysignAndSend = async (tx: SubmittableExtrinsic<'promise'>, ProjectId: string, signer: string, onSeccess: onCallFn, onError: onCallFn) => {
    // 构建代理交易
    const proxyTx = ProjectId && ProjectId != "-1" ? this.client!.tx.project.proxyCall(
      parseInt(ProjectId),
      tx,
    ) : tx;

    await this.signAndSend(proxyTx, signer, onSeccess, onError)
  }

  close() {
    this.client?.disconnect();
    this.unsubscribe && this.unsubscribe();
  }
}


// 检测是否支持当前链
const checkMetaData = async (api: ApiPromise, ext: Injected) => {
  const cmeta = (await ext.metadata!.get()).find((m) => m.genesisHash === api.genesisHash.toHex() && m.specVersion == api.runtimeVersion.specVersion.toNumber())
  if (cmeta) {
    return true
  }

  const meta = await getMetaData(api)
  return await ext.metadata!.provide(meta as MetadataDef)
}

// 获取元数据
const getMetaData = async (api: ApiPromise) => {
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