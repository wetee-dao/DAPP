<template>
  <div class="home">
    <div class="empty" v-show="false">{{ clusterList.length }}</div>
    <el-row class="data" :gutter="20">
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8" :key="item.id" v-for="(item, index) in clusterList">
        <div class="clusterItem">
          <div class="title"><i class="icon">&#xe680;</i>Cluster - #{{ item.id }} {{ item.name }}</div>
          <div class="row top">
            <div class="row-item">
              <div class="key">App count</div>
              <div class="num"><i class="icon">&#xe6bc;</i> {{ contracts[index] ? contracts[index].length : 0 }}</div>
            </div>
            <div class="row-item">
              <div class="key">Total revenue</div>
              <div class="num"><i class="icon">&#xe706;</i> 0</div>
            </div>
            <div class="row-item">
              <div class="key">GPU</div>
              <div class="num"><i class="icon">&#xe649;</i> {{ crs[index][1].gpu }}/{{ crs[index][0].gpu }}</div>
            </div>
          </div>
          <div class="row">
            <div class="row-item">
              <el-progress type="dashboard"
                :percentage="strToNumber(crs[index][1].cpu) / strToNumber(crs[index][0].cpu) * 100" :width="120"
                color="#256437">
                <template #default="{ percentage }">
                  <span class="percentage-value">{{ cpuShow(crs[index][1].cpu) }}/{{ cpuShow(crs[index][0].cpu)
                    }}</span>
                </template>
              </el-progress>
              <span class="per-label">sgx cpu</span>
            </div>
            <div class="row-item">
              <el-progress type="dashboard"
                :percentage="strToNumber(crs[index][1].mem) / strToNumber(crs[index][0].mem) * 100" :width="120"
                color="#256437">
                <template #default="{ percentage }">
                  <span class="percentage-value">{{ storeShow(crs[index][1].mem) }}/{{ storeShow(crs[index][0].mem)
                    }}</span>
                </template>
              </el-progress>
              <span class="per-label">sgx mem</span>
            </div>
          </div>
          <div class="row bottom">
            <div class="row-item">
              <el-progress type="dashboard"
                :percentage="strToNumber(crs[index][1].cvmCpu) / strToNumber(crs[index][0].cvmCpu) * 100" :width="120"
                color="#256437">
                <template #default="{ percentage }">
                  <span class="percentage-value">{{ cpuShow(crs[index][1].cvmCpu) }}/{{ cpuShow(crs[index][0].cvmCpu)
                    }}</span>
                </template>
              </el-progress>
              <span class="per-label">cvm cpu</span>
            </div>
            <div class="row-item">
              <el-progress type="dashboard"
                :percentage="strToNumber(crs[index][1].cvmMem) / strToNumber(crs[index][0].cvmMem) * 100" :width="120"
                color="#256437">
                <template #default="{ percentage }">
                  <span class="percentage-value">{{ storeShow(crs[index][1].cvmMem) }}/{{
                    storeShow(crs[index][0].cvmMem) }}</span>
                </template>
              </el-progress>
              <span class="per-label">cvm mem</span>
            </div>
          </div>
        </div>
      </el-col>
      <!-- <el-col
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        :xl="4"
        :key="-1"
        @click="add()"
      >
        <div class="clusterItem add">
          <div class="dataImg gray-icon">
            <span class="icon">&#xe604;</span>
          </div>
          <div class="dataText">
            <p>Create a Clusters</p>
            <p>Init and start clusterList</p>
          </div>
        </div>
      </el-col> -->
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { getHttpApi } from "@/plugins/chain";
import { ref, onMounted, inject } from "vue";
import { useStore } from "vuex";

const wetee: any = inject("wetee");
const store = useStore();
const clusterList = ref<any[]>([]);
const contracts = ref<any[]>([]);
const crs = ref<any[]>([]);

const getClusters = async (user: string) => {
  const cList = await getHttpApi().entries("worker","k8sClusters",[]);
  let cs: any[] = [];
  cList.forEach((c: any) => {
    cs.push(c[1].toHuman());
  });

  const crList = await getHttpApi().entries("worker","crs",[]);
  let crsCur: any[] = [];
  crList.forEach((c: any) => {
    crsCur.push(c[1].toHuman());
  });

  let contractCur: any[] = [];
  for (let i = 0; i < cList.length; i++) {
    const contractWrap = await getHttpApi().entries("worker","clusterContracts",[cs[i].id]);
    let  clusterContracts = []
    for (let j = 0; j < contractWrap.length; j++) {
      clusterContracts.push(contractWrap[j][1])
    }
    contractCur.push(clusterContracts);
  }

  crs.value = crsCur;
  clusterList.value = cs;
  contracts.value = contractCur;
};

const storeShow = (s: string) => {
  let v = parseInt(s.replaceAll(",", ""));
  if (v < 1024) {
    return v + "M";
  } else if (v < 1024 * 1024) {
    return (v / 1024).toFixed(1) + "G";
  } else if (v < 1024 * 1024 * 1024) {
    return (v / 1024 / 1024).toFixed(1) + "T";
  } else {
    console.log(v)
    return (v / 1024 / 1024 / 1024).toFixed(1) + 'P';
  }
};

const cpuShow = (s: string) => {
  let v = parseInt(s.replaceAll(",", ""));
  if (v < 1000 * 1000) {
    return (v / 1000).toFixed(0);
  } else if (v < 1000 * 1000 * 1000) {
    return (v / 1000 / 1000).toFixed(1) + "K";
  } else if (v < 1000 * 1000 * 1000 * 1000) {
    return (v / 1000 / 1000 / 1000).toFixed(1) + "MM";
  }
};

const strToNumber = (s: string) => {
  return parseInt(s.replaceAll(",", ""));
};

onMounted(async () => {
  getClusters(store.state.userInfo.addr);
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
  padding-top: 20px;
  margin: 0 -20px;
  justify-content: flex-start;

  .clusterItem {
    border: 3px solid rgba($primary-text-rgb, 0.1);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 10px;
    cursor: pointer;
    margin-bottom: 20px;

    .title {
      font-size: 16px;
      font-weight: bold;
      margin: 10px 0;
      display: flex;
      flex-direction: row;
      align-items: center;

      .icon {
        font-size: 24px;
        margin-right: 5px;
        font-weight: normal;
      }
    }

    &>div:last-child {
      margin-bottom: 0;
    }

    .row {
      width: 100%;
      min-height: 80px;
      padding: 8px 0;
      margin-bottom: 2px;
      background-color: $secondary-bg;
      // border-radius: 6px;
      display: flex;
      align-items: center;

      .row-item {
        flex: 1;
        padding: 5px;
        text-align: center;

        .key {
          margin-bottom: 4px;
          text-align: center;
          font-size: 12px;
          text-transform: uppercase;
        }

        .num {
          text-align: center;
          font-size: 24px;
        }

        .percentage-value {
          font-size: 16px;
          display: block;
        }

        .per-label {
          display: block;
          margin-top: -2px;
          font-size: 14px;
          text-transform: uppercase;
        }
      }

      &.top {
        border-top-right-radius: 6px;
        border-top-left-radius: 6px;
      }

      &.bottom {
        border-bottom-right-radius: 6px;
        border-bottom-left-radius: 6px;
      }
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
  }

  .add {
    background-color: transparent;
    box-shadow: unset;
    border-color: transparent;

    .dataImg {
      border-radius: 50%;
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
    justify-content: center;

    >div {
      max-width: 600px;
    }
  }
}

@media screen and (max-width: 1005px) and (min-width: 729px) {
  .data {
    justify-content: center;

    >div {
      max-width: 600px;
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
.light .clusterItem {
  border: 3px solid rgba($secondary-text-rgb, 0.08) !important;
  box-shadow: 0 0 10px rgba($color: var(--g-secondary-text-rgb), $alpha: 0.03);
}

.dark .clusterItem.add {
  box-shadow: none;
}
</style>
