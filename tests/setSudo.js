const { ApiPromise, WsProvider } = require("@polkadot/api");
const { Keyring } = require("@polkadot/keyring");
const { decodeAddress } = require('@polkadot/keyring');
const { u8aToHex } = require('@polkadot/util');

const TO = "5FhHywUv7W4pMMXQdm48cm6tiaAEGMikXHoMtu7wnptVLQX4";

const ss58toHex = (address) => {
  const d = decodeAddress(address);
  return u8aToHex(d)
}

async function main() {
  // Initialise the provider to connect to the local node
  const provider = new WsProvider("wss://xiaobai.asyou.me:30001");

  // Create the API and wait until ready

  const hex = ss58toHex(TO)
  console.log(hex)

  // // Construct the keyring after the API (crypto has an async init)
  // const keyring = new Keyring({ type: "sr25519" });

  // // Add Alice to our keyring with a hard-derivation path (empty phrase, so uses dev)
  // const alice = keyring.addFromUri("//Alice");
  // console.log(alice.address)

  // // Create a extrinsic, transferring 12345 units to Bob
  // const transfer = api.tx.sudo.setKey(TO);

  // // Sign and send the transaction using our account
  // const hash = await transfer.signAndSend(alice);

  // console.log("Transfer sent with hash", hash.toHex());
}

const chainType = {
  WorkType: {
    _enum: ["APP", "TASK", "GPU"]
  },
  DiskClass: {
    _enum: {
      SSD: "Vec<u8>"
    }
  },
  EnvKey: {
    _enum: {
      Env: "Vec<u8>",
      File: "Vec<u8>",
    }
  },
  Service: {
    _enum: {
      Tcp: "u16",
      Udp: "u16",
      ProjectTcp: "u16",
      ProjectUdp: "u16",
    }
  },
  Command: {
    _enum: {
      SH: "Vec<u8>",
      BASH: "Vec<u8>",
      ZSH: "Vec<u8>",
      NONE: null,
    }
  },
  TEEVersion:{
    _enum: ["SGX", "CVM"]
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit());
