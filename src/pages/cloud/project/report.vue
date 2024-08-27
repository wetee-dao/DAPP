<template>
  <div class="report-box">
    <div class="header">
      <div class="title" v-if="info.Status == 1">
        Report at block<span class="tag">{{ reportNumber }}</span>
         &nbsp;|&nbsp; 
        Report validate url&nbsp;
        <a target="_blank" :href="'https://' + ddns + ':' + sport + '/report'" class="link">
          https://{{ ddns }}:{{ sport }}/report
        </a>
      </div>
      <!-- <div class="title" v-if="info.Status != 1">Service/Task has been stopped,report is out of date</div> -->
      <div class="item">Report HASH:&nbsp;&nbsp;{{ report }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue';

const props = defineProps(["info", "service","clusterInfo"])
const wetee: any = inject('wetee')
const info = ref<any>(props.info)
const sport = ref<any>("")
const report = ref<any>("")
const reportNumber = ref<string>("")
const ddns = ref<any>("")

onMounted(async () => {
  ddns.value =  props.clusterInfo.ip[0].domain
  
  const ty = wetee().client.createType('WorkType', info.value.Type);
  const wid = { id: info.value.Nid, wtype: ty }

  const reportC = await wetee().client.query.weTEEWorker.reportOfWork(wid)
  report.value = reportC.toHuman()
})

</script>

<style lang='scss'>
.report-box {
  padding: 10px 25px;

  .title {
    padding: 10px 15px;
    background-color: rgba($gray-bg, 0.1);
    border-radius: 6px;

    .tag {
      color: rgba($primary-bg-rgb, 0.8);
      background-color: rgba($primary-text-rgb, 0.6);
      padding: 5px;
      border-radius: 4px;
      font-size: 14px;
      line-height: 14px;
      display: inline-block;
      margin-left: 20px;
    }

    .link {
      color: $primary-text;
      font-size: 14px;
      line-height: 14px;
      font-weight: bold;
    }
  }

  .item {
    font-size: 16px;
    color: $secondary-text;
    margin-top: 15px;
    background-color: rgba($gray-bg, 0.1);
    padding: 15px;
    border-radius: 6px;
    display: flex;
    word-break: break-all;
  }
}
</style>@/apis/detail