<template>
  <div class="login-wrap">
    <div class="login-box">
      <div class="login-left-box">
        <div class="login-img-title">
          <Logo class="logo-svg" :fill="true" />
        </div>
        <div class="login-img-desc">
          {{ t('login.slogan') }}
        </div>
      </div>
      <div class="login-right-box">
        <div class="top-logo">
          <Logo class="icon" :fill="true" />
        </div>
        <div class="login-title">{{ t('login.polkadotWallet') }}</div>
        <div v-for="(w, index) in supportedWallets" @click="showWallet('Polkadot', w)"
          :class="w.installed ? 'wallet-box' : 'wallet-box wallet-box-disabled'">
          <img :src="w.logo.src" alt="Polkadotjs Logo" class="wlogo" />
          <div class="wtext">
            {{ w.title }}
          </div>
          <i class="icon">&#xe614;</i>
        </div>
        <!-- <div class="wallet-box" @click="loginDemo">
          <img src="/imgs/test.png" alt="MetaMask Logo" class="wlogo" />
          <div class="wtext">Demo Login</div>
          <i class="icon">&#xe614;</i>
        </div> -->
        <div class="login-title">{{ t('login.ethereumWallet') }}</div>
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
        {{ t('login.login') }}
        <i class="icon right" @click="LoginShow = null">&#xe604;</i>
      </div>
      <div class="login-content">
        <div :class="item.selected
            ? 'polkadotjs-account flex active'
            : 'polkadotjs-account flex'
          " v-for="(item, index) in polkadotAccounts" @click="polkadotjsSelect(index)">
          <img :src="LoginShow.logo.src" class="uicon" />
          <div class="space">
            {{
              item.name.toUpperCase() + " (" + shortAddress(item.address) + ") "
            }}
          </div>
          <i class="icon">&#xe6d2;</i>
        </div>
      </div>
      <el-button class="login-btn" :disabled="polkadotAccounts.findIndex((item) => item.selected) == -1"
        @click="PolkadotLoginIn">{{ t('login.login') }}</el-button>
    </div>
    <div class="login-pop-mask" v-if="LoginShow != null"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { Wallet, getWallets } from "@talismn/connect-wallets";

import { Loading } from "@/plugins/pop";
import { keyring, shortAddress } from "@/utils/substrate";
import Logo from "@/components/icons/Logo2.vue";
import { CurrentChainNode } from "@/plugins/chain";
import {
  connectApiForReviveCheck,
  ensureReviveMapAccount,
  isReviveAccountMapped,
} from "@/utils/revive_map_account";

const store = useStore();
const router = useRouter();
const { t } = useI18n();
const enabled = ref(false);
const polkadotAccounts = ref<any[]>(store.state.account);
const LoginShow = ref<any>(null);
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
  let userInfo = {
    addr: pair.address,
    name: "Demo Account",
    type: "keyring",
    mnemonic: mnemonic,
    provider: "substrate",
    wallet: "polkadot-js",
  };

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
      ElMessage.warning(t('login.installMetamask'));
      return;
    }

    const loading = Loading(t('login.connectingMetamask'));

    try {

    } catch (err) {
      loading.close();
      ElMessage.warning(t('login.connectMetamaskError', { error: JSON.stringify(err) }));
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
    ElMessage.error(t('login.accountRequired'));
    return;
  }

  const wallet = LoginShow.value;
  const loading = Loading(t('login.reviveAccountPreparing'));
  let api: Awaited<ReturnType<typeof connectApiForReviveCheck>> | undefined;
  try {
    const node = CurrentChainNode();
    if (!node?.chainUrl) {
      throw new Error(t('login.noChainEndpoint'));
    }
    api = await connectApiForReviveCheck(node.chainUrl);
    const mapped = await isReviveAccountMapped(api, ac.address);
    if (mapped === false) {
      await ensureReviveMapAccount(api, ac.address);
    }
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    ElMessage.error(t('login.reviveMapAccountFailed', { error: msg }));
    return;
  } finally {
    loading.close();
    try {
      await api?.disconnect();
    } catch {
      /* ignore */
    }
  }

  let userInfo = {
    addr: ac.address,
    name: ac.name,
    provider: "substrate",
    wallet: wallet.extensionName,
  };

  window.localStorage.setItem("userInfo", JSON.stringify(userInfo));
  store.dispatch("setUserInfo", userInfo);
  router.push({ path: "/" });
};

watch(store.state, (newS, oldS) => {
  polkadotAccounts.value = newS.account;
});

onMounted(async () => {
  if (window.localStorage.getItem("userInfo")) {
    enabled.value = true;
    router.push("/");
    return;
  }
  return () => { };
});
</script>

<style lang="scss" src="../assets/styles/login.scss" scoped></style>
