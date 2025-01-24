<template>
  <div id="mainNav">
    <GHeader />
    <!-- 主应用入口 -->
    <router-view />
    <!-- 子应用入口 -->
    <div v-show="$route.fullPath.indexOf('app_') > -1" id="subview" />
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useStore } from "vuex";

import GHeader from "./components/header.vue";

const store = useStore();
if (window.devicePixelRatio) {
  let scale = (window.devicePixelRatio - 1) * 1.4
  store.dispatch("setScale", (scale + 16) / 16);
  if (scale > 0 && scale < 0.5) {
    scale = 0.5
  }
  document.getElementsByTagName('html')[0].style.fontSize = (scale + 16) + 'px';
}

onMounted(async () => {
  document.getElementById('loader')!.style.display = "none";
  document.getElementById('mainApp')!.style.visibility = "visible";
});

onBeforeUnmount(() => {
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
