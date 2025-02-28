<template>
  <div class="home">
    <el-row class="data" :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4" :key="item.addr" v-for="(item, index) in apps"
        @click="GotoProject(item)">
        <div class="projectItem">
          <div class="dataImg">
            {{ item.id }}
          </div>

          <div class="dataText">
            <p>{{ item.name }} - v{{ versions[item.id]&&versions[item.id][0]?versions[item.id][0].version:'0' }}</p>
            <p>{{ item.meta.desc }}</p>
            <div class="images" v-if="versions[item.id]">
              <div class="image" v-for="(image, index) in versions[item.id]">{{ image.value.i}}</div>
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
            <p>Build a application</p>
            <p>Upload application and start mint</p>
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
import { getHttpApi } from "@/plugins/chain";
const global = useGlobelProperties()

const store = useStore();
const router = useRouter();
const apps = ref<any[]>([]);
const versions = ref<any>({});

const GotoProject = (item: any) => {
  router.push("/cloud/" + getSS5842(item.addr) + "?project_id=" + item.id!)
};

const add = () => {
  global.$Build(router, store, () => {

  })
};

onMounted(async () => {
  getList()
});

const getList = async () => {
  const appsIds = await getHttpApi().entries("store", "accountApps", [store.state.userInfo.addr])
  const ids = appsIds.map((item: any) => {
    return getNumstrfromChain(item.keys[1])
  })
  if (ids.length == 0) {
    apps.value = [];
    versions.value = {};
    return
  }

  const appsList = await getHttpApi().multi_query("store", "apps", ids)
  apps.value = appsList;

  let cversions: any = {}
  for (let i = 0; i < ids.length; i++){
    const item = ids[i]
    const appsVersion = await getHttpApi().entries("store", "versionLists", [item])
    cversions[item] = appsVersion.map((version: any) => {
      let v = version.value
      return {
        version: version.keys[1],
        block: getNumstrfromChain(v[1]),
        value: v[0][0],
      };
    })
  }
  versions.value = cversions
}
</script>

<style lang="scss" scoped>
.home {
  box-sizing: border-box;
  width: 100%;
  padding: 65px 20px 0;
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
    border: 1Px solid rgba($secondary-text-rgb, 0.09);
    display: flex;
    align-items: center;
    padding: 15px 15px;
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

      p:first-of-type {
        color: $secondary-text;
        font-size: 16px;
        font-weight: bold;
        line-height: 1.3;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;

        &::first-letter {
          text-transform: uppercase;
        }
      }

      p:last-of-type {
        color: $block;
        font-weight: bolder;
        color: $secondary-text;
        opacity: 0.6;
        line-height: 1.3;
        font-size: 13px;
        word-break: break-all;
      }
    }

    .images{
      .image{
        display: inline-block;
        border-radius: 3px;
        font-size: 14px;
        font-weight: 600;
        color: rgba($secondary-text-rgb,0.5);
      }
    }

    .mask-bg {
      position: absolute;
      bottom: 2px;
      right: 6px;
      padding: 5px 5px 3px;
      color: rgba($primary-text-rgb,0.6);
      font-weight: bold;
      font-size: 15px;
      text-align: right;
      z-index: 1;

      &::after {
        content: " ";
        position: absolute;
        width: 100%;
        height: 101%;
        right: 2px;
        bottom: 0px;
        background-image: radial-gradient(transparent 1px, $primary-bg 1px);
        background-size: 4px 4px;
        backdrop-filter: saturate(50%) blur(4px);
      }

      .mask-text {
        position: absolute;
        z-index: 3;
        font-size: 14px;
        top: 5px;
        left: 7px;
        text-align: right;
      }
    }
  }
}

@media screen and (max-width: 570px) {
  .data {
    justify-content: center;

    >div {
      max-width: 1000px;
    }
  }
}

@media screen and (max-width: 729px) and (min-width: 570px) {
  .data {

    >div {
      max-width: 500px;
    }
  }
}

@media screen and (max-width: 1005px) and (min-width: 729px) {
  .data {

    >div {
      max-width: 500px;
    }
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