
<template>
  <div>
    <div class="insList" v-for="(item, index) in msg" :key="index">
      <div class="left">
        <div>
          <span class="icon" v-html="item.icon"></span>
        </div>
        <div>
          <p>{{ item.name }}</p>
          <p>{{ item.desc }}</p>
        </div>
      </div>
      <div class="center">
        <p>{{ dateTime(item.created_at) }}</p>
        <p>{{ item.type }}</p>
      </div>
      <div class="insright" @click="textClick(item)">管理</div>
    </div>
  </div>
</template>

<script lang="ts">
import dayjs from "dayjs";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { PropType } from "vue";
interface culation {
  icon: string;
  name: string;
  desc: string;
  created_at: string;
  type: string;
}
export default {
  name: "insList",
  props: {
    msg: Array as PropType<culation[]>,
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    const dateTime = (value: any) => {
      return dayjs(value).format("YYYY-MM-DD HH:ss");
    };
    const textClick = (item: any) => {
      router.push(
        "/app_chain/blockInfo/list?app_id=" +
          item.id +
          "&org_id=" +
          store.state.userInfo.org_id
      );
    };
    return {
      dateTime,
      textClick,
    };
  },
};
</script>

<style lang="scss" scoped>

.insList {
  box-sizing: border-box;
  width: 100%;
  height: 78px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  padding: 0 30px;
  border-bottom: 1px dashed rgba(209, 212, 213, 0.72);
}

.insList:first-child {
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.insList:last-child {
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  margin-bottom: 0;
  border-bottom: none;
}

.left,
.center {
  display: flex;
  align-items: center;
}

.left {
  flex: 1;
  div:first-of-type {
    width: 48px;
    height: 48px;
    background: $gray-bg;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: $secondary-bg;
    font-weight: 800;
    font-size: 20px;

    img {
      width: 25px;
      height: 28px;
    }
  }

  div:last-of-type {
    margin-left: 25px;

    p:last-of-type {
      color: $light-block;
      line-height: 30px;
    }
  }
}

.center {
  width: 350px;
  p:first-of-type {
    color: $light-block;
    font-size: 15px;
  }

  p:last-of-type {
    width: 128px;
    height: 30px;
    background: $gray-bg;
    border-radius: 12px;
    color: $secondary-bg;
    line-height: 30px;
    text-align: center;
    margin-left: 40px;
  }
}

.insright {
  width: 50px;
  text-align: center;
  cursor: pointer;
}

@media screen and (max-width: 500px) {
  .center {
    display: none;
  }
}
</style>