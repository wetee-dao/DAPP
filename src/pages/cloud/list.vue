<template>
  <div class="home">
    <el-row class="data" :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4" :key="item.addr" v-for="(item, index) in projects"
        @click="GotoProject(item)">
        <div class="projectItem">
          <div class="dataImg">
            <Identicon class="identicon" :stroke="0.2"
              :foreground="theme == 'dark' ? [80, 250, 130, 255] : [21, 132, 54, 255]" :background="[255, 255, 255, 0]"
              :strokeColor="theme == 'dark' ? [0, 0, 0, 100]:[255, 255, 255, 100]"
              :padding="0.28" :hash="ss58toIcon(item)" />
          </div>
          <div class="dataText">
            <p>{{ item.name }}</p>
            <p>{{ item.desc }}</p>
          </div>
        </div>
      </el-col>      
      <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4" :key="100000" @click="add()">
        <div class="projectItem add">
          <div class="dataImg gray-icon">
            <span class="icon">&#xe604;</span>
          </div>
          <div class="dataText">
            <p>Create a Project</p>
            <p>Init and start project</p>
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
import { stringToHex } from "@polkadot/util";
import { getSS5842, ss58toHex } from "@/utils/chain";
import { getProjectList } from "@/apis/project";
const global = useGlobelProperties()

const store = useStore();
const router = useRouter();
const theme = ref(document.documentElement.getAttribute("class"));
const projects = ref<any[]>([]);

const GotoProject = (item: any) => {
  router.push("/cloud/" + getSS5842(item.addr) + "?project_id=" + item.id!)
};

const add = () => {
  global.$AddProject(router, store, () => {
    getProjectList(store.state.userInfo.addr, true).then((datas: any) => {
      projects.value = datas
    })
  })
};

const ss58toIcon = (item: any) => {
  let address = item.addr
  let addr: string = ss58toHex(address)
  if (addr.indexOf("0x6d6f646c776574656564616f") > -1) {
    addr = addr.replace("0x6d6f646c776574656564616f", "").replace(/^0+/, '').slice(0, -22)
    addr = parseInt(addr, 16).toString(2) + stringToHex("project").replace(/^0x/, '');
  }
  return addr
}

onMounted(async () => {
  getProjectList(store.state.userInfo.addr).then((datas: any) => {
    projects.value = datas
  })
});
</script>

<style lang="scss" scoped>
.home {
  box-sizing: border-box;
  padding-top: 75px;
  width: 100%;
  padding: 75px 20px 0;
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
    height: 108px;
    background-color: rgba($secondary-bg-rgb, 0.8);
    border-radius: 10px;
    display: flex;
    align-items: center;
    padding: 0 18px;
    cursor: pointer;
    margin-bottom: 20px;

    .dataImg {
      min-width: 60px;
      width: 60px;
      height: 60px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid rgba($secondary-text-rgb, 0.05);

      .icon {
        font-size: 28px;
        color: $secondary-text;
      }
    }

    .identicon {
      opacity: 0.8;
    }

    .gray-icon {
      font-size: 60px;
      border: 4px solid rgba($secondary-text-rgb, 0.15);

      .icon {
        font-size: 35px;
        font-weight: bold;
        color: $secondary-text;
      }
    }

    .dataText {
      margin-left: 10px;
      flex: 1;
      overflow: hidden;

      p:first-of-type {
        color: $secondary-text;
        font-size: 16px;
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
  }

  .add {
    background-color: transparent;
    box-shadow: unset;
    border-color: transparent;

    .dataImg {
      border-radius: 50%
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
  border: 3px solid rgba($secondary-text-rgb, 0.08);
}

.dark .projectItem.add {
  box-shadow: none;
}
</style>