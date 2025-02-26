// 区块链
import { encodeAddress, decodeAddress } from '@polkadot/keyring';
import { u8aToHex, hexToU8a, u8aWrapBytes, BN } from '@polkadot/util';
import { Keyring } from '@polkadot/keyring';
import { web3FromSource } from '@polkadot/extension-dapp';
import { getWallets, type Wallet } from '@talismn/connect-wallets';

export const keyring = new Keyring({ type: 'sr25519', ss58Format: 2 });
keyring.setSS58Format(42)

export const WTE = 1_000_000_000_000

export const shortAddress = (address: string) => {
  if (!address) return ""
  return address.substring(0, 4) + "..." + address.substring(address.length - 6)
}

export const ss58toHex = (address: string) => {
  const d = decodeAddress(address);
  return u8aToHex(d)
}

export const hexToSS58 = (address: string) => {
  const d = hexToU8a(address);
  return encodeAddress(d, 42)
}

export const getSS5842 = (address: string) => {
  return hexToSS58(ss58toHex(address));
}

export const getBnFromChain = (str: string) => {
  return new BN(str.split(",").join(""))
}

export const getNumstrfromChain = (str: string) => {
  return str.split(",").join("")
}

export const showWTE = (b: BN) => {
  return b.div(new BN(WTE / 1000)).toNumber() / 1000
}

export const showToken = (b: BN, decimals: number) => {
  let unit = new BN(10).pow(new BN(decimals));
  return b.mul(new BN(1000)).div(unit).toNumber() / 1000
}


// export const web3Accounts = (cb: (accounts: any[]) => void) => {
//   if ((window as any).electronWeb3) {
//     (window as any).electronWeb3.web3AccountsSubscribe("DAO", (allAccounts: any[]) => {
//       cb(allAccounts)
//     })
//     return
//   }

//   if ((window as any).web3) {
//     (window as any).web3.web3AccountsSubscribe("DAO", (allAccounts: any[]) => {
//       cb(allAccounts)
//     })
//     return
//   }

//   // 获取区块链账户
//   dapp.web3Enable('DAO').then(async (res) => {
//     if (res.length > 0) {
//       res[0].accounts.subscribe(async (as) => {
//         const allAccounts = await dapp.web3Accounts();
//         console.log(allAccounts)
//         cb(allAccounts)
//       })
//     } else {
//       cb([])
//     }
//   })
// }

export const bytesSign = async (account: any, token: string) => {
  const wrapped = u8aWrapBytes(token);
  // if ((window as any).electronWeb3) {
  //   const params = {
  //     address: account.address,
  //     data: u8aToHex(wrapped),
  //     type: 'bytes'
  //   };
  //   return await (window as any).electronWeb3.bytesSign(params)
  // }

  // if ((window as any).web3) {
  //   const params = {
  //     address: account.address,
  //     data: u8aToHex(wrapped),
  //     type: 'bytes'
  //   };
  //   return await (window as any).web3.bytesSign(params)
  // }

  const injector = await web3FromSource(account.meta.source);
  const signRaw = injector?.signer?.signRaw;
  let res: any = {}
  if (!!signRaw) {
    res = await signRaw({
      address: account.address,
      data: u8aToHex(wrapped),
      type: 'bytes'
    });
  }
  return res;
}

export const bytesSignWithoutSigner = async (account: any, token: string, signRaw: any) => {
  const wrapped = u8aWrapBytes(token);

  let res: any = {}
  if (!!signRaw) {
    res = await signRaw({
      address: account.address,
      data: u8aToHex(wrapped),
      type: 'bytes'
    });
  }
  return res;
}

// export const web3FromSource = dapp.web3FromSource;
// export const wrapBytes = dapp.wrapBytes;
export const chainJson = {
  "WorkType": {
    "_enum": ["APP", "TASK", "GPU"]
  },
  "DiskClass": {
    "_enum": { "SSD": "Vec<u8>" }
  },
  "EnvKey": {
    "_enum": { "Env": "Vec<u8>", "File": "Vec<u8>" }
  },
  "Service": {
    "_enum": { "Tcp": "u16", "Https": "u16", "Udp": "u16", "ProjectTcp": "u16", "ProjectUdp": "u16" }
  },
  "Command": {
    "_enum": { "SH": "Vec<u8>", "BASH": "Vec<u8>", "ZSH": "Vec<u8>", "NONE": null }
  },
  "TEEVersion": { "_enum": ["SGX", "CVM"] }
}
