<template>
  <div class="header-wrap flex" v-show="isShow" key="header">
    <div class="header-left" @click="menuClick">
      <!--<div class="menu-list">
        <div :class="isFirst
        ? 'menu-item'
        : menuShow
        ? 'menu-item-active menu-item'
        : 'menu-item menu-item-out'
      " v-for="item in 3" :key="item" />
      </div> -->
      <div class="header-logo" @click="home">
        <Logo />
      </div>
      <div class="cur-service">
        <div>{{ LogoText }}</div>
        <i class="icon select-icon">&#xe600;</i>
      </div>
    </div>

    <HeaderNav :key="pkey" :paths="paths" v-if="paths.length > 0" />
    <div class="header-space"></div>

    <!-- <div class="balance">Balance: 1000WTE</div> -->

    <div class="theme">
      <div :class="theme == 'dark' ? 'active' : ''" @click="setTheme('dark')"><i class="icon select-icon">&#xe60f;</i>
      </div>
      <div :class="theme == 'light' ? 'active' : ''" @click="setTheme('light')"><i class="icon select-icon">&#xe6bd;</i>
      </div>
    </div>
    <div class="header-box flex network-box">
      <div class="node-name">MAIN
        <Network class="network" />
      </div>
    </div>

    <el-dropdown placement="bottom-end" :teleported="false" v-if="user.addr != null && isShow">
      <div class="header-box flex">
        <div class="header-user-box flex">
          <div style="display: flex; align-items: center">
            <div class="header-user-img">
              <Identicon :key="theme" :hash="ss58toHex(user.addr)" :padding="0.1"
                :foreground="theme == 'dark' ? [80, 250, 130, 255] : [21, 132, 54, 255]"
                :background="[80, 255, 130, 0]"
                :strokeColor="theme == 'dark' ? [0, 0, 0, 225] : [255, 255, 255, 220]" 
                :stroke="0.2"
                :size="16" />
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
              &nbsp;<span class="icon more-item-icon">&#xe605;</span> Login out&nbsp;&nbsp;&nbsp;
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
  <NavList v-show="menuShow && isShow" @closeClick="closeClick" />
  <div class="logo-bg" v-show="isShow" :showName="true">
    <div class="header-logo" @click="home">
      <Logo />
    </div>
    <div class="cur-service">
      {{ LogoText }} <div class="block">I</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import NavList from "./navList.vue";
import HeaderNav from "./headerNav.vue";
import Identicon from "./identicon.vue";
import Logo from "./icons/logo.vue";
import Network from "./network.vue";
import { ss58toHex } from "@/utils/chain";
import { getProject } from "@/apis/project";

const router = useRouter();
const store = useStore();
const menuShow = ref(false);
const isFirst = ref(true);
const pkey = ref(0);
const user = ref(store.state.userInfo);
const isShow = ref(store.state.currentPath != "/utils/login");
const theme = ref(store.state.theme);
const paths = ref<any[]>([]);
const LogoText = ref("");
watch(() => store.state.theme, (newVal, _) => {
  theme.value = newVal
})

// 计算路径
const computePath = async (p: string) => {
  let ps = p.split("/").filter((_p) => _p != "");
  let pathPre = "";
  let cpaths: any[] = [];

  for (let i = 0; i < ps.length; i++) {
    let path = ps[i];
    let name = path
    if (pathPre == "/cloud") {
      const p = await getProject(user.value.addr, path)
      if (p != null) {
        name = p.name.toLowerCase()
      }
    }

    cpaths.push({
      name: name,
      url: pathPre + "/" + path,
    });
    pathPre = pathPre + "/" + path
  }

  if (ps[0] == "cloud") {
    LogoText.value = "Cloud"
  } else if (ps[0] == "miner") {
    LogoText.value = "Miner"
  }

  paths.value = cpaths;
  pkey.value = pkey.value + 1;
};

// 监控路径
watch(store.state, async (newQuestion, oldQuestion) => {
  let p = newQuestion.currentPath;
  user.value = newQuestion.userInfo;
  await computePath(p)
  menuShow.value = false;
  if (newQuestion.currentPath != "/utils/login") {
    isShow.value = true;
  } else {
    isShow.value = false;
  }
})

onMounted(() => {
  computePath(store.state.currentPath)
});

const menuClick = () => {
  isFirst.value = false;
  menuShow.value = !menuShow.value;
};

const closeClick = () => {
  menuShow.value = false;
};

const home = () => {
  router.push("/");
};

const nextOut = () => {
  let theme = window.localStorage.getItem("theme");
  window.localStorage.clear();
  window.localStorage.setItem("theme", theme || "dark")
  router.push("/utils/login");
};

const setTheme = (t: string) => {
  store.dispatch("setTheme", t);
  document.documentElement.setAttribute("class", t);
};
</script>

<style lang="scss" scoped>
@import "../assets/styles/components/menu.scss";

.header-wrap {
  width: 100%;
  height: 75px;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  border-bottom: 2px solid rgba($secondary-text-rgb, 0.05);
  background-image: radial-gradient(transparent 1px, $primary-bg 1px);
  background-size: 4px 4px;
  backdrop-filter: saturate(50%) blur(4px);
  align-items: center;
}

.menu-list {
  margin: 0 auto;
}

.header-logo {
  height: 22px;
  margin-left: 27px;
  margin-bottom: 1.8px;
  border-radius: 2px;
  overflow: hidden;
}

.header-space {
  flex: 1;
}

.header-left {
  height: 100%;
  display: flex;
  align-items: center;
  cursor: pointer;
  // border-right: 2px solid rgba($secondary-text-rgb, 0.03);
}

.header-box {
  padding: 10px 12px;
  margin: 0px 20px 0px 0px;
  background-color: rgba($secondary-bg-rgb, 0.8);
  border-radius: 4px;
  height: 20px;
  justify-content: space-between;
}

.cur-service {
  padding: 0px 6px;
  display: flex;
  flex-direction: row;
  align-items: center;
  text-transform: uppercase;
  margin-left: 0px;
  margin-right: 3px;
  font-size: 24px;
  font-family: "pixel-font";
  font-weight: bold;
  letter-spacing: 2px;
  color: rgba($primary-text-rgb, 1);

  .select-icon {
    font-size: 18px;
    line-height: 32px;
    height: 30px;
    display: flex;
    fill: $primary-text;
    margin-left: -3px;
    display: block;
  }
}

.network-box {
  margin-right: 10px;
  align-items: center;
}

.node-name {
  font-size: 14px;
  height: 14px;
  line-height: 14px;
  display: inline-flex;
  align-items: center;
}

.network {
  margin-left: 10px;
}

// 改原有框架样式
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
  // border-left: 2px solid $line-color;
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
  width: 25px;
  height: 25px;
  border-radius: 50%;
  flex: none;
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
  padding-left: 7px;
  min-width: 30px;
  max-width: 110px;
  overflow: hidden;
}

.header-user-name {
  font-size: 14px;
  line-height: 12px;
  font-family: monospace;
  word-break: break-all;
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

.balance {
  margin-right: 15px;
  font-size: 13px;
}

.theme {
  display: flex;
  flex-direction: row;

  >div {
    margin-right: 15px;
    padding: 2px;
    border-radius: 50%;
    width: 22px;
    height: 22px;
    cursor: pointer;
    text-align: center;

    i {
      font-size: 16px;
      line-height: 22px;
    }
  }

  >div.active {
    background-color: rgba($secondary-text-rgb, 0.15);
  }
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

.logo-bg {
  position: fixed !important;
  top: 19px !important;
  left: 6px !important;
  display: flex;
  align-items: center;
  transform: scale(1.18);
  height: 34px;
  .cur-service{
    letter-spacing: -2px;
    align-items: center;
  }
  .block{
    margin-left: 4px;
  }
}
</style>
