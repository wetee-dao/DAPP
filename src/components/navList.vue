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
  background-color: rgba(0, 0, 0, 0.8);
  height: calc(100% - 75px);
  z-index: 99;
  top: 55px;
}

.left {
  background-color: $primary-bg;
  width: 140px;

  ul {
    padding-top: 15px;

    li {
      width: 100%;

      a {
        display: block;
        padding: 15px 20px;
        color: rgba($secondary-text-rgb, 0.9);
        text-align: center;
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
        font-size: 17px;
        line-height: 17px;
        cursor: pointer;
        margin-bottom: 10px;
        padding: 15px;
        border: 1Px solid rgba($secondary-text-rgb, 0.15);
        flex-direction: row;
        align-items: center;
        color: rgba($secondary-text-rgb, 0.8);

        .icon{
          width: 26px;
          height: 26px;
          margin-right: 8px;
          opacity: 0.9;
        }
      }
    }
  }
}
</style>
