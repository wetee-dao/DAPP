<template>
  <div class="page-box">
    <div class="item" v-for="c in containers">
      <div class="left">
        <div class="title">{{ c[0] == '0' ? 'Main container' : 'Side' + c[0] }}</div>
        <div>
          <div class="image sub">
            <i class="icon">&#xf18e;</i>&nbsp;&nbsp;{{ c[1].image }}<div class="space"></div>
          </div>
          <div class="resource sub">
            <i class="icon">&#xe645;</i>&nbsp;&nbsp;cpu: {{ parseInt(c[1].cpu.replaceAll(",", "")) / 1000 }} core &nbsp;
            mem: {{ c[1].mem }} mb &nbsp; gpu: {{ c[1].gpu }}
          </div>
        </div>
      </div>
      <div class="right">
        <div class="ssd-box" v-if="c[1].disk.length > 0">
          <el-tooltip v-for="(disk, index) in c[1].disk" effect="light" placement="top-start"
            :content="'Mounted on ' + disk.path">
            <div class="ssd">
              <div class="text">{{ diskInfo(disk.id, disks).size }}G<br />
                {{ disk.path }}</div>
              <div class="ssd-bar">
                SSD
              </div>
            </div>
          </el-tooltip>
        </div>
        <div class="edit" @click="editContainer(c[0], c[1])">
          <i class="icon">&#xe695;</i> Edit
        </div>
        <div class="delete" @click="delContainer(c[0])">
          <i class="icon">&#xe68c;</i> Del
        </div>
      </div>
    </div>
    <div class="item" v-if="info.TeeType != 'SGX'" @click="addContainer()">
      <el-icon class="el-icon--left">
        <Plus />
      </el-icon>
      <div class="add-text">&nbsp;&nbsp;Add new container</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Plus } from '@element-plus/icons-vue'

import { $getQueryApi, $getTxProvider } from '@/plugins/chain';
import { useStore } from 'vuex';
import useGlobelProperties from '@/plugins/globel';
import { useRouter } from 'vue-router';
const props = defineProps(["info"])

const store = useStore();
const global = useGlobelProperties()
const router = useRouter();
const info = ref<any>(props.info)
const disks = ref<any[]>([])
const containers = ref<any[]>(info.value.Containers ?? [])
const userAddr = store.state.userInfo.addr;

onMounted(() => {
  $getQueryApi().disks(userAddr, null, 1000).then((res: any) => {
    disks.value = res
  })
})

const diskInfo = (diskId: string, diskList: any[]) => {
  for (let d of diskList) {
    if (d.id == diskId) {
      return {
        size: d.data.SecretSSD[2],
      }
    }
  }
  return {
    size: 0,
  }
  // return disks.value.filter((d: any) => d.data.DiskId == diskId)
}

const editContainer = (id: string, container: any) => {
  global.$EditContainer(router, store, {
    podId: info.value.Id,
    id: id,
    userAddr: userAddr,
    teeVersion: info.value.TeeType,
    container: container,
  }, () => {
    $getQueryApi().podInfo(info.value.Id).then((res: any) => {
      containers.value = res[2].map((v: any) => {
        return [v[0], v[1][0]]
      })
    })
  })
}

const addContainer = () => {
  global.$EditContainer(router, store, {
    podId: info.value.Id,
    id: null,
    userAddr: userAddr,
    teeVersion: info.value.TeeType,
  }, () => {
    $getQueryApi().podInfo(info.value.Id).then((res: any) => {
      containers.value = res[2].map((v: any) => {
        return [v[0], v[1][0]]
      })
    })
  })
}

const delContainer = async (id: string) => {
  await $getTxProvider(async (chain, builder): Promise<void> => {
    const dry = await builder.delContainer(
      info.value.Id,
      id,
    )

    const signer = store.state.userInfo.addr;
    const tx = await chain.buildCall(dry, signer)
    await chain.proxysignAndSend(tx, "-1", signer, () => {
    }, () => { })
  })
}
</script>

<style lang='scss' scoped>
.page-box {
  padding: 10px 32px;

  .item {
    font-size: 16px;
    color: $secondary-text;
    margin-top: 10px;
    background-color: rgba($gray-bg-rgb, 0.06);
    padding: 20px;
    border-radius: 2px;
    display: flex;
    flex-direction: row;
    word-break: break-all;
    cursor: pointer;

    .title {
      font-size: 20px;
      color: $secondary-text;
      font-weight: 800;
    }

    .sub {
      margin-top: 5px;
      display: flex;
      align-items: center;
      color: rgba($secondary-text-rgb, 0.7);
      font-size: 14px;

      .icon {
        font-size: 14px;
        color: rgba($secondary-text-rgb, 0.9);
      }

      .space {
        flex: 1;
      }
    }

    .image {
      display: flex;
      align-items: center;
    }

    .left {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .right {
      display: flex;
      flex-direction: row;
      align-items: center;

      .ssd-box {
        height: 60px;
        display: flex;
        flex-direction: row;
        margin-right: 5px;
      }

      .ssd {
        height: 100%;
        width: 50px;
        margin-right: 5px;
        background: rgba($secondary-text-rgb, 0.1);
        border-radius: 2px;
        border-top-right-radius: 20px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        text-align: center;

        .text {
          font-size: 10px;
          line-height: 12px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .ssd-bar {
          font-size: 12px;
          line-height: 14px;
          font-weight: bold;
          width: 100%;
          height: 30%;
          background: rgba($primary-text-rgb, 0.1);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
      }

      .edit,
      .delete {
        font-size: 14px;
        cursor: pointer;
        color: rgba($primary-text-rgb, 0.8);
        padding: 10px;
        border-radius: 2px;

        .icon {
          font-size: 14px;
        }

        &:hover {
          background-color: rgba($primary-text-rgb, 0.05);
        }
      }

      .delete {
        color: $accent-color;

        &:hover {
          background-color: rgba($accent-color, 0.05);
        }
      }
    }

    .add-text {
      font-size: 16px;
      height: 16px;
      line-height: 16px;
      color: rgba($secondary-text-rgb, 0.7);
    }
  }
}
</style>