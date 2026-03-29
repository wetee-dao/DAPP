<template>
  <div class="header-wrap flex" v-show="isShow" key="header">
    <div class="header-left" @click="menuClick">
      <!-- <div class="menu-list">
        <div :class="isFirst
        ? 'menu-item'
        : menuShow
        ? 'menu-item-active menu-item'
        : 'menu-item menu-item-out'
      " v-for="item in 3" :key="item" />
      </div> -->
      <div class="cur-service">
        PlusWeb
      </div>
      <div class="header-logo" @click="home">
        <Logo class="icon" :fill="true" />
      </div>
      <!-- <SvgImg class="main-chain" name="polkadot_mini"/> -->
    </div>

    <HeaderNav :key="pkey" :paths="paths" v-if="paths.length > 0" />
    <div class="header-space"></div>

    <!-- <div class="balance">Balance: 1000WTE</div> -->

    <!-- <div class="theme">
      <div :class="theme == 'dark' || theme == '' ? 'active' : ''" @click="setTheme('dark')"><i
          class="icon select-icon">&#xe60f;</i>
      </div>
      <div :class="theme == 'light' ? 'active' : ''" @click="setTheme('light')"><i class="icon select-icon">&#xe6bd;</i>
      </div>
    </div> -->

    <el-popover popper-class="network-select" placement="bottom-end" trigger="hover">
      <template #reference>
        <div class="header-box flex network-box">
          <div class="node-name">
            <img :src="network.icon" />
            <div>{{ network.name }}</div>
            <Network class="network" />
          </div>
        </div>
      </template>
      <template #default>
        <NetworkSelect />
      </template>
    </el-popover>

    <el-dropdown class="balance" placement="bottom-end" :teleported="false" v-if="balances.length > 0 && isShow">
      <div>
        {{ balances[0].value }} <span class="unit">{{ balances[0].name }}</span>
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
              &nbsp;<span class="icon more-item-icon">&#xe605;</span> Disconnect&nbsp;&nbsp;&nbsp;
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
  <NavList v-show="isShow" :key="module" :module="module" @closeClick="closeClick" />
  <div class="logo-bg" v-show="isShow" :showName="true">
    <div class="cur-service">
      PlusWeb3
    </div>
    <div class="header-logo" @click="home">
      <Logo class="icon" :fill="true" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import NavList from "./nav-list.vue";
import HeaderNav from "./header-nav.vue";
import Logo from "./icons/Logo2.vue";
import Network from "./network.vue";
import NetworkSelect from "./network-select.vue";
import { ChainNode, CurrentChainNode } from "@/plugins/chain";
import { getWallets, Wallet } from "@talismn/connect-wallets";

const router = useRouter();
const store = useStore();
const menuShow = ref(false);
const isFirst = ref(true);
const pkey = ref(0);
const user = ref(store.state.userInfo);
const isShow = ref(store.state.currentPath != "/login");
const theme = ref(store.state.theme);
const network = ref<ChainNode>(CurrentChainNode());
const balances = ref<any[]>([]);
const paths = ref<any[]>([]);
const module = ref("");
watch(() => store.state.theme, (newVal, _) => {
  theme.value = newVal
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
    let name = path
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
  network.value.balances(user.value.addr).then((data: any) => {
    balances.value = data
  })
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
  window.localStorage.clear();
  window.localStorage.setItem("theme", theme || "dark")
  router.push("/login");
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
  width: 100%;
  height: 60px;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  border-bottom: 1px solid rgba($secondary-text-rgb, 0.055);
  background-color: rgba($primary-bg-rgb, 0.82);
  backdrop-filter: blur(18px) saturate(1.08);
  align-items: center;
}

.menu-list {
  margin: 0 5px 0 0px;
}

.header-space {
  flex: 1;
}

.header-left {
  height: 100%;
  width: 9.8rem;
  min-width: 9.8rem;
  border-right: 1px solid rgba($secondary-text-rgb, 0.05);
  display: flex;
  align-items: center;
  cursor: pointer;
  padding-left: 20px;
  box-sizing: border-box;
  margin-right: 18px;
}

.header-box {
  padding: 5px 5px;
  height: 22px;
  justify-content: space-between;
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
  font-size: 20px;
  font-family: "pixel-font";
  color: $primary-text;
  margin-right: 4px;
  word-spacing: -6px;
}

.logo-bg {
  position: fixed !important;
  top: 13px !important;
  left: 20px !important;
  display: flex;
  align-items: center;
  transform: scale(1.1);
  justify-content: center;

  .cur-service {
    word-spacing: -10px;
    letter-spacing: -2px;
  }

  .block {
    margin-left: 4px;
  }
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
}

.node-name {
  align-items: center;
  display: flex;

  &>img {
    width: 16px;
    height: 16px;
    display: inline-block;
    margin-right: 5px;
  }

  &>div {
    font-size: 14px;
  }
}

.network {
  margin-left: 6px;
}

.header-input {
  flex: 1;
  height: 40px;

  .el-input__icon {
    font-size: 18px;
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
  font-size: 18px;
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
  font-size: 14px;
  line-height: 1.8;
}

.header-user-info {
  padding-left: 4px;
  min-width: 30px;
  max-width: 110px;
  overflow: hidden;
}

.header-user-name {
  font-size: 14px;
  line-height: 12px;
  font-family: monospace;
  word-break: break-all;
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
  margin-right: 21px;
  padding: 0 4px;
}

.balance {
  background-color: rgba($secondary-text-rgb, 0.045);
  padding: 5px 0px 5px 10px;
  height: 22px;
  line-height: 22px;
  margin-right: 2px;

  .unit {
    display: inline-block;
    font-weight: bold;
    opacity: 0.5;
  }

  .icon {
    font-size: 12px;
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