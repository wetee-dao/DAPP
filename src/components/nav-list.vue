<template>
  <div class="navList">
    <!-- <div class="left" @click="(e: any) => e.stopPropagation()">
        <ul v-for="(item, _index) in lists">
          <li class="left_one" >
            <a href="javascript:void(0);">
              {{ item.name }}
            </a>
          </li>
        </ul>
      </div> -->
    <div class="list">
      <div :class="item.module==props.module?'active':''" @click="toUri(item.url)" :key="item.name" v-for="(item, index) in lists">
        <div class="icon">
          <Picon :icon="item.icon" />
        </div>
        {{ item.name }}
        <div class="left"></div>
        <div class="right"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import service from "../utils/service";

const router = useRouter();
const input = ref("");
const lists = ref(service);
const props = defineProps(["module"])

const search = (list: any) => {
  return list.filter(
    (v: any) => v.name.toLowerCase().indexOf(input.value.toLowerCase()) > -1
  );
};

const toUri = (f: string) => {
  router.push(f);
};
</script>

<style lang="scss" scoped>
.navList {
  position: fixed;
  left: 0;
  height: calc(100% - 60px);
  z-index: 99;
  top: 60px;
  border-right: 1Px solid rgba($secondary-text-rgb, 0.09);
  background-color: rgba($primary-bg-rgb, 1);

  .search {
    margin-bottom: 20px;
  }

  .list {
    display: flex;
    flex-direction: column;
    width: 130px;
    margin-top: 10px;

    >div {
      border: 0;
      display: flex;
      font-size: 14px;
      line-height: 14px;
      cursor: pointer;
      padding: 15px 0px;
      flex-direction: row;
      align-items: center;
      color: rgba($secondary-text-rgb, 1);
      // font-weight: 700;
      justify-content: center;

      .icon {
        width: 22px;
        height: 22px;
        margin-right: 5px;
        opacity: 0.9;
        margin-left: -4px;

        :deep(path) {
          fill: rgba($secondary-text-rgb, 0.8);
        }
      }

      &.active {
        color: $primary-text;
        background-color: rgba($primary-bg-rgb, 0.1);
        position: relative;

        &::after,&::before{
          content: "";
          position: absolute;
          left: 0;
          top: calc(50% - 2px);
          width: 4px;
          height: 4px;
          background-color: rgba($primary-text-rgb, 1);
        }
        &::before{
          left: auto;
          right: 0;
        }

        .icon {
          opacity: 1;

          :deep(path) {
            fill: $primary-text;
          }
        }

        .left,.right {
          position: absolute;
          left: 1px;
          top: 50%;
          width: 6px;
          height: 1px;
          background-color: rgba($primary-text-rgb, 0.6);
        }

        .right {
          right: 1px;
          left: auto;
        }
      }
    }
  }
}
</style>
