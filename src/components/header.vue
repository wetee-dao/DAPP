<template>
  <div class="header-wrap flex" v-show="isShow" key="header">
    <!-- <div class="header-left" @click="menuClick">
      <div class="cur-service">
        PlusWeb
      </div>
      <div class="header-logo" @click="home">
        <Logo class="icon" :fill="true" />
      </div>
    </div> -->

    <!-- <HeaderNav :key="pkey" :paths="paths" v-if="paths.length > 0" /> -->

    <!-- <div class="balance">Balance: 1000WTE</div> -->

    <!-- <div class="theme">
      <div :class="theme == 'dark' || theme == '' ? 'active' : ''" @click="setTheme('dark')"><i
          class="icon select-icon">&#xe60f;</i>
      </div>
      <div :class="theme == 'light' ? 'active' : ''" @click="setTheme('light')"><i class="icon select-icon">&#xe6bd;</i>
      </div>
    </div> -->

    <el-dropdown class="locale" placement="bottom-end" :teleported="false">
      <div class="header-box flex locale-box">
        <div>{{ currentLocaleLabel }}</div>&nbsp;&nbsp;
        <div class="icon">&#xe68f;</div>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item :disabled="locale === LOCALE_ZH_CN" @click="setLocale(LOCALE_ZH_CN)">
            {{ t('common.chinese') }}
          </el-dropdown-item>
          <el-dropdown-item :disabled="locale === LOCALE_EN_US" @click="setLocale(LOCALE_EN_US)">
            {{ t('common.english') }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <el-popover popper-class="network-select" placement="bottom-end" trigger="hover">
      <template #reference>
        <div class="header-box flex network-box">
          <div class="node-name">
            <img :src="network.icon" alt="" />
            <div class="node-name__text" :title="network.name">{{ network.name }}</div>
            <Network class="network" />
          </div>
        </div>
      </template>
      <template #default>
        <NetworkSelect />
      </template>
    </el-popover>

    <el-dropdown class="balance" placement="bottom-end" :teleported="false" v-if="balances.length > 0 && isShow">
      <div class="balance-trigger" :title="`${balances[0].value} ${balances[0].name}`">
        <span class="balance-trigger__value">
          {{ balances[0].value }} <span class="unit">{{ balances[0].name }}</span>
        </span>
        <div class="icon">&#xe68f;</div>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item >
            <div>
              {{ balances[0].value }} <span class="unit">{{ balances[0].name }}</span>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-dropdown class="account" placement="bottom-end" :teleported="false" v-if="balances.length > 0 && isShow">
      <div class="header-box flex">
        <div class="header-user-box flex">
          <div style="display: flex; align-items: center">
            <div class="header-user-img">
              <img :src="wallet(user.wallet).logo.src" />
            </div>
            <div class="header-user-info">
              <div class="header-user-name">
                {{ user.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <!-- el-dropdown-item v-for="a in accounts" :key="a.address">
            <div class="more-item">
              &nbsp;{{ shortAddress(a.address) }}&nbsp;&nbsp;
            </div>
          </el-dropdown-item -->
          <el-dropdown-item @click="nextOut">
            <div class="more-item">
              &nbsp;<span class="icon more-item-icon">&#xe605;</span> {{ t('header.disconnect') }}&nbsp;&nbsp;&nbsp;
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
  <NavList v-show="isShow" :key="module" :module="module" @closeClick="closeClick" />
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import NavList from "./nav-list.vue";
import HeaderNav from "./header-nav.vue";
import Logo from "./icons/Logo2.vue";
import Network from "./network.vue";
import NetworkSelect from "./network-select.vue";
import { CurrentChainNode } from "@/plugins/chain";
import { getWallets, Wallet } from "@talismn/connect-wallets";
import { getRouteLabel, LOCALE_EN_US, LOCALE_ZH_CN } from "@/i18n";

const router = useRouter();
const store = useStore();
const { t } = useI18n();
const menuShow = ref(false);
const isFirst = ref(true);
const pkey = ref(0);
const user = ref(store.state.userInfo);
const isShow = ref(store.state.currentPath != "/login");
const theme = ref(store.state.theme);
const network = computed(() => CurrentChainNode());
const balances = ref<any[]>([]);
const paths = ref<any[]>([]);
const module = ref("");
const locale = computed(() => store.state.locale);
const currentLocaleLabel = computed(() => (
  locale.value === LOCALE_ZH_CN ? t('common.chinese') : t('common.english')
));
watch(() => store.state.theme, (newVal, _) => {
  theme.value = newVal
})
watch(() => store.state.locale, () => {
  computePath(store.state.currentPath)
})

function loadHeaderBalances() {
  const addr = user.value?.addr
  if (!addr) return
  CurrentChainNode()
    .balances(addr)
    .then((data: any) => {
      balances.value = data
    })
    .catch(() => {
      balances.value = []
    })
}

watch(() => store.state.chainId, () => {
  loadHeaderBalances()
})

watch(() => store.state.networkRpcEpoch, () => {
  loadHeaderBalances()
})

const supportedWallets: Wallet[] = getWallets().sort(
  (w1: Wallet, w2: Wallet) => {
    const w1index = w1.installed ? 0 : 1;
    const w2index = w2.installed ? 0 : 1;
    return w1index - w2index;
  }
);

// 计算路径
const computePath = async (p: string) => {
  let ps = p.split("/").filter((_p) => _p != "");
  let pathPre = "";
  let cpaths: any[] = [];

  for (let i = 0; i < ps.length; i++) {
    let path = ps[i];
    let name = getRouteLabel(path)
    if (pathPre == "/cloud") {
      // const p = await getProject(user.value.addr, path)
      // if (p != null) {
      //   name = p.name.toLowerCase()
      // }
    }

    cpaths.push({
      name: name,
      url: pathPre + "/" + path,
    });
    pathPre = pathPre + "/" + path
  }

  module.value = ps[0];
  paths.value = cpaths;
  pkey.value = pkey.value + 1;
};

// 监控路径
watch(store.state, async (newQuestion, oldQuestion) => {
  let p = newQuestion.currentPath;
  user.value = newQuestion.userInfo;
  await computePath(p)
  menuShow.value = false;
  if (newQuestion.currentPath != "/login") {
    isShow.value = true;
  } else {
    isShow.value = false;
  }
})

onMounted(() => {
  computePath(store.state.currentPath)
  loadHeaderBalances()
});

const menuClick = () => {
  isFirst.value = false;
  menuShow.value = !menuShow.value;
};

const closeClick = () => {
  menuShow.value = false;
};

const home = () => {
  // router.push("/");
};

const nextOut = () => {
  let theme = window.localStorage.getItem("theme");
  let savedLocale = window.localStorage.getItem("locale");
  window.localStorage.clear();
  window.localStorage.setItem("theme", theme || "dark")
  window.localStorage.setItem("locale", savedLocale || LOCALE_EN_US)
  router.push("/login");
};

const setLocale = (nextLocale: string) => {
  store.dispatch("setLocale", nextLocale);
};

const setTheme = (t: string) => {
  store.dispatch("setTheme", t);
  document.documentElement.setAttribute("class", t);
  window.location.reload();
};

const wallet = (name: string): Wallet => {
  return supportedWallets.find((wallet, index) => {
    return wallet.extensionName == name
  })!
}
</script>

<style lang="scss" scoped>
@use "../assets/styles/components/menu.scss" as *;

.header-wrap {
  height: 60px;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  /* 与侧栏 .navList 15.5rem≈248px 对齐，避免顶栏占满视口导致长文案溢出 */
  left: 248px;
  right: 0;
  z-index: 100;
  min-width: 0;
  max-width: calc(100vw - 248px);
  overflow-x: auto;
  overflow-y: hidden;
  // border-bottom: 1px solid rgba($secondary-text-rgb, 0.055);
  background-color: rgba($primary-bg-rgb, 0.82);
  backdrop-filter: blur(18px) saturate(1.08);
  align-items: center;
  font-size: 11px;
}

.menu-list {
  margin: 0 5px 0 0px;
}

.header-space {
  flex: 1;
}

.header-left {
  height: 100%;
  width: 15.5rem;
  min-width: 15.5rem;
  border-right: 1px solid rgba($secondary-text-rgb, 0.05);
  display: flex;
  align-items: center;
  cursor: pointer;
  padding-left: 20px;
  box-sizing: border-box;
  margin-right: 18px;
}

.header-box {
  padding: 2px 2px 2px 0px;
  height: 22px;
  justify-content: space-between;
  font-size: 13px;
  min-width: 0;
}

.header-logo {
  overflow: hidden;
  padding: 7px 5px;
  background: rgba($primary-bg-rgb, 0.55);
  border: 1px solid rgba($secondary-text-rgb, 0.08);

  .icon {
    display: block;
    height: 14px;
  }
}

.main-chain {
  width: 20px;
  height: 20px;
}

.cur-service {
  display: flex;
  flex-direction: row;
  align-items: center;
  text-transform: uppercase;
  font-family: "pixel-font";
  color: $primary-text;
  margin-right: 4px;
  word-spacing: -6px;
}

.network-box {
  margin-right: 0px;
  align-items: center;
  background-color: rgba($secondary-text-rgb, 0.045);
  margin-right: 6Px;
  position: relative;
  cursor: pointer;
  padding-left: 8px;
  padding-right: 8px;
  min-width: 0;
  flex: 0 1 auto;
  max-width: min(42vw, 360px);
}

.locale {
  margin-right: 6px;
}

.locale-box {
  align-items: center;
  background-color: rgba($secondary-text-rgb, 0.045);
  cursor: pointer;
  padding-left: 10px;
  padding-right: 10px;
  min-width: 0;
  flex: 0 1 auto;
  max-width: 160px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.node-name {
  align-items: center;
  display: flex;
  min-width: 0;
  flex: 1 1 auto;

  &>img {
    width: 16px;
    height: 16px;
    display: inline-block;
    margin-right: 5px;
    flex-shrink: 0;
  }
}

.node-name__text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.network {
  margin-left: 6px;
  flex-shrink: 0;
}

.header-input {
  flex: 1;
  height: 40px;

  .el-input__icon {
    font-size: 16px;
  }

  :deep(.el-input__wrapper) {
    border: none !important;
  }
}

.header-user-box {
  height: 20px;

  .el-dropdown {
    color: $secondary-text;
    cursor: pointer;
  }
}

.header-msg-box {
  width: 25px;
  height: 25px;
  line-height: 28px;
  text-align: center;
  border-radius: 50%;
  font-size: 14px;
  box-shadow: 0px 10px 14px 0px rgba(10, 4, 60, 0.04);
  flex: none;
  margin-left: 20px;
  margin-right: 20px;
}

.header-user-img {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex: none;

  img {
    margin: 2px;
    width: 16px;
    height: 16px;
  }
}

.more-item {
  font-family: monospace;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-right: -10px;
  font-size: 13px;
  line-height: 1.8;
}

.header-user-info {
  padding-left: 4px;
  min-width: 30px;
  max-width: 110px;
  overflow: hidden;
}

.header-user-name {
  font-size: 12px;
  line-height: 12px;
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgba($secondary-text-rgb, 0.7);
  font-weight: bold;
}

.header-user-role {
  font-size: 10px;
  line-height: 10px;
  padding-top: 3px;
  color: $light-block;
}

.header-user-more-box {
  width: 18px;
  height: 32px;
}

.header-user-more {
  width: 18px;
  height: 32px;
  border-radius: 30px;
  background-color: #faf6f9;
  color: $primary-bg;
  line-height: 36px;
  text-align: center;
  cursor: pointer;
}

.more-item-icon {
  padding-right: 10px;
}

.theme {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-right: 6Px;

  >div {
    padding: 5px;
    width: 22px;
    height: 22px;
    cursor: pointer;
    text-align: center;
    background-color: rgba($secondary-text-rgb, 0.045);

    i {
      font-size: 16px;
      line-height: 22px;
    }
  }

  >div.active {
    background-color: rgba($secondary-text-rgb, 0.15);
  }
}

.account {
  background-color: rgba($secondary-text-rgb, 0.045);
  margin-right: 15px;
  padding: 0 4px;
  min-width: 0;
  flex: 0 1 auto;
  max-width: min(40vw, 320px);
}

.balance {
  background-color: rgba($secondary-text-rgb, 0.045);
  padding: 2px 0px 2px 10px;
  height: 22px;
  line-height: 22px;
  margin-right: 2px;
  min-width: 0;
  flex: 0 1 auto;
  max-width: min(36vw, 280px);

  .balance-trigger {
    display: flex;
    align-items: center;
    min-width: 0;
    max-width: 100%;
    gap: 4px;
  }

  .balance-trigger__value {
    min-width: 0;
    flex: 1 1 auto;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .balance-trigger .icon {
    flex-shrink: 0;
  }

  .unit {
    display: inline-block;
    font-weight: bold;
    opacity: 0.5;
  }

  .icon {
    font-size: 11px;
    display: inline-block;
    margin-left: 8px;
    margin-right: 10px;
  }
}

.network-select {
  width: 250px;
}

@media screen and (max-width: 992px) {
  .header-box {
    max-width: 288px;
    flex: none;
  }

  .header-space {
    display: block;
  }

  .header-input {
    display: none;
  }

  .header-user-box {
    border: none;
  }
}

@media screen and (max-width: 450px) {
  .menu-box {
    display: none;
  }

  .header-box {
    margin-left: 0;
  }
}

@media screen and (max-width: 700px) {
  .network-box {
    display: none !important;
  }
}
</style>

<style lang="scss">
.network-select {
  width: 250px !important;
  padding: 0 !important;
  border-radius: 0 !important;
  border: none !important;
}
</style>