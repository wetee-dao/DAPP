<template>
  <div class="home">
    <el-row class="data" :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4" :key="item.addr" v-for="(item, index) in apps" @click="GotoApp(item)">
        <div class="projectItem">
          <div class="dataImg">
            {{ item.id }}
          </div>

          <div class="dataText">
            <p class="name">{{ item.name }} - v{{ versions[item.id] && versions[item.id][0] ? versions[item.id][0].version : '0' }}
            </p>
            <div class="images" v-if="versions[item.id] && versions[item.id][0]">
              <div class="image">{{ versions[item.id][0].value.i }}</div>
            </div>
          </div>

          <div class="mask-bg" v-if="item.ty == 'Service'">
            <i class="icon">&#xe649;</i>TEE Service
            <div class="mask-text"><i class="icon">&#xe701;</i> TEE Service</div>
          </div>
          <div class="mask-bg" v-if="item.ty == 'TASK'">
            <i class="icon">&#xe649;</i>ITEE Task
            <div class="mask-text"><i class="icon">&#xe77c;</i> TEE Task</div>
          </div>
          <div class="mask-bg" v-if="item.ty == 'GPU'">
            <i class="icon">&#xe649;</i>GPU Service
            <div class="mask-text"><i class="icon">&#xe649;</i> GPU Service</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4" :key="100000" @click="add()">
        <div class="projectItem add">
          <div class="dataImg gray-icon">
            <span class="icon">&#xe610;</span>
          </div>
          <div class="dataText">
            <p class="name">Build a application</p>
            <p class="desc">Upload application and start mint</p>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import useGlobelProperties from "@/plugins/globel";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { getNumstrfromChain, getSS5842 } from "@/utils/chain";
import { $getQueryApi } from "@/plugins/chain";
const global = useGlobelProperties()

const store = useStore();
const router = useRouter();
const apps = ref<any[]>([]);
const versions = ref<any>({});

const GotoApp = (item: any) => {
  router.push("/builder/" + item.id)
};

const add = () => {
  global.$Build(router, store, {
    mod:""
  }, () => {
    getList()
  })
};

onMounted(async () => {
  getList()
});

const getList = async () => {
  const appsIds = await $getQueryApi().entries("store", "accountApps", [store.state.userInfo.addr])
  const ids = appsIds.map((item: any) => {
    return getNumstrfromChain(item.keys[1])
  })
  if (ids.length == 0) {
    apps.value = [];
    versions.value = {};
    return
  }

  const appsList = await $getQueryApi().multi_query("store", "apps", ids)
  apps.value = appsList;

  let cversions: any = {}
  for (let i = 0; i < ids.length; i++) {
    const item = ids[i]
    const appsVersion = await $getQueryApi().entries("store", "versionLists", [item])
    cversions[item] = appsVersion.map((version: any) => {
      let v = version.value
      return {
        version: version.keys[1],
        block: getNumstrfromChain(v[1]),
        value: v[0][0],
      };
    }).reverse()
  }
  versions.value = cversions
}
</script>

<style lang="scss" scoped>
.home {
  box-sizing: border-box;
  width: 100%;
  padding: 60px 20px 0;
}

.page-title {
  font-size: 22px;
  line-height: 30px;
  font-weight: 500;
  padding-bottom: 10px;
  padding-top: 20px;

  .page-title-more {
    display: block;
    float: right;
    font-size: 20px;
    line-height: 22px;
    height: 22px;
    cursor: pointer;
    margin-top: 6px;

    span {
      font-size: 14px;
      line-height: 22px;
      vertical-align: bottom;
    }
  }
}

.data {
  justify-content: flex-start;
  padding-top: 20px;
  margin: 0 -20px;

  .projectItem {
    background-color: rgba($primary-bg-rgb, 1);
    border: 1Px solid rgba($secondary-text-rgb, 0.125);
    display: flex;
    align-items: center;
    padding: 0px 20px;
    cursor: pointer;
    margin-bottom: 20px;
    position: relative;

    .dataImg {
      width: 40px;
      height: 40px;
      padding: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 5%;
      word-break: break-all;
      text-align: center;
      overflow: hidden;
      border: 3px dotted rgba($secondary-text-rgb, 0.25);
      font-weight: bold;
      color: rgba($secondary-text-rgb, 0.5);
      margin: 22px 0;
    }

    .identicon {
      opacity: 0.8;
    }

    .gray-icon {
      font-size: 60px;

      .icon {
        font-size: 35px;
        font-weight: bold;
        color: $secondary-text;
      }
    }

    .dataText {
      margin-left: 20px;
      flex: 1;
      overflow: hidden;
      position: relative;
      z-index: 10;

      .name {
        color: $secondary-text;
        font-size: 16px;
        font-weight: bold;
        line-height: 1.2;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;

        &::first-letter {
          text-transform: uppercase;
        }
      }

      .desc {
        color: $block;
        font-weight: bolder;
        color: $secondary-text;
        opacity: 0.6;
        line-height: 1.3;
        font-size: 13px;
        word-break: break-all;
      }
    }

    .images {
      .image {
        display: inline-block;
        border-radius: 3px;
        font-size: 14px;
        font-weight: 600;
        color: rgba($secondary-text-rgb, 0.5);
        word-break: break-all;
        max-height: 34px;
        overflow: hidden;
        text-overflow:ellipsis;
        display: -webkit-box;
        line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }

    .mask-bg {
      position: absolute;
      bottom: 4px;
      right: 4px;
      padding: 5px 5px 3px;
      color: rgba($primary-text-rgb, 1);
      font-weight: bold;
      font-size: 13px;
      text-align: right;
      z-index: 1;

      &::after {
        content: " ";
        position: absolute;
        width: 100%;
        height: 101%;
        right: 2px;
        top: -1px;
        background-image: radial-gradient(transparent 1px, $primary-bg 1px);
        background-size: 4px 4px;
        backdrop-filter: saturate(50%) blur(4px);
      }

      .mask-text {
        position: absolute;
        z-index: 3;
        font-size: 12px;
        top: 6.5px;
        left: 7px;
        text-align: right;
      }
    }

    .dropdown-icon {
      font-size: 19px;
      color: $secondary-text;
      display: inline-block;
      padding: 8px 3px;
      margin-right: 5px;
    }
  }
}

@media screen and (max-width: 570px) {
  .data {
    justify-content: center;
  }
}

@media screen and (max-width: 1010px) {
  .data {
    flex-wrap: wrap;
  }
}
</style>

<style lang="scss">
.light .projectItem {
  border: 2px solid rgba($secondary-text-rgb, 0.05) !important;
}
</style>