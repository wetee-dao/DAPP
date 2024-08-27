<template>
  <div class="log-box">
    <div class="header">

    </div>
    <div id="log">
      <div class="log-item" v-for="item in log" :key="item.BlockNumber">
        <div class="log-texts">
          <div class="log-text" v-for="i in item.Logs" :key="i">
            {{ i }}
          </div>
        </div>
        <div class="log-block">
          <span># {{ item.BlockNumber }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import { GetLogs } from '@/apis/detail';
import { scrollToBottom } from '@/utils/dom';

const props = defineProps(["info","clusterInfo"])
const info = ref<any>(props.info)
const log = ref<any>(null)

onMounted(() => {
  GetLogs(props.clusterInfo.id, info.value).then((res: any) => {
    log.value = res
    nextTick(() => {
      scrollToBottom("#project-detail-tabs .el-tabs__content")
    })
  })
})
</script>

<style lang='scss'>
.log-box {
  padding: 10px 42px;

  #log {
    margin: 0 -10Px;

  }

  .log-item {
    background-color: rgba($gray-bg, 0.06);
    border-radius: 6px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;

    .log-texts {
      flex: 1;
      padding: 10Px;
      margin-right: 5px;
      border-right: 2Px solid rgba($primary-bg-rgb, 0.8);
    }

    .log-text{
      word-break: break-all;
      overflow: hidden;
      font-size: 14px;
      line-height: 20px;
    }

    .log-block {
      color: rgba($secondary-text-rgb, 0.8);
      text-align: center;
      padding-right: 8px;
      padding: 7px 8px;
      border-radius: 4px;
      font-size: 14px;
      line-height: 14px;
      margin-right: 5px;
      width: 14px;
      height: 100%;
      word-break: break-all;
      font-weight: bold;
    }
  }
}
</style>