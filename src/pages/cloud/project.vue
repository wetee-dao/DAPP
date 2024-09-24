<template>
  <div class="project">
    <div :class="'data' + (currentProject != null ? ' thin_box' : '')">
      <div v-for="(item, index) in apps" :id="'project-' + item.Id" :key="index"
        :class="(currentProject != null && item.Id == currentProject.Id) ? 'pod active' : 'pod'"
        @click="OpenDetail(item, '')" @click.right.native="showPenu($event, item)">
        <div class="contact" v-if="item.Type == 'INK'">
          <Identicon class="identicon" :stroke="2"
            :foreground="theme == 'dark' ? [80, 250, 130, 255] : [21, 132, 54, 255]" :background="[255, 255, 255, 0]"
            :padding="0.2" :hash="ss58toHex(item.Nid)" />
          <div class="title">
            {{ item.Nid }}
            <div class="code">
              <i class="icon">&#xe663;</i> {{ item.Abi.contract.name }}
            </div>
          </div>
        </div>
        <div class="dataText" v-if="item.Type != 'INK'">
          <p>{{ item.Name }}</p>
          <p>
            <i class="icon">&#xf18e;</i>
          <div class="text" :alt="item.Image">{{ shortImage(item.Image) }}</div>
          </p>
          <div class="ssd-box" v-if="item.Cr.disk.length > 0">
            <el-tooltip v-for="(disk, index) in item.Cr.disk" effect="light" placement="top-start"
              :content="'Mounted on ' + disk.path.SSD + ' - ' + (parseInt(disk.size_.replace(',', '')) / 1024) + ' GB'">
              <div class="ssd">
                SSD
                <div class="ssd-bar"></div>
              </div>
            </el-tooltip>
          </div>
        </div>
        <div :class="'dataImg pstatus status' + item.Status" v-if="item.Type != 'INK'">
          <span class="icon" v-html="iconStatus[item.Status]"></span>
          <div>{{ textStatus[item.Status] }}</div>
        </div>
        <div class="mask-bg" v-if="item.Type == 'INK'">
          <i class="icon">&#xe663;</i>IInk! Contract
          <div class="mask-text"><i class="icon">&#xe663;</i> Ink! Contract</div>
        </div>
        <div class="mask-bg" v-if="item.Type == 'APP'">
          <i class="icon">&#xe649;</i>TEE Service
          <div class="mask-text"><i class="icon">&#xe701;</i> TEE Service</div>
        </div>
        <div class="mask-bg" v-if="item.Type == 'TASK'">
          <i class="icon">&#xe649;</i>ITEE Task
          <div class="mask-text"><i class="icon">&#xe77c;</i> TEE Task</div>
        </div>
        <div class="mask-bg" v-if="item.Type == 'GPU'">
          <i class="icon">&#xe649;</i>GPU Service
          <div class="mask-text"><i class="icon">&#xe649;</i> GPU Service</div>
        </div>
      </div>
      <div class="empty" v-if="apps.length == 0">Nothing was ever here, let us begin to create a world.</div>
    </div>
    <div class="right" v-if="currentProject == null">
      <div class="btns">
        <el-button size="large" plain @click="AddPop()">
          <el-icon class="el-icon--left">
            <Plus />
          </el-icon>&nbsp;New  
        </el-button>
        <el-button size="large" plain @click="SettingPop()">
          <el-icon class="el-icon--left">
            <Setting />
          </el-icon>&nbsp;Setting
        </el-button>
      </div>
      <div class="avtive">
        <div class="title">
          <i class="icon">&#xe981;</i>Events
        </div>
        <div class="event-list">
          <div class="event" v-for="(item, index) in events">
            <div class="work" v-if="item.work_type == 'ink!'">
              <Identicon class="identicon" :stroke="2"
                :foreground="theme == 'dark' ? [255, 250, 255, 180] : [0, 0, 0, 180]" :background="[255, 255, 255, 0]"
                :padding="0.18" :hash="ss58toHex(item.work_id)" />
              contract
            </div>
            <div class="work" v-if="item.work_type != 'ink!'"><span>#{{ item.work_id }}</span>{{ item.work_type }}</div>
            <div class="space"></div>
            <div class="msg">{{ eventMsg[item.action] }}</div>
            <span class="icon" :class="item.action" v-html="eventStatus[item.action]"></span>
          </div>
        </div>
      </div>
    </div>
    <Detail v-if="currentProject != null" :close="() => currentProject = null" :openTag="tag" :info="currentProject" />
    <div class="plus" @click="AddPop()"><i class="icon">&#xe604;</i></div>
  </div>
</template>

<script lang="ts" setup>
import { inject, nextTick, onMounted, onUnmounted, ref } from "vue";
import { Setting, Plus } from '@element-plus/icons-vue'
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import useGlobelProperties from "@/store/globel";
import Detail from "./project/detail.vue";
import { ElNotification } from "element-plus";
import { getUrlParams } from "@/utils/pop";
import { getContracts } from "@/apis/contract_indexer";
import { getEvents } from "@/apis/event_indexer";
import { ss58toHex } from "@/utils/chain";

const global = useGlobelProperties()
const wetee: any = inject('wetee')
const projectid = getUrlParams("project_id");
const theme = ref(document.documentElement.getAttribute("class"));

const router = useRouter();
const route = useRoute();
const store = useStore();
const apps = ref<any[]>([]);
const events = ref<any[]>([]);
const currentProject = ref<any>(null);
const tag = ref("metrics");
const pid = route.params.id.toString();
const iconStatus = ref<Record<number, string>>({
  0: "&#xe60b;",
  1: "&#xe60b;",
  2: "&#xe623;",
  3: "&#xe669;",
  4: "&#xe60b;",
});

const eventStatus = ref<Record<string, string>>({
  "start": "&#xe64d;",
  "stop": "&#xe641;",
  "work_contract_updated": "&#xe62a;",
});

const eventMsg = ref<Record<string, string>>({
  "start": "start",
  "stop": "stop",
  "work_contract_updated": "TEE verified",
});

const textStatus = ref<Record<number, string>>({
  0: "waiting",
  1: "deploying",
  2: "stoped",
  3: "runing",
  4: "waiting",
});

const OpenDetail = (item: any, t: string) => {
  tag.value = t;
  currentProject.value = item;
  nextTick(() => {
    document.getElementById('project-' + item.Id)!.scrollIntoView({ behavior: 'smooth', block: "center" });
  })
};

const AddPop = () => {
  global.$AddPop(router, store, () => {
    getList(pid)
  })
};

const SettingPop = () => {
  global.$ProjectSetting(router, store)
};

const showPenu = (e: MouseEvent, item: any) => {
  e.preventDefault();
  e.stopPropagation();
  global.$OpenProjectMenu(router, store, e, item, async (cmd: string) => {
    const chain = global.$getChain();
    const signer = store.state.userInfo.addr;

    switch (cmd) {
      case "settings":
      case "metrics":
      case "inkCall":
      case "inkMeta":
        OpenDetail(item, cmd)
        break;
      case "stop":
        const sty = wetee().client.createType('WorkType', item.Type);
        const swid = { id: item.Nid, wtype: sty }
        const tx = wetee().client.tx.weTEEWorker.workStop(swid)
        await chain.ProxySignAndSend(tx, projectid, signer, () => {
          ElNotification({
            title: 'Notice',
            message: "Application stop successfully",
            type: 'success',
          })
          getList(pid)
        }, () => {
        })
        break;
      case "restart":
        const ty = wetee().client.createType('WorkType', item.Type);
        const wid = { id: item.Nid, wtype: ty }
        let txre = null
        if (item.Type == "APP") {
          txre = wetee().client.tx.weTEEApp.restart(wid.id)
        } else if (item.Type == "TASK") {
          txre = wetee().client.tx.weTEETask.rerun(wid.id)
        } else {
          txre = wetee().client.tx.weTEEGpu.restart(wid.id)
        }
        await chain.ProxySignAndSend(txre, projectid, signer, () => {
          ElNotification({
            title: 'Notice',
            message: "Application restart successfully",
            type: 'success',
          })
          getList(pid)
        }, () => {
        })
        break;
      default:
        break;
    }
  })
};

let timerId = setInterval(() => {
  getList(pid)
  getEvent(pid)
}, 60000);

onMounted(async () => {
  getList(pid)
  getEvent(pid)
});

onUnmounted(() => {
  clearInterval(timerId);
});

const getList = async (projectId: string) => {
  let appsNew: any[] = [];

  try {
    const contractRes = await getContracts(projectId)
    contractRes.list_contract.forEach((c: any) => {
      const abi = JSON.parse(c.abi)
      appsNew.push({
        Id: "INK—" + c.contract,
        Nid: c.contract,
        Type: "INK",
        Cr: { disk: [] },
        ContractId: c.contract,
        ProjectId: c.project,
        Name: abi.contract.name,
        Image: abi.contract.name,
        Abi: abi,
        StartBlock: "0",
        Status: 3,
      });
    });
  } catch (e) {

  }

  const gappsList = await wetee().client.query.weTEEGpu.gpuApps.entries(projectId);
  gappsList.forEach((d: any) => {
    const [_, exposure] = d;
    const item = exposure.toHuman();
    appsNew.push({
      Id: "GPU-" + item.id,
      Nid: item.id,
      Type: "GPU",
      Cr: item.cr,
      ContractId: item.contractId,
      ProjectId: item.creator,
      Name: item.name,
      Image: item.image,
      StartBlock: item.startBlock,
      Status: parseInt(item.status),
    });
  });

  const appsList = await wetee().client.query.weTEEApp.teeApps.entries(projectId);
  appsList.forEach((d: any) => {
    const [_, exposure] = d;
    const item = exposure.toHuman();
    appsNew.push({
      Id: "APP-" + item.id,
      Nid: item.id,
      Type: "APP",
      Cr: item.cr,
      ContractId: item.contractId,
      ProjectId: item.creator,
      Name: item.name,
      Image: item.image,
      StartBlock: item.startBlock,
      Status: parseInt(item.status),
    });
  });

  const tasksList = await wetee().client.query.weTEETask.teeTasks.entries(projectId);
  tasksList.forEach((d: any) => {
    const [_, exposure] = d;
    const item = exposure.toHuman();
    appsNew.push({
      Id: "TASK—" + item.id,
      Nid: item.id,
      Type: "TASK",
      Cr: item.cr,
      ContractId: item.contractId,
      ProjectId: item.creator,
      Name: item.name,
      Image: item.image,
      StartBlock: item.startBlock,
      Status: parseInt(item.status),
    });
  });


  apps.value = appsNew.sort(function (a, b) {
    return parseInt(a.StartBlock.replace(",", "")) - parseInt(b.StartBlock.replace(",", ""));
  });
};

const getEvent = async (projectId: string) => {
  const eventRes = await getEvents(projectId)
  if (events.value.length > 0 && eventRes.list_event.length == events.value.length) {
    getList(projectId)
  }
  events.value = eventRes.list_event;
};

const shortImage = (image: string) => {
  let images = image.split("/")
  if (images.length == 1) {
    return image;
  }
  return images[images.length - 1];
};
</script>

<style lang="scss" src="../../assets/styles/project.scss" scoped></style>
<style lang="scss">
.light .pod {
  border: 3px solid rgba($secondary-text-rgb, 0.08) !important;
  background: var(--g-secondary-bg);

  .mask-bg::after {
    background-image: radial-gradient(transparent 1px, var(--g-secondary-bg) 1px) !important;
  }
}

.light .pod.active {
  border: 3px solid rgba($primary-text-rgb, 0.7) !important;
}

.light {
  .status0 {
    color: #cea94c !important;
  }

  .status1 {
    color: #cea94c !important;
  }

  .status2 {
    color: #b6631a !important;
  }

  .status3 {
    color: #5a936a !important;
  }

  .status4 {
    color: #343330 !important;
  }
}
</style>