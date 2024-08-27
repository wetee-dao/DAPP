<template>
  <div class="service" @click="closeClick">
    <div @click="(e: any) => e.stopPropagation()">
      <div class="title">
        <!-- <i class="icon">&#xe613;</i> -->
        Create
        <i class="icon right" @click="closeClick">&#xe604;</i>
      </div>
      <div class="list">
        <div :key="index" :class="current == index ? 'active' : ''" v-for="(ins, index) in list"
          @mouseover="active(index)" @click="toAdd(ins)">
          <i class="icon prefix" v-html="ins.icon"></i>
          {{ ins.name }}
          <div class="space"></div>
          <i class="icon">&#xe614;</i>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const props = defineProps(["router", "store", "close", "app"])
const current = ref(0);
const list = ref([{
  name: "Confidential Service",
  type: "service",
  icon: "&#xe701;",
}, {
  name: "Confidential Task",
  type: "task",
  icon: "&#xe77c;"
}, {
  name: "GPU Compute service",
  type: "gpu",
  icon: "&#xe649;"
}, {
  name: "Smart Contract",
  type: "ink",
  icon: "&#xe663;"
}])

const closeClick = () => {
  props.close();
};

const toAdd = (item: any) => {
  props.close();
  setTimeout(() => {
    if (item.type == "service") {
      props.app!.config.globalProperties.$AddService(props.router, props.store, props.close)
    } else if (item.type == "task") {
      props.app!.config.globalProperties.$AddTask(props.router, props.store, props.close)
    } else if (item.type == "gpu") {
      props.app!.config.globalProperties.$AddGpuService(props.router, props.store, props.close)
    } else {
      props.app!.config.globalProperties.$Addink(props.router, props.store, props.close)
      // ElNotification({
      //   title: 'Notice',
      //   message: "Not support yet",
      //   type: 'warning',
      // })
    }
  }, 100);
};

const active = (index: number) => {
  current.value = index;
};
</script>

<style lang="scss" scoped>

i {
  font-style: normal;
}

.right {
  float: right;
  display: block;
  transform: rotate(45deg);
  cursor: pointer;
  font-size: 24px;
  position: relative;
  right: -12px;
}

.service {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  height: 100%;
  z-index: 101;

  >div {
    border-radius: 10px;
    overflow: hidden;
    background-color: $secondary-bg;
    max-width: 500px;
    width: 80%;
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    border: 6px solid rgba($gray-bg, 0.1);
  }
}

.title {
  padding: 20px 30px;
  border-bottom: 2px solid rgba($gray-bg, 0.1);
  font-size: 18px;
  line-height: 18px;

  .icon {
    font-weight: bold;
    font-size: 18px;
    margin-right: 10px;
  }
}

.list {
  display: flex;
  padding: 10px 15px;
  flex-direction: column;

  >div {
    display: flex;
    padding: 16px 15px;
    border-radius: 10px;
    font-size: 18px;
    cursor: pointer;
    align-items: center;

    &.active {
      background-color: rgba($gray-bg, 0.2);
    }

    .icon {
      font-size: 18px;
      position: relative;
      right: -2px;
      line-height: 26px;
    }

    .prefix{
      display: inline-block;
      margin-right: 15px;
    }
  }
}
</style>