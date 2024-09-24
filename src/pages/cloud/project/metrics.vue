<template>
  <div class="metrics-box">
    <div class="header">

    </div>
    <div id="metrics">
      <div id="cpu" class="metrics-item">
        <Line v-if="cpu != null" :data="cpu" :options="options" />
      </div>
      <div id="mem" class="metrics-item">
        <Line v-if="mem != null" :data="mem" :options="options" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref } from 'vue';
import { Line } from 'vue-chartjs'
import { debounce } from '@/utils/debounce';
import { GetWetrics } from '@/apis/detail';
const props = defineProps(["info","clusterInfo"])

const wetee: any = inject('wetee')
const info = ref<any>(props.info)
const cpu = ref<any>(null)
const mem = ref<any>(null)

const options = ref({
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 1.5,
  scales: {
    y: {
      grid: {
        color: '#5e5f5f2e'
      },
      min: 0
    },
    x: {
      grid: {
        color: '#5e5f5f2e'
      }
    }
  }
})

onMounted(() => {
  const ty = wetee().client.createType('WorkType', info.value.Type);
  const wid = { id: info.value.Nid, wtype: ty }
  if (info.value.Status == 3) {
    GetWetrics(props.clusterInfo.id, info.value).then((res: any) => {
      let labels: string[] = []
      let cpuData: number[] = []
      let memData: number[] = []

      if (res.length >= 30) {
        res = res.slice(-30)
      }

      for (let i = 0; i < res.length; i++) {
        const item = res[i].Cr;
        let cpu = 0;
        let mem = 0;
        for (var key in item) {
          cpu = cpu + item[key][0]
          mem = mem + item[key][1]
        }

        labels.push(res[i].BlockNumber);
        cpuData.push(cpu)
        memData.push(mem / 1000)
      }

      cpu.value = {
        labels: labels,
        datasets: [
          {
            label: 'CPU(1 Unit = 1/1000 Core)',
            borderColor: "#50fa82",
            borderWidth: 1,
            pointStyle: 'false',
            backgroundColor: '#50fa82',
            stepped: true,
            data: cpuData
          }
        ]
      }
      mem.value = {
        labels: labels,
        datasets: [
          {
            label: 'MEM(GB)',
            borderColor: "#b46d2e",
            borderWidth: 1,
            pointStyle: 'false',
            backgroundColor: '#b46d2e',
            stepped: true,
            data: memData
          }
        ]
      }
    })
  } else {
    wetee().client.query.weTEEWorker.proofsOfWork.entries(wid).then((res: any) => {
      let labels: string[] = []
      let cpuData: number[] = []
      let memData: number[] = []

      res.sort((a: any, b: any) => {
        const k = a[0].toHuman();
        const k2 = b[0].toHuman();
        return parseInt(k[1].replaceAll(",", "")) - parseInt(k2[1].replaceAll(",", ""));
      });

      if (res.length >= 30) {
        res = res.slice(-30)
      }

      for (let i = 0; i < res.length; i++) {
        const [key, exposure] = res[i];
        const k = key.toHuman();
        const item = exposure.toHuman();
        labels.push(k[1]);
        cpuData.push(item.cr.cpu)
        memData.push(item.cr.mem / 1000)
      }
      
      cpu.value = {
        labels: labels,
        datasets: [
          {
            label: 'CPU(1 Unit = 1/1000 Core)',
            borderColor: "#50fa82",
            borderWidth: 1,
            pointStyle: 'false',
            backgroundColor: '#50fa82',
            stepped: true,
            data: cpuData
          }
        ]
      }
      mem.value = {
        labels: labels,
        datasets: [
          {
            label: 'MEM(GB)',
            borderColor: "#b46d2e",
            borderWidth: 1,
            pointStyle: 'false',
            backgroundColor: '#b46d2e',
            stepped: true,
            data: memData
          }
        ]
      }
    })
  }

  window.addEventListener('resize', resetChartDebounce)
  resetChart()
})

onUnmounted(() => {
  window.removeEventListener('resize', resetChartDebounce)
})

const resetChartDebounce = () => {
  document.getElementById('metrics')!.style.visibility = 'none'
  const f = debounce(resetChart, 300)
  f()
}

const resetChart = () => {
  let aw = document.getElementById('metrics')!.clientWidth - 44
  let w = aw / (aw > 600 ? 2 : 1)
  let h = w / 1.5
  document.getElementById('cpu')!.style.minHeight = h + 'px'
  document.getElementById('cpu')!.style.minWidth = (w-5) + 'px'
  document.getElementById('mem')!.style.minHeight = h + 'px'
  document.getElementById('mem')!.style.minWidth = (w-5) + 'px'
  document.getElementById('metrics')!.style.display = aw > 600 ? "flex" : "block"
}
</script>

<style lang='scss'>


.metrics-box {
  padding: 10px 42px;

  #metrics {
    margin: 0 -10Px;
    display: flex;
    justify-content: space-between;
  }

  .metrics-item {
    padding: 10Px;
  }
}
</style>