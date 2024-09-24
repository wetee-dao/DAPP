<template>
  <div id="mainNav">
    <GHeader />
    <!-- 主应用入口 -->
    <router-view v-if="inited" />
    <!-- 子应用入口 -->
    <div v-show="$route.fullPath.indexOf('app_') > -1" id="subview" />
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useStore } from "vuex";

import GHeader from "./components/header.vue";
import useGlobelProperties from "./store/globel";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { SubstrateProvider } from "./providers/substrate";
import { ElMessage } from "element-plus";
import { MetaMaskProvider } from "./providers/metamask";
import { Metamask } from "./providers/MetaSnap";
import { sleep } from "@/utils/time";
import { chainType } from "./utils/chain"
import { chainUrl } from "./plugins/chain";
import { getWallets, Wallet } from "@talismn/connect-wallets";

const store = useStore();
const global = useGlobelProperties()
const inited = ref(false);
if (window.devicePixelRatio) {
  let scale = (window.devicePixelRatio - 1) * 1.4
  store.dispatch("setScale", (scale + 16) / 16);
  if (scale > 0 && scale < 0.5) {
    scale = 0.5
  }
  document.getElementsByTagName('html')[0].style.fontSize = (scale + 16) + 'px';
}

onMounted(async () => {
  try {
    const wsProvider = new WsProvider(chainUrl);
    const api = await ApiPromise.create({
      provider: wsProvider,
      types: chainType,
    });

    await api.rpc.chain.getFinalizedHead()
    global.$setClient(api);
    if (store.state.userInfo.provider) {
      if (store.state.userInfo.provider == "metamask") {
        try {
          const MataMaskSnap = await Metamask.enable!("WeTEE")
          const chain = new MetaMaskProvider(MataMaskSnap)

          chain.snap = MataMaskSnap
          global.$setChain(chain)
        } catch (e) {
          ElMessage.warning("请安装 metamask 插件,错误 => " + JSON.stringify(e));
          return;
        }
      } else if (store.state.userInfo.provider == "substrate") {
        if (store.state.userInfo.type == "keyring") {
          global.$setChain(new SubstrateProvider())
        } else {
          const wallet: Wallet | undefined = getWallets().find(wallet => wallet.extensionName === store.state.userInfo.wallet);
          if (!wallet) {
            ElMessage.warning("插件 " + store.state.userInfo.wallet + " 未安装");
            return;
          }

          for (let i = 0; i < 10; i++) {
            await sleep(800)
            try {
              global.$setChain(new SubstrateProvider())
              i = 10
            } catch (e) {
              ElMessage.warning("请安装 polkadot 插件,错误 => " + JSON.stringify(e));
              return;
            }
          }
        }
      }
    }

    inited.value = true;
    document.getElementById('loader')!.style.display = "none";
    document.getElementById('mainApp')!.style.visibility = "visible";
  } catch {

  }
});

onBeforeUnmount(() => {
  let chain = global.$getChain()
  chain.Close()
});
</script>

<style>
#mainApp {
  height: 100%;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  visibility: hidden;
}

#mainNav {
  position: relative;
  box-sizing: border-box;
  min-height: 100%;
  overflow: auto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

#subview {
  height: calc(100vh - 70px);
}

#subview>div {
  height: 100%;
}
</style>
