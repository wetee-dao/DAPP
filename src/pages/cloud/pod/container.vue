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
            <i class="icon">&#xe645;</i>&nbsp;&nbsp;CPU: {{ c[1].cpu }} | MEM: {{ c[1].mem }} | GPU: {{ c[1].gpu }}
          </div>
        </div>
      </div>
      <div class="right">
        <div class="ssd-box" v-if="c[1].disk.length > 0">
          <el-tooltip v-for="(disk, index) in c[1].disk" effect="light" placement="top-start"
            :content="'Mounted on ' + disk.path">
            <div class="ssd">
              {{ diskInfo(disk.id,disks).size }}G<br/>
              {{ disk.path }}
              <div class="ssd-bar"></div>
            </div>
          </el-tooltip>
        </div>
        <div class="edit">
          <i class="icon">&#xe695;</i> Edit
        </div>
      </div>
      <!-- <div class="free">Free:&nbsp;&nbsp;{{ accountData.free }}</div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { $getQueryApi } from '@/plugins/chain';
import { useStore } from 'vuex';
const props = defineProps(["info"])

const store = useStore();
const info = ref<any>(props.info)
const disks = ref<any[]>([])
const containers = ref<any[]>(info.value.Containers ?? [])
const userAddr = store.state.userInfo.addr;

onMounted(() => {
  $getQueryApi().disks(userAddr, null, 1000).then((res: any) => {
    disks.value = res
  })
})

const diskInfo = (diskId: string,diskList: any[]) => {
  for (let d of diskList) {
    if (d.id == diskId) {
      return {
        size : d.data.SecretSSD[2],
      }
    }
  }
  return {
    size: 0,
  }
  // return disks.value.filter((d: any) => d.data.DiskId == diskId)
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

    .title {
      font-size: 20px;
      color: $secondary-text;
      font-weight: 800;
    }

    .sub {
      margin-top: 10px;
      display: flex;
      align-items: center;
      color: rgba($secondary-text-rgb, 0.7);

      .icon {
        font-size: 14px;
        color: rgba($primary-text-rgb, 0.4);
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
        height: 80px;
        display: flex;
        flex-direction: row;
      }

      .ssd {
        height: 100%;
        width: 60px;
        margin-right: 8px;
        background: rgba($secondary-text-rgb, 0.1);
        border-radius: 2px;
        border-top-right-radius: 20px;
        overflow: hidden;
        font-size: 12px;
        line-height: 14px;
        font-weight: bold;
        text-align: center;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;

        .ssd-bar {
          width: 100%;
          height: 80%;
          background: rgba($primary-text-rgb, 0.5);
          position: absolute;
          left: 0;
          bottom: 0;
        }
      }

      .edit{
        font-size: 16px;
        margin-left: 10px;
        cursor: pointer;
        color: rgba($primary-text-rgb, 0.8);
        padding: 10px;
        .icon{
          font-size: 16px;
        }
      }
    }
  }
}
</style>