<template>
  <div class="box">
    <div class="logp-wrap mask-bg">
      <Logo class="logo" />
      <div class="mask-text">
        <Logo class="logo" />
      </div>
    </div>
    <div class="mask-bg title">{{ title }}
      <div class="mask-text"></div>
    </div>
    <input type="text" class="input" v-model="title" placeholder="请输入地址" />
  </div>
</template>

<script lang="ts" setup>
import Logo from "@/components/icons/logo.vue";
import { ref } from "vue";

const title = ref("")

</script>

<style lang="scss" scoped>
@import "../../assets/styles/components/menu.scss";

.box {
  padding-top: 110px;


  .title {
    font-size: 30px;
    margin: 100px;
    // .mask-text {
    //   left: 0px !important;
    // }
  }

  .input {
    margin: 100px;
  }

  .logp-wrap {
    margin: 100px;
    font-size: 40px;
    .logo {
      height: 160px;
    }
  }

  .mask-bg {
    padding: 0.5em;
    color: $primary-text;
    // font-weight: bold;
    // font-size: 16px;
    position: relative;

    &::after {
      content: " ";
      position: absolute;
      width: calc(100% + 0.375em);
      height: calc(100% + 0.375em);
      right: 0.125em;
      bottom: 0px;
      background-image: radial-gradient(transparent 0.0626em, $primary-bg 0.0626em);
      background-size: 0.25em 0.25em;
      backdrop-filter: saturate(50%) blur(0.25em);
    }

    .mask-text {
      position: absolute;
      z-index: 3;
      font-size: 1em;
      top: 0.28em;
      left: 0.2em;
    }
  }
}
</style>