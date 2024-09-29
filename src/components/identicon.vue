<template>
  <!-- <img class="identicon" :src="'data:image/svg+xml;base64,' + data" /> -->
  <div class="identicon" v-html="data" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
// @ts-ignore
import Identicon from "@/utils/identicon/identicon.js";

export default defineComponent({
  name: "identicon",
  props: ["hash", "padding", "foreground", "background", "stroke","strokeColor", "radius"],
  components: {},
  setup(props: any) {
    let options = {
      foreground: props.foreground ?? [30, 43, 39, 255],
      background: props.background ?? [80, 255, 130, 255],
      strokeColor: props.strokeColor ?? [30, 43, 39, 255],
      margin: props.padding ?? 0.2,
      size: 90,
      radius: props.radius ?? 0,
      stroke: props.stroke ?? 0,
    };

    let data = new Identicon(props.hash, options).toString(true);
    return {
      data,
    };
  },
});
</script>

<style scoped>
.identicon {
  height: 100%;
  width: 100%;
  svg{
    width: 100%;
    height: 100%;
  }
}
</style>
