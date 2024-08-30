<template>
  <div class="navList" @click="closeClick">
    <div class="left" @click="(e: any) => e.stopPropagation()">
      <ul v-for="(item, index) in lists">
        <li class="left_one" >
          <a href="javascript:void(0);">
            <!-- <span class="icon" v-html="item.icon"></span> -->
            {{ item.name }}
          </a>
        </li>
      </ul>
    </div>
    <div class="right" @click="(e: any) => e.stopPropagation()">
      <!-- <el-input
        class="search"
        placeholder="请输入内容"
        prefix-icon="el-icon-search"
        v-model="input"
        clearable
      ></el-input> -->
      <div class="right_list">
        <div :key="index" v-for="(item, index) in lists">
          <div @click="toUri(sub.url)" :key="sub.name" v-for="sub in search(item.sub)">
            <div class="icon">
              <Picon :icon="sub.icon" />
            </div>        
            {{ sub.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import Picon from "./icons/picon.vue";
import service from "../utils/service";

export default defineComponent({
  name: "navList",
  setup(_, context) {
    const router = useRouter();
    const input = ref("");
    const lists = ref(service);

    const closeClick = () => {
      context.emit("closeClick", false);
    };
    const search = (list: any) => {
      return list.filter(
        (v: any) => v.name.toLowerCase().indexOf(input.value.toLowerCase()) > -1
      );
    };

    const toUri = (f: string) => {
      router.push(f);
      context.emit("closeClick", false);
    };
    return {
      lists,
      input,
      closeClick,
      search,
      toUri,
    };
  },
});
</script>

<style lang="scss" scoped>
.navList {
  width: 100%;
  position: fixed;
  left: 0;
  display: flex;
  background-color: rgba(0, 0, 0, 0.2);
  height: calc(100% - 75px);
  z-index: 99;
  top: 75px;
}

.left {
  background-color: $primary-bg;
  width: 140px;

  ul {
    padding-top: 15px;

    li {
      width: 100%;

      a {
        display: inline-block;
        padding: 15px 20px;
      }
    }

    .left_one {
      font-weight: bold;
      background-color: $secondary-bg;
      font-size: 18px;

      .icon {
        font-size: 20px;
        margin-right: 8px;
      }
    }
  }
}

.right {
  height: 100%;
  width: 250px;
  background-color: $secondary-bg;
  padding: 15px 20px;

  .search {
    margin-bottom: 20px;
  }

  .right_list {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;

    >div {
      flex: 1;

      >div {
        border: 0;
        display: flex;
        font-size: 18px;
        line-height: 18px;
        cursor: pointer;
        margin-bottom: 10px;
        padding: 15px;
        border: 2px solid rgba($secondary-text-rgb, 0.03);
        border-radius: 4px;
        flex-direction: row;
        align-items: center;

        .icon{
          width: 30px;
          height: 30px;
          margin-right: 8px;
        }
      }
    }
  }
}
</style>
