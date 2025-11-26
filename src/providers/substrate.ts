import { getSpecTypes } from '@polkadot/types-known';
import { Loading } from "@/plugins/pop";
import { keyring, showToken } from "@/utils/chain";
import { ApiPromise } from "@polkadot/api";
import type { SubmittableExtrinsic } from "@polkadot/api/types";
import { Injected, MetadataDef } from "@polkadot/extension-inject/types";
import { BN, formatBalance, isNumber, stringToU8a, u8aToHex, u8aWrapBytes } from "@polkadot/util";
import { base64Encode } from "@polkadot/util-crypto";
import { type Wallet, getWallets } from "@talismn/connect-wallets";
import { ElMessageBox, ElNotification } from "element-plus";
import { onCallFn } from '.';
import { getGasLimit } from '@/utils/ink';
import { Registry } from '@polkadot/types/types';
import { h } from 'vue';
import { U8aLike } from '@polkadot/util/types';

// Substrate 交易对象
export class SubstrateProvider {
  // 区块链链接
  client: ApiPromise | undefined;
  unsubscribe: any;

  // 构建inkcall
  buildCall = async (data: any, signer: string): Promise<any> => {
    if (this.client == undefined) {
      ElNotification({
        title: 'Error',
        message: 'chain client not connected',
        type: 'error',
      })
      return
    }
    const registry = this.client!.registry
    const payValue = registry.createType('Balance', new BN(data.params.payValue));
    const proofSize = new BN(data.gasRequired.proofSize.replaceAll(",", ""));
    const refTime = new BN(data.gasRequired.refTime.replaceAll(",", ""));
    const gasLimit = getGasLimit(true, refTime, proofSize, registry)
    const storageDeposit = getPredictedCharge(data.storageDeposit, registry);
    const tx = this.client!.tx.revive.call(
      data.params.contract,
      payValue,
      gasLimit,
      storageDeposit,
      data.params.inputData
    )

    const feeInfo = await tx.paymentInfo(signer);
    const decimals = registry.chainDecimals[0];
    const tokenSymbol = registry.chainTokens[0];
    const confirm = await ElMessageBox({
      title: 'Transaction Notice',
      message: h('p', { style: 'font-size: 16px' }, [
        h('span', null, 'This transaction will cost '),
        h('i', { style: 'color: teal' }, showToken(new BN(feeInfo.partialFee), decimals) + ' ' + tokenSymbol),
        h('span', null, ', Continue?'),
      ]),
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Submit to chain',
      cancelButtonText: 'Cancel tx',
    })

    if (!confirm) {
      ElNotification({
        title: 'Error',
        message: 'Cancel ink tx',
        type: 'error',
      })
      throw Error('Cancel ink tx')
    }

    return tx
  }

  // 提交交易
  signAndSend = async (tx: any, signer: string, onSeccess: onCallFn, onError: onCallFn): Promise<void> => {
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
  proxysignAndSend = async (tx: any, caller: string, signer: string, onSeccess: onCallFn, onError: onCallFn) => {
    // 构建代理交易
    const proxyTx = caller && caller != "-1" ? this.client!.tx.project.proxyCall(
      parseInt(caller),
      tx,
    ) : tx;

    await this.signAndSend(proxyTx, signer, onSeccess, onError)
  }

  signMsg = async (msg: U8aLike, signer: string) => {
    const keypair = JSON.parse(window.localStorage.getItem("keypair") || "{}")
    const wrapped = u8aWrapBytes(msg);

    if (keypair[signer]) {
      const pair = keyring.addFromUri(keypair[signer], { name: 'x' }, 'sr25519');
      return pair.sign(wrapped)
    }


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

    const walletInjector = account!.wallet!.signer;
    const signRaw = walletInjector.signRaw;
    const sig = await signRaw({
      address: account.address,
      data: u8aToHex(wrapped),
      type: 'bytes'
    });
    return sig.signature
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

export function getPredictedCharge(dryRun: Record<string, string>, registry: Registry) {
  const keys = Object.keys(dryRun);
  const key = keys[0];
  if (key == 'Charge') {
    return registry.createType('Balance', new BN(dryRun[key].replaceAll(",", "")))
  }
  return null
}
