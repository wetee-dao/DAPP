<template>
  <el-config-provider :locale="en">
    <div id="mainNav">
      <GHeader />
      <!-- 主应用入口 -->
      <router-view class="main-content" />
      <!-- 子应用入口 -->
      <div v-show="$route.fullPath.indexOf('app_') > -1" id="subview" />
    </div>
  </el-config-provider>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted } from "vue";
import { useStore } from "vuex";
import en from 'element-plus/es/locale/lang/en'

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
  /* padding-left: 150px; */
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
  /* background-image: linear-gradient(
    170deg,
    rgba(0,0,0,0) 55%,
    rgba(255, 255, 255, 0.06) 90%,
    rgba(255, 255, 255, 0.09) 100%
  ); */
}

.main-content{
  margin-left: 150px;
  width: calc(100vw - 150px) !important;
  box-sizing: border-box;
  padding: 85px 20px 0;
}

#subview {
  padding-left: 150px;
  height: calc(100vh - 70px);
}

#subview>div {
  height: 100%;
}
</style>
