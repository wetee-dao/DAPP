import { ElNotification } from "element-plus";
import { Loading } from "@/plugins/pop";
import { keyring } from "@/utils/chain";
import { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { Wallet, getWallets } from "@talismn/connect-wallets";
import store from "@/store";
import { checkMetaData } from "@/plugins/chain";

// Substrate 交易对象
export class SubstrateProvider {
  // 区块链链接
  client: ApiPromise | undefined;
  unsubscribe: any;

  // 提交交易
  SignAndSend = async (tx: SubmittableExtrinsic<'promise'>, signer: string, onSeccess: onCallFn, onError: onCallFn) => {
    let keypair = JSON.parse(window.localStorage.getItem("keypair") || "{}")
    let ps = [];
    if (keypair[signer]) {
      const pair = keyring.addFromUri(keypair[signer], { name: 'x' }, 'sr25519');
      ps = [pair];
    } else {
      // @ts-ignore
      const wallet: Wallet | undefined = getWallets().find(wallet => wallet.extensionName === store.state.userInfo.wallet);
      await wallet!.enable("WeTEE");
      await checkMetaData(wallet!.extension);
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

    try {
      // @ts-ignore
      const unsub = await tx.signAndSend(...ps, (result: any) => {
        if (result.dispatchError) {
          let error = "";
          if (result.dispatchError.isModule) {
            const decoded = this.client!.registry.findMetaError(result.dispatchError.asModule);
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
          return
        }
        if (result.status.isInBlock) {
          console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
          loading.close();
          unsub();
          onSeccess(result);
        } else if (result.status.isFinalized) {
          console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
          loading.close();
          unsub();
          onError(result);
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
    }
  }

  // 提交代理交易
  ProxySignAndSend = async (tx: SubmittableExtrinsic<'promise'>, ProjectId: string, signer: string, onSeccess: onCallFn, onError: onCallFn) => {
    // 构建代理交易
    const proxyTx = ProjectId != "-1" ? this.client!.tx.project.proxyCall(
      parseInt(ProjectId),
      tx,
    ) : tx;

    await this.SignAndSend(proxyTx, signer, onSeccess, onError)
  }

  Close() {
    this.client?.disconnect();
    this.unsubscribe && this.unsubscribe();
  }
}

type onCallFn = (result: any) => void;