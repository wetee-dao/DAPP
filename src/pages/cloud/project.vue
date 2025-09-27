<template>
  <div class="project">
    <div :class="'data' + (currentProject != null ? ' thin_box' : '')">
      <div v-for="(item, index) in apps" :id="'project-' + item.Id" :key="index"
        :class="(currentProject != null && item.Id == currentProject.Id) ? 'pod active' : 'pod'"
        @click="OpenDetail(item, '')" @click.right.native="showPenu($event, item)">
        <div class="contact" v-if="item.Type == 'INK'">
          <Identicon :key="theme + item.Id" class="identicon" :stroke="0.1"
            :foreground="theme == 'dark' ? [80, 250, 130, 255] : [21, 132, 54, 255]" :background="[255, 255, 255, 0]"
            :strokeColor="theme == 'dark' ? [0, 0, 0, 225] : [255, 255, 255, 220]" :padding="0.2"
            :hash="ss58toHex(item.Nid)" />
          <div class="title">
            {{ item.Abi.contract.name }}
            <div class="code">
              <!-- <i class="icon">&#xe663;</i> -->
              {{ item.Nid }}
            </div>
          </div>
        </div>
        <div class="dataText" v-if="item.Type != 'INK'">
          <p>{{ item.Name }}</p>
          <div class="image">
            <i class="icon">&#xf18e;</i>
            <div class="text" :alt="item.Image">{{ shortImage(item.Image) }}</div>
          </div>
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
        <!-- <div class="mask-bg" v-if="item.Type == 'INK'">
          <i class="icon">&#xe663;</i>IInk! Contract
          <div class="mask-text"><i class="icon">&#xe663;</i> Ink! Contract</div>
        </div> -->
        <div class="mask-bg" v-if="item.Type == 'CPU'">
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

      <div v-if="currentProject == null && apps.length != 0" key="add" class="pod add" @click="AddPop()">
        <el-icon class="el-icon--left">
          <Plus />
        </el-icon>
        <div>Deploy new app</div>
      </div>

      <div class="empty" v-if="apps.length == 0">
        Nothing was ever here, let us begin to create a world.<br /><br />
        <el-button size="large" plain @click="AddPop()">
          <el-icon class="el-icon--left">
            <Plus />
          </el-icon>Deploy new app
        </el-button>
      </div>
    </div>
    <!-- <div class="right" v-if="currentProject == null">
      <div class="btns">
        <el-button size="large" plain @click="AddPop()">
          <el-icon class="el-icon--left">
            <Plus />
          </el-icon>Deploy New
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
    </div> -->
    <Detail v-if="currentProject != null" :close="() => currentProject = null" :openTag="tag" :info="currentProject" />
    <div class="plus" @click="AddPop()"><i class="icon">&#xe604;</i></div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { Plus } from '@element-plus/icons-vue'
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import useGlobelProperties from "@/plugins/globel";
import { ElNotification } from "element-plus";

import { getUrlParams } from "@/utils/pop";
import { getEvents } from "@/apis/event_indexer";
import { ss58toHex } from "@/utils/chain";
import { $getTxProvider, $getQueryApi } from "@/plugins/chain";

import Detail from "./project/detail.vue";

const global = useGlobelProperties()
const projectid = getUrlParams("project_id");

const router = useRouter();
const route = useRoute();
const store = useStore();
const apps = ref<any[]>([]);
const events = ref<any[]>([]);
const currentProject = ref<any>(null);
const tag = ref("metrics");
const userAddr = store.state.userInfo.addr;
const theme = ref(store.state.theme);
watch(() => store.state.theme, (newVal, _) => {
  theme.value = newVal
})

const iconStatus = ref<Record<number, string>>({
  0: "&#xe60b;",
  1: "&#xe669;",
  2: "&#xe623;",
  3: "&#xe623;",
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
  0: "deploying",
  1: "runing",
  2: "error",
  3: "stoped",
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
    getList(userAddr)
  })
};

const SettingPop = () => {
  global.$ProjectSetting(router, store)
};

const showPenu = (e: MouseEvent, item: any) => {
  e.preventDefault();
  e.stopPropagation();
  global.$OpenProjectMenu(router, store, e, item, async (cmd: string) => {
    const signer = store.state.userInfo.addr;

    switch (cmd) {
      case "settings":
      case "metrics":
      case "inkCall":
      case "inkMeta":
        OpenDetail(item, cmd)
        break;
      case "stop":
        await $getTxProvider(async (chain, builder): Promise<void> => {
          const dry = await builder.stopPod(
            item.Id
          )
          const tx = await chain.buildCall(dry)
          await chain.proxysignAndSend(tx, projectid!, signer, () => {
            ElNotification({
              title: 'Notice',
              message: "Application stop successfully",
              type: 'success',
            })
            getList(userAddr)
          }, () => {
          })
        });
        break;
      case "restart":
        await $getTxProvider(async (chain, builder): Promise<void> => {
          const dry = await builder.restartPod(
            item.Id
          )
          const tx = await chain.buildCall(dry)
          await chain.proxysignAndSend(tx, projectid!, signer, () => {
            ElNotification({
              title: 'Notice',
              message: "Application restart successfully",
              type: 'success',
            })
            getList(userAddr)
          }, () => {
          })
        });
        break;
      default:
        break;
    }
  })
};

let timerId = setInterval(() => {
  getList(userAddr)
  getEvent(userAddr)
}, 60000);

onMounted(async () => {
  getList(userAddr)
  getEvent(userAddr)
});

onUnmounted(() => {
  clearInterval(timerId);
});

const getList = async (userAddr: string) => {
  const list = await $getQueryApi().pods(null, 1000)
  let newList: any[] = []
  list.forEach((v: any) => {
    newList.push({
      Id: v[0],
      Nid: v[0],
      Type: v[1].ptype,
      Cr: {
        cpu: v[2][0][1].cpu,
        mem: v[2][0][1].memory,
        disk: v[2][0][1].disk,
        gpu: v[2][0][1].gpu,
      },
      // ContractId: value.contractId,
      // ProjectId: value.creator,
      Name: v[1].name,
      Image: v[2][0][1].image,
      StartBlock: v[1].startBlock,
      Status: v[3],
    });
  });
  apps.value = newList;
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
  border: 1Px solid rgba($secondary-text-rgb, 0.1) !important;
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
    color: #5a936a !important;
  }

  .status2 {
    color: #b6631a !important;
  }

  .status3 {
    color: #b6631a !important;
  }
}
</style>