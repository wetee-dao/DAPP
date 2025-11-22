<template>
  <div class="metrics-box">
    <div class="header">

    </div>
    <div id="metrics">
      <div id="cpu" class="metrics-item">
        <Line v-if="cpu != null" :data="cpu" :options="cpuOptions" />
      </div>
      <div id="mem" class="metrics-item">
        <Line v-if="mem != null" :data="mem" :options="memOptions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { Line } from 'vue-chartjs'
import { debounce } from '@/utils/debounce';
import { GetWetrics } from '@/apis/detail';
import dayjs from 'dayjs';
const props = defineProps(["info", "clusterInfo", "active"])

const info = ref<any>(props.info)
const cpu = ref<any>(null)
const mem = ref<any>(null)

watch(() => props.active, (newValue, oldValue) => {
  if (newValue == "metrics") {
    nextTick(() => {
      resetChart()
    })
  }
})

const cpuOptions = ref({
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
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: function (context: any) {
          return 'cpu: ' + context.parsed.y + "%"
        }
      }
    }
  },
})

const memOptions = ref({
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
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: function (context: any) {
          return 'memory:  ' + context.parsed.y + "GB"
        }
      }
    }
  },
})

onMounted(() => {
  GetWetrics(props.clusterInfo, info.value).then((res: any) => {
    let labels: string[] = []
    let cpuData: number[] = []
    let memData: number[] = []

    res.sort((a: any, b: any) => a.Time - b.Time)
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

      labels.push(dayjs(res[i].Time * 1000).format('MM/DD HH:mm'));
      cpuData.push(cpu / 10)
      memData.push(mem / 1000)
    }

    cpu.value = {
      labels: labels,
      datasets: [
        {
          label: 'CPU(%)',
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
          label: 'Memory(GB)',
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
  document.getElementById('cpu')!.style.minWidth = (w - 5) + 'px'
  document.getElementById('mem')!.style.minHeight = h + 'px'
  document.getElementById('mem')!.style.minWidth = (w - 5) + 'px'
  document.getElementById('metrics')!.style.display = aw > 600 ? "flex" : "block"
}
</script>

<style lang='scss' scoped>
.metrics-box {
  padding: 10px 32px;

  #metrics {
    margin: 0 -10Px;
    display: flex;
    justify-content: space-between;
  }

  .metrics-item {
    flex: 1;
    padding: 10Px;
    overflow: hidden;
    min-width: 600px;
  }
}
</style>