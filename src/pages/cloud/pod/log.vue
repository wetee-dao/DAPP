<template>
  <div class="log-box">
    <div class="header">

    </div>
    <div id="log">
      <div class="log-item" v-for="log in logs" :key="log.BlockNumber">
        <div class="log-texts">
          <div class="log-text" v-for="(text, index) in log.Logs" :key="index" v-html="text"></div>
        </div>
        <div class="log-block">
          <span>{{ dayjs(log.Time * 1000).format("YYYY MM-DD HH:ss") }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import { AnsiUp } from 'ansi_up';
import dayjs from 'dayjs';
import { GetLogs } from '@/apis/worker';
import { scrollToBottom } from '@/utils/dom';

const props = defineProps(["info", "clusterInfo", "activeName"])
const info = ref<any>(props.info)
const logs = ref<any>(null)

watch(() => props.activeName, (newValue, oldValue) => {
  if (newValue == "log") {
    nextTick(() => {
      scrollToBottom("#project-detail-tabs .el-tabs__content")
    })
  }
})

onMounted(() => {
  GetLogs(props.clusterInfo, info.value).then((res: any) => {
    const ansiUp = new AnsiUp()
    res.sort((a: any, b: any) => a.Time - b.Time)
    res = res.filter((item: any) => item && item.Logs && item.Logs.length > 0).map((item: any) => {
      item.Logs = item.Logs.map((m: string) => {
        let msg = ansiUp.ansi_to_html(m)
        return msg
      });
      return item
    })
    console.log("logs:", res)
    logs.value = res
    nextTick(() => {
      scrollToBottom("#project-detail-tabs .el-tabs__content")
    })
  })
})
</script>

<style lang='scss' scoped>
.log-box {
  padding: 10px 32px;

  .log-item {
    background-color: rgba($gray-bg-rgb, 0.06);
    border-radius: 6px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;

    .log-texts {
      flex: 1;
      padding: 10Px;
      border-right: 2Px solid rgba($primary-bg-rgb, 0.8);
      width: calc(100% - 80px);
      overflow-x: auto;
    }

    .log-text {
      word-break: break-all;
      overflow: hidden;
      font-size: 15px;
      height: 20px;
      line-height: 22px;
      white-space: pre;
      display: block;

      span {
        display: inline-block;
        height: 100%;
        line-height: 22px;
      }
    }

    .log-block {
      color: rgba($secondary-text-rgb, 0.8);
      text-align: center;
      padding-right: 8px;
      padding: 7px 8px;
      border-radius: 4px;
      font-size: 12px;
      line-height: 14px;
      margin-right: 5px;
      width: 32px;
      height: 100%;
      word-break: break-all;
      font-weight: bold;
    }
  }
}
</style>