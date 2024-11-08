<template>
  <div class="login-wrap">
    <div class="login-box">
      <div class="login-left-box">
        <div class="login-img-title">
          <Logo class="logo-svg" :showName="true" />ETEE
        </div>
        <div class="login-img-desc">
          Confidential computing, calculate trustworthy future
        </div>
      </div>
      <div class="login-right-box">
        <div class="top-logo">
          <Logo :showName="true" />
        </div>
        <div class="login-title">Polkadot Wallet</div>
        <div
          v-for="(w, index) in supportedWallets"
          @click="showWallet('Polkadot', w)"
          :class="w.installed ? 'wallet-box' : 'wallet-box wallet-box-disabled'"
        >
          <img :src="w.logo.src" alt="Polkadotjs Logo" class="wlogo" />
          <div class="wtext">
            {{ w.title }}
          </div>
          <i class="icon">&#xe614;</i>
        </div>
        <div class="wallet-box" @click="loginDemo">
          <img src="/imgs/test.png" alt="MetaMask Logo" class="wlogo" />
          <div class="wtext">Demo Login</div>
          <i class="icon">&#xe614;</i>
        </div>

        <div class="login-title">Ethereum Wallet</div>
        <div class="wallet-box" @click="showWallet('MetaMask', null)">
          <img src="/imgs/metamask.svg" alt="MetaMask Logo" class="wlogo" />
          <div class="wtext">MetaMask</div>
          <i class="icon">&#xe614;</i>
        </div>

        <div class="end"></div>
      </div>
    </div>
    <div class="pop-login-box" v-if="LoginShow != null">
      <div class="title">
        <img :src="LoginShow.logo.src" alt="Polkadotjs Logo" class="logo" />{{
          LoginShow.title
        }}
        Login
        <i class="icon right" @click="LoginShow = null">&#xe604;</i>
      </div>
      <div class="login-content">
        <div
          :class="
            item.selected
              ? 'polkadotjs-account flex active'
              : 'polkadotjs-account flex'
          "
          v-for="(item, index) in polkadotAccounts"
          @click="polkadotjsSelect(index)"
        >
          <Identicon
            class="uicon"
            :hash="ss58toHex(item.address)"
            :padding="0.1"
            :foreground="[80, 250, 130, 255]"
            :background="[80, 255, 130, 0]"
            :size="16"
          />
          <div class="space">
            {{
              item.name.toUpperCase() + " (" + shortAddress(item.address) + ") "
            }}
          </div>
          <i class="icon">&#xe6d2;</i>
        </div>
      </div>
      <el-button
        class="login-btn"
        :disabled="polkadotAccounts.findIndex((item) => item.selected) == -1"
        @click="PolkadotLoginIn"
        >Login</el-button
      >
    </div>
    <div class="login-pop-mask" v-if="LoginShow != null"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Wallet, getWallets } from "@talismn/connect-wallets/dist";

import { SubstrateProvider } from "@/providers/substrate";
import { MetaMaskProvider } from "@/providers/metamask";
import { Metamask, setCustomChain } from "@/providers/MetaSnap";
import { Loading } from "@/plugins/pop";
import useGlobelProperties from "@/store/globel";
import { chainUrl, checkMetaData, getMetaData } from "@/plugins/chain";
import { ss58toHex } from "@/utils/chain";
import { keyring, shortAddress } from "@/utils/chain";

const store = useStore();
const router = useRouter();
const enabled = ref(false);
const polkadotAccounts = ref<any[]>(store.state.account);
const LoginShow = ref<any>(null);
const global = useGlobelProperties();
const supportedWallets: Wallet[] = getWallets().sort(
  (w1: Wallet, w2: Wallet) => {
    const w1index = w1.installed ? 0 : 1;
    const w2index = w2.installed ? 0 : 1;
    return w1index - w2index;
  }
);

watch(
  () => store.state.account,
  (val) => {
    polkadotAccounts.value = val;
  }
);

const loginDemo = async () => {
  const mnemonic = "pilot nurse frost vote fantasy then hello rookie member rhythm radar urban";
  const pair = keyring.addFromUri(mnemonic, { name: "first pair" }, "sr25519");
  window.localStorage.setItem("token", "presign");
  let userInfo = {
    addr: pair.address,
    name: "Demo Account",
    type: "keyring",
    mnemonic: mnemonic,
    provider: "substrate",
    wallet: "polkadot-js",
  };

  let chain = new SubstrateProvider();
  global.$setChain(chain);
  store.dispatch("setUserInfo", userInfo);
  store.dispatch("setKeypair", { address: pair.address, mnemonic: mnemonic });

  router.push({ path: "/" });
};

const showWallet = async (name: string, wallet: Wallet | null) => {
  if (name == "Polkadot") {
    try {
      await wallet!.enable("WeTEE");
      const accounts = await wallet!.getAccounts();
      store.dispatch("setAccounts", accounts);
      LoginShow.value = wallet;
    } catch (e: any) {
      ElMessage.warning(e.message);
      return;
    }
  } else if (name == "MetaMask") {
    if (!(window as any).ethereum || !(window as any).ethereum.isMetaMask) {
      ElMessage.warning("请安装 MetaMask 插件");
      return;
    }

    const loading = Loading("Connecting to metamask...");

    try {
      // 安装启动snap
      const MataMaskSnap = await Metamask.enable!("WeTEE");
      const meta = await getMetaData();
      const _config = await setCustomChain(chainUrl, meta);

      const metaAccounts = await MataMaskSnap.accounts.get();
      if (metaAccounts.length == 0) {
        ElMessage.warning("请安装 MetaMask 插件，并创建账户");
        return;
      }

      // 获取账户信息
      const ac = metaAccounts[0];
      window.localStorage.setItem("token", "presign");

      const userInfo = {
        addr: ac.address,
        name: ac.name!,
        provider: "metamask",
      };

      const chain = new MetaMaskProvider(MataMaskSnap);
      global.$setChain(chain);

      window.localStorage.setItem("userInfo", JSON.stringify(userInfo));
      store.dispatch("setUserInfo", userInfo);

      loading.close();
      router.push({ path: "/" });
    } catch (err) {
      loading.close();
      ElMessage.warning("MetaMask connect erorr " + JSON.stringify(err));
      return false;
    }
  }
};

const polkadotjsSelect = async (index: number) => {
  let newAccount = JSON.parse(JSON.stringify(polkadotAccounts.value));
  newAccount.forEach((v: any, i: number) => {
    if (i == index) {
      v.selected = true;
    } else {
      v.selected = false;
    }
  });
  polkadotAccounts.value = newAccount;
};

const PolkadotLoginIn = async () => {
  let ac = polkadotAccounts.value.find((v: any) => v.selected);
  if (!ac) {
    ElMessage.error("账户不能为空");
    return;
  }

  const wallet = LoginShow.value;
  await checkMetaData(wallet!.extension);
  window.localStorage.setItem("token", "presign");
  let userInfo = {
    addr: ac.address,
    name: ac.name,
    provider: "substrate",
    wallet: wallet.extensionName,
  };

  let chain = new SubstrateProvider();
  global.$setChain(chain);

  window.localStorage.setItem("userInfo", JSON.stringify(userInfo));
  store.dispatch("setUserInfo", userInfo);
  router.push({ path: "/" });
};

watch(store.state, (newS, oldS) => {
  polkadotAccounts.value = newS.account;
});

onMounted(async () => {
  if (window.localStorage.getItem("token")) {
    enabled.value = true;
    router.push("/");
    return;
  }
  return () => {};
});
</script>

<style lang="scss" src="../assets/styles/login.scss" scoped></style>
