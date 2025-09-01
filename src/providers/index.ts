import { ApiPromise } from "@polkadot/api"
import { SubmittableExtrinsic } from "@polkadot/api/types";

export type onCallFn = (result: any) => void;

// 链对象封装
export interface WalletWrap {
  client: ApiPromise | undefined;
  buildInkCall: (data: any) => Promise<any>;
  signAndSend: (tx: any, signer: string, onSeccess: onCallFn, onError: onCallFn) => Promise<void>;
  proxysignAndSend: (tx: any, ProjectId: string, signer: string, onSeccess: onCallFn, onError: onCallFn) => Promise<void>;
  close: () => void;
}
