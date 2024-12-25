<template>
  <div class="detail" @click="(e: any) => e.stopPropagation()">
    <div class="title">
      {{ info.Name }} <span>{{ workType[info.Type as string] }} &nbsp;#{{ info.Nid }}</span>
      <span :key="ser.id" v-for="ser in service.filter(s => s.Type == 'NodePort')">
        <a target="_blank" :key="port.NodePort"
          :href="(port.Port == 443 ? 'https://' : 'http://') + ddns + ':' + port.NodePort" class="service"
          v-for="port in ser.Ports" v-show="port.Port != 65535">
          Server: {{ port.Port }}({{ port.Protocol }})
        </a>
      </span>
      <i class="icon right" @click="closeClick">&#xe604;</i>
    </div>
    <div v-if="loader == 1" class="box" :key="info.Id">
      <el-tabs v-model="activeName" id="project-detail-tabs" class="tabs" @tab-click="handleClick">
        <el-tab-pane label="Metrics" name="metrics" lazy>
          <Metrics :info="info" :clusterInfo="clusterInfo" />
        </el-tab-pane>
        <el-tab-pane label="Log" name="log" lazy>
          <Log :activeName="activeName" :info="info" :clusterInfo="clusterInfo" />
        </el-tab-pane>
        <el-tab-pane label="TEE report" name="sgxReport" lazy>
          <Report :info="info" :service="service" :clusterInfo="clusterInfo" />
        </el-tab-pane>
        <el-tab-pane label="Settings" name="settings" lazy>
          <TEESetting :info="info" :clusterInfo="clusterInfo" />
        </el-tab-pane>
      </el-tabs>
    </div>
    <div v-if="loader == 2" class="box" :key="info.Id">
      <el-tabs v-model="activeName" id="project-ink-tabs" class="tabs" @tab-click="handleClick">
        <el-tab-pane label="Ink! contract meta" name="inkMeta" lazy>
          <InkMeta :inkInfo="inkInfo" />
        </el-tab-pane>
        <el-tab-pane label="Ink! contract playgroud" name="inkCall" lazy>
          <InkCall :inkInfo="inkInfo" />
        </el-tab-pane>
      </el-tabs>
    </div>
    <loadingBox class="loader-wrapper" v-if="loader == 0" />
  </div>
</template>

<script lang="ts" setup>
import { inject, onMounted, ref, watch } from "vue";
import { TabsPaneContext } from "element-plus";
import Metrics from "./metrics.vue"
import Report from "./report.vue"
import Log from "./log.vue"
import InkCall from "./inkCall.vue"
import InkMeta from "./inkMeta.vue"
import TEESetting from "./teeSetting.vue";
import loadingBox from "@/components/loading-box.vue";
import { getHttpApi } from "@/plugins/chain";

const props = defineProps(["info", "openTag", "close"])
const activeName = ref(props.openTag ?? "")
const info = ref(props.info)
const inkInfo = ref(null)
const clusterInfo = ref(null)
const loader = ref(0)
const service = ref<any[]>([])
const ddns = ref<any>("")
const wetee: any = inject('wetee')
const workType: any = {
  "APP": "TEE Service",
  "TASK": "TEE Task",
  "GPU": "GPU Service",
  "INK": "INK Contract"
}

watch(() => props.info, (val: any, oldVal: any) => {
  if (val.Nid != oldVal.Nid) {
    info.value = val
    loader.value = 0
    console.log(info)
    GetInfo(val)
  }
})

const closeClick = () => {
  props.close();
};

const handleClick = (tab: TabsPaneContext, event: Event) => {
}

onMounted(() => {
  let item = JSON.parse(JSON.stringify(info.value))
  if (props.openTag == "") {
    if (info.value.Type == "INK") {
      activeName.value = "inkCall"
    } else {
      activeName.value = "metrics"
    }
  }
  if (item.Type == "INK") {
    inkInfo.value = item
    loader.value = 2
  } else {
    GetTEEInfo(item)
  }
})

const GetInfo = async (item: any) => {
  item = JSON.parse(JSON.stringify(item))
  if (item.Type == "INK") {
    clusterInfo.value = null
    service.value = []
    inkInfo.value = item
    activeName.value = "inkCall"
    loader.value = 2
  } else {
    activeName.value = "metrics"
    inkInfo.value = null
    GetTEEInfo(item)
  }
}

const GetTEEInfo = async (item: any) => {
  const ty = wetee().client.createType('WorkType', item.Type);
  const wid = { id: item.Nid, wtype: ty }
  const cidList = await getHttpApi().entries("worker","workContractState",[wid])
  console.log(cidList)
  // const {keys, _} = cidList[0];
  // const cid = keys;

  // const cinfo = await GetClusterInfo(parseInt(cid[1]))
  // ddns.value = cinfo.ip[0].domain
  // clusterInfo.value = cinfo
  // loader.value = 1

  // GetServices(parseInt(cid[1]), item).then((d) => {
  //   service.value = d as any[]
  // })
}
</script>

<style lang="scss" scoped>
.detail {
  border-top-left-radius: 10px;
  overflow: hidden;
  background-color: $secondary-bg;
  min-width: calc(100vw - 350px);
  max-width: calc(100vw - 350px);
  height: calc(100vh - 100px);
  position: relative;
  margin-top: 96px;
  margin-left: 20px;
  border: 3px solid rgba($gray-bg, 0.1);
  border-bottom: 0;
  border-right: 0;
  display: flex;
  flex-direction: column;
  color: $secondary-text;
}

@keyframes slide-in {
  0% {
    transform: translateX(100%);
  }

  100% {
    transform: translateX(0%);
  }
}

.title {
  padding: 40px 42px 10px 42px;
  font-size: 28px;
  font-weight: bold;
  text-transform: uppercase;

  span {
    font-size: 14px;
    color: rgba($secondary-text-rgb, 0.5);
    text-transform: none;
  }

  .icon {
    font-weight: bold;
    margin-right: 10px;
  }

  .right {
    float: right;
    display: block;
    transform: rotate(45deg);
    cursor: pointer;
    font-size: 18px;
    position: relative;
    right: -12px;
    top: 7px;
  }

  .service {
    display: inline-block;
    font-size: 13px;
    padding: 2px 10px;
    background-color: rgba($primary-text-rgb, 0.8);
    border-radius: 15px;
    margin: 0 0px 0px 10px;
    color: $secondary-bg;
    cursor: pointer;
    position: relative;
    bottom: 2px;
  }
}

.loader-wrapper {
  margin-top: 20px;
  border-top: 2px solid rgba($gray-bg, 0.1);
}

.box {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100% - 90px);

  :deep(.el-tabs__nav-wrap) {
    padding: 0 43px;

    &::after {
      background-color: rgba($gray-bg, 0.1);
    }
  }

  :deep(.el-tabs) {
    height: 100%;
    display: flex;
    flex-direction: column-reverse;

    .el-tabs__content {
      flex: 1;
      overflow-y: auto;
    }
  }

  :deep(.el-tabs__item.is-active) {
    color: rgba($primary-text-rgb, 1);
  }

  :deep(.el-tabs__active-bar) {
    background-color: rgba($primary-text-rgb, 0.3);
  }

  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }

  .content {
    flex: 1;
  }
}

:deep(#pane-settings) {
  height: 100%;
}
</style>