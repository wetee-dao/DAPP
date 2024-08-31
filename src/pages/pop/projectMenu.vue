<template>
  <div class="menu-box" @click="closeClick">
    <ul :style="'top:' + y + ';left:' + x" @click="(e: any) => e.stopPropagation()" class="menu-list">
      <li class="menu-item" :style="item.color ? 'color:' + item.color : ''" @click="doAction(item)"
        v-for="item in mlist" v-show="item.display == null || item.display()">
        <span class="icon" v-html="item.icon"></span>
        {{ item.title }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const props = defineProps(["router", "store", "close", "params"])
const closeClick = () => {
  props.close();
};
const mlist = ref(props.params.item.Type == "INK" ? [
  {
    title: "Ink! contract meta",
    icon: "&#xe6b6;",
    cmd: "inkMeta"
  },
  {
    title: "Ink! contract call",
    icon: "&#xe64d;",
    cmd: "inkCall"
  },
] : [
  {
    title: "View Metrics",
    icon: "&#xe60d;",
    cmd: "metrics"
  },
  {
    title: "View Settings",
    icon: "&#xe6b6;",
    cmd: "settings"
  },
  {
    title: "Restart/Rerun",
    icon: "&#xe64d;",
    cmd: "restart",
  },
  {
    title: "Stop",
    icon: "&#xe641;",
    cmd: "stop",
    color: "#e42537",
    display: () => {
      return props.params!.item.Status != 2;
    }
  },
]);

const itemLength = mlist.value.filter((item) => item.display == null || item.display());
const itemHeight = itemLength.length * 36 + 20;

const store = props.store!;
let cx = props.params!.event.x;
if (props.params!.event.x > document.documentElement.clientWidth - 150 * store.state.scale) {
  cx = document.documentElement.clientWidth - 150 * store.state.scale;
}
let cy = props.params!.event.y;
if (props.params!.event.y > document.documentElement.clientHeight - itemHeight * store.state.scale) {
  cy = props.params!.event.y - itemHeight * store.state.scale;
}
const x = ref(cx + "px");
const y = ref(cy + "px");


const doAction = (item: any) => {
  props.close(item.cmd);
};

</script>

<style lang="scss" scoped>
.menu-box {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  z-index: 10;

  .menu-list {
    border-radius: 10px;
    overflow: hidden;
    background-color: $primary-bg;
    width: 200px;
    position: absolute;
    border: 2px solid rgba($gray-bg, 0.1);
    display: flex;
    flex-direction: column;
    padding: 10px 0;
    color: rgba($secondary-text-rgb, 0.7);

    .menu-item {
      padding: 8px 15px;
      height: 20px;
      line-height: 20px;
      cursor: pointer;

      &:hover {
        background-color: $secondary-bg;
        color: $primary-text;
      }

      .icon {
        margin-right: 6px;
      }
    }
  }
}
</style>