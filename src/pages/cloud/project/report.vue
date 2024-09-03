<template>
  <div class="report-box">
    <div class="header">
      <div class="title warning" v-if="info.Status != 3">Service/Task has been stopped,report is out of date</div>
      <div class="report">
        <div class="hash">
          Report HASH:&nbsp;&nbsp;{{ reportHash }} 
          <div class="space"></div>
          <el-button type="primary" @click="verifyTeeReport()">
            Verify TEE &nbsp;&nbsp;<i class="icon">&#xe62c;</i>
          </el-button>
        </div>
        <div class="body" v-if="report!=null">
          <div class="time">Report Time: {{ dateTime(report.param.Time) }}</div>
          <div class="signer">Report Signer: {{ report.param.Address }}</div>
          <div class="report-data">Report Body:{{ report.param.Report }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue';
import dayjs from "dayjs";
import { GetTeeReport } from "@/apis/dkg";

const props = defineProps(["info", "service","clusterInfo"])
const wetee: any = inject('wetee')
const info = ref<any>(props.info)
const sport = ref<any>("")
const reportHash = ref<any>("")
const report = ref<any>(null)
const reportNumber = ref<string>("")
const ddns = ref<any>("")

onMounted(async () => {
  ddns.value =  props.clusterInfo.ip[0].domain
  
  const ty = wetee().client.createType('WorkType', info.value.Type);
  const wid = { id: info.value.Nid, wtype: ty }

  const reportC = await wetee().client.query.weTEEWorker.reportOfWork(wid)
  reportHash.value = reportC.toHuman()
})

const verifyTeeReport = async () => {
  const reportV = await GetTeeReport(reportHash.value)
  report.value = reportV
}

const dateTime = (value: any) => {
  return dayjs(value*1000).format("YYYY-MM-DD HH:ss");
};
</script>

<style lang='scss'>
.report-box {
  padding: 10px 42px;
  .title {
    margin-top: 15px;
    padding: 10px 15px;
    background-color: rgba($gray-bg, 0.1);
    border-radius: 6px;
  }

  .warning {
    background-color: rgba(255, 162, 0, 0.121);
  }

  .report{
    margin-top: 10px;
    background-color: rgba($gray-bg, 0.1);
    border-radius: 6px;
    .hash {
      font-size: 16px;
      color: $secondary-text;
      padding: 15px;
      display: flex;
      word-break: break-all;
      flex-direction: row;
      align-items: center;
    }
    .body{
      border-top: 2px solid $secondary-bg;
      padding: 15px;
      color: $secondary-text;
      font-size: 14px;
      .time{
        padding: 10px;
        background-color: rgba($primary-text-rgb, $alpha: 0.1);
        border-radius: 6px;
      }

      .signer{
        padding: 10px;
        background-color: rgba($primary-text-rgb, $alpha: 0.1);
        border-radius: 6px;
        margin-top: 10px;
      }
      
      .report-data{
        word-break: break-all;
        padding: 10px 0;
        line-height: 20px;
        color: rgba($primary-text-rgb, $alpha: 0.3);
      }
    }
  }
}
</style>@/apis/detail