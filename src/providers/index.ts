import { ApiPromise } from "@polkadot/api"
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { U8aLike } from "@polkadot/util/types";

export type onCallFn = (result: any) => void;

// 链对象封装
export interface WalletWrap {
  client: ApiPromise | undefined;
  buildCall: (data: any, signer: string) => Promise<any>;
  signMsg: (msg: U8aLike, signer: string) => Promise<string>;
  signAndSend: (tx: any, signer: string, onSeccess: onCallFn, onError: onCallFn) => Promise<void>;
  proxysignAndSend: (tx: any, ProjectId: string, signer: string, onSeccess: onCallFn, onError: onCallFn) => Promise<void>;
  close: () => void;
}
