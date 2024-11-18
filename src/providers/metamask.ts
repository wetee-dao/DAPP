import { ElMessage, ElNotification } from "element-plus";
import { Loading } from "@/plugins/pop";
import { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { SignerPayloadJSON } from "@polkadot/types/types";
import { Injected } from "@polkadot/extension-inject/types";

// MetaMask 交易对象
export class MetaMaskProvider {
  // 区块链链接
  client: ApiPromise | undefined;

  // snap 对象
  snap: Injected;

  constructor(s:Injected) {
    this.snap = s;
  }

  // 提交交易
  SignAndSend = async (tx: SubmittableExtrinsic<'promise'>, signer: string, onSeccess: onCallFn, onError: onCallFn) => {
    const payload = await buildPayload(this.client!, tx, signer);
    const signPayload = this.snap.signer.signPayload;

    if (!payload || !signPayload) {
      ElMessage.warning("SignAndSend Invalid metamask signPayload");
      return;
    }

    const loading = Loading(null)

    try {
      const signResult = await signPayload(payload);
      if (!signResult) {
        ElMessage.warning("SignAndSend Invalid metamask signature");
        loading.close();
        return;
      }
      tx.addSignature(signer, signResult.signature, payload);

      // @ts-ignore
      const unsub = await tx.send((result: any) => {
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
}

// 构建交易签名
export const buildPayload = async (
  api: ApiPromise,
  tx: any,
  from: string,
): Promise<SignerPayloadJSON | undefined> => {
  if (api && tx) {
    const lastHeader = await api.rpc.chain.getHeader();
    const blockNumber = api.registry.createType(
      'BlockNumber',
      lastHeader.number.toNumber(),
    );
    const method = api.createType('Call', tx);

    const era = api.registry.createType('ExtrinsicEra', {
      current: lastHeader.number.toNumber(),
      period: 64,
    });

    const { accountNonce } = await api.derive.balances.account(from);
    const nonce = api.registry.createType('Compact<Index>', accountNonce);

    const payload = {
      address: from,
      blockHash: lastHeader.hash,
      blockNumber,
      era,
      genesisHash: api.genesisHash,
      method,
      nonce,
      runtimeVersion: api.runtimeVersion,
      signedExtensions: [
        'CheckNonZeroSender',
        'CheckSpecVersion',
        'CheckTxVersion',
        'CheckGenesis',
        'CheckMortality',
        'CheckNonce',
        'CheckWeight',
        'ChargeTransactionPayment',
      ],
      transactionVersion: tx.transactionVersion,
      version: tx.version,
    };

    // ExtrinsicPayload vs SignerPayload
    const raw = api.registry.createType('SignerPayload', payload, {
      version: payload.version,
    });

    return raw.toPayload() as SignerPayloadJSON;
  }
};

type onCallFn = (result: any) => void;

