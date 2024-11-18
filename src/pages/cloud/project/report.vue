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
        <div class="body" v-if="report != null">
          <div class="body-item">TEE TYPE<span></span> {{ TEEType[report.param.TeeType] }}</div>
          <div class="body-item">Report Time<span></span> {{ dateTime(report.param.Time) }}</div>
          <div class="body-item">Report Signer<span></span> {{ report.param.Address }}</div>
          <div class="body-item">Code Signature<span></span> {{ report.report.CodeSignature }}</div>
          <div class="body-item">Code Signer<span></span> {{ report.report.CodeSigner }}</div>
          <div class="report-data">
            <span class="report-title">Report Body:</span>
            <div class="body-item">{{ report.param.Report }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import dayjs from "dayjs";
import { GetTeeReport } from "@/apis/dkg";

const props = defineProps(["info", "service", "clusterInfo"])
const wetee: any = inject('wetee')
const info = ref<any>(props.info)
const reportHash = ref<any>("")
const report = ref<any>(null)
const ddns = ref<any>("")
// 0: sgx, 1: sev 2: tdx 3: sev-snp
const TEEType: any = {
  0: "SGX",
  1: "SEV",
  2: "TDX",
  3: "SEV-SNP",
}

onMounted(async () => {
  ddns.value = props.clusterInfo.ip[0].domain

  const ty = wetee().client.createType('WorkType', info.value.Type);
  const wid = { id: info.value.Nid, wtype: ty }

  const reportC = await wetee().client.query.worker.reportOfWork(wid)
  reportHash.value = reportC.toHuman()
})

const verifyTeeReport = async () => {
  const reportV = await GetTeeReport(reportHash.value)
  report.value = reportV
}

const dateTime = (value: any) => {
  return dayjs(value * 1000).format("YYYY-MM-DD HH:ss");
};
</script>

<style lang='scss' scoped>
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

  .report {
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

    .body {
      border-top: 2px solid $secondary-bg;
      padding: 5px 15px 15px 15px;
      color: $secondary-text;
      font-size: 14px;

      .body-item {
        padding: 10px;
        background-color: rgba($primary-text-rgb, $alpha: 0.04);
        border-radius: 6px;
        margin-top: 10px;
        span{
          display: inline-block;
          width: 2px;
          height: 10px;
          background-color: $gray-bg;
          margin: 0 6px 0 8px;
        }
      }

      .report-data {
        word-break: break-all;
        padding: 10px 0;
        line-height: 20px;
        color: rgba($primary-text-rgb, $alpha: 0.3);
        .report-title{
          display: block;
          font-size: 14px;
          margin: 10px 0 0 0;
          color: $secondary-text;
        }
      }
    }
  }
}
</style>