<template>
  <el-config-provider :locale="elementLocale">
    <div id="mainNav">
      <PixelBg :tileSize="5" :gap="3" :maxOpacity="0.03" :density="0.12" :waveSpeed="0.0015" :theme="currentTheme" />
      <GHeader />
      <!-- 主应用入口 -->
      <router-view class="main-content" />
      <!-- 子应用入口 -->
      <div v-show="$route.fullPath.indexOf('app_') > -1" id="subview" />
    </div>
  </el-config-provider>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, computed, watch } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import en from 'element-plus/es/locale/lang/en'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import GHeader from "./components/header.vue";
import PixelBg from "./components/anim/PixelBg.vue";
import { LOCALE_ZH_CN, setI18nLanguage } from "./i18n";

const store = useStore();
const { locale } = useI18n();
const currentTheme = computed(() => store.state.theme || 'dark');
const elementLocale = computed(() => (
  store.state.locale === LOCALE_ZH_CN ? zhCn : en
));

watch(
  () => store.state.locale,
  (newLocale) => {
    setI18nLanguage(newLocale);
    locale.value = newLocale;
  },
  { immediate: true }
);

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
}

.main-content{
  margin-left: 248px;
  width: calc(100vw - 248px) !important;
  box-sizing: border-box;
  padding: 60px 32px 0px;
}

#subview {
  padding-left: 248px;
  height: calc(100vh - 70px);
}

#subview>div {
  height: 100%;
}
</style>
