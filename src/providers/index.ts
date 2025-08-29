import { ApiPromise } from "@polkadot/api"
import { SubmittableExtrinsic } from "@polkadot/api/types";

export type onCallFn = (result: any) => void;

// 链对象封装
export interface WalletWrap {
  client: ApiPromise | undefined;
  signAndSend: (tx: SubmittableExtrinsic<'promise'>, signer: string, onSeccess: onCallFn, onError: onCallFn) => Promise<void>;
  proxysignAndSend: (tx: SubmittableExtrinsic<'promise'>, ProjectId: string, signer: string, onSeccess: onCallFn, onError: onCallFn) => Promise<void>;
  close: () => void;
}
