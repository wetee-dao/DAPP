<template>
  <div class="service" @click="closeClick">
    <div @click="(e) => e.stopPropagation()">
      <div class="title">
        <i class="icon">&#xe701;</i>{{ t('pop.deployConfidentialService') }}
        <div class="space"></div>
        <div class="right-tool">
          <div class="deploy-btn" @click="toAdd()">
            {{ t('pop.deployNow') }}
          </div>
          <div class="close-btn" @click="closeClick">
            <i class="icon right">&#xe604;</i>
          </div>
        </div>
      </div>
      <div class="toolbar">
        <ul class="tabs">
          <li class="tab-item template">
            <!-- <el-autocomplete @select="handleTempApp" v-model="curTemp" :fetch-suggestions="querySearch"
              placeholder="Select app template">
              <template #prefix>
                <i class="icon">&#xe680;</i>
              </template>
<template #default="{ item }">
                <div class="input-app" :key="item.name">
                  <img class="icon" :src="item.icon" />
                  <div class="app-box">
                    <div class="app-title">{{ item.name }}</div>
                    <span class="app-desc">{{ item.desc }}</span>
                  </div>
                </div>
              </template>
<template #suffix>
                <i class="icon select">&#xe809;</i>
              </template>
</el-autocomplete> -->
            <el-select class="no-border-input" v-model="teeVersion" @change="TeeVersionChange"
              :placeholder="t('pop.selectTeeVersion')">
              <el-option :label="t('pop.teeTypeSgx')" value="SGX" />
              <el-option :label="t('pop.teeTypeCvm')" value="CVM" />
            </el-select>
          </li>
          <li :class="curContainer == 0 ? 'tab-item active' : 'tab-item'" @click="activeContainer(0)">
            <div class="tab-title">{{ t('pop.mainContainer') }}</div>
          </li>
          <li :class="curContainer == (index + 1) ? 'tab-item active' : 'tab-item'" @click="activeContainer(index + 1)"
            v-for="(_item, index) in containers.filter((_item, index) => index > 0)" :key="index">
            <div class="tab-title">{{ t('pop.sideContainer', { index: index + 1 }) }}</div>
            <el-icon class="delete-container" @click.stop="deleteContainer(index + 1)">
              <Close />
            </el-icon>
          </li>
          <li class="tab-item no-border" v-if="teeVersion == 'CVM'" @click="addContainer">
            <div class="tab-title"><span class="icon">&#xe604;</span>&nbsp;{{ t('pop.addContainer') }}</div>
          </li>
        </ul>

      </div>
      <div class="notice" v-if="teeVersion == 'SGX'"><span class="sgx-warning">{{ t('pop.sgxNotice') }}</span></div>
      <el-form class="form" ref="formRef">
        <div class="form-box" ref="containerRef">
          <div class="box-step" id="f0">
            <div class="classTitle">
              <i class="icon">&#xe6bc;</i>{{ t('pop.baseSetting') }}
            </div>
            <div class="form-context-box" v-show="curContainer == 0">
              <div class="form-sub-title">{{ t('pop.name') }}</div>
              <div class="form-input-box">
                <el-input v-model="name" :placeholder="t('pop.serviceName')"></el-input>
              </div>
            </div>
            <div class="form-context-box">
              <div class="form-sub-title">{{ t('pop.dockerImage') }}</div>
              <div class="form-input-box">
                <el-input v-model="form.image" :placeholder="t('pop.dockerImage')">
                  <template #prefix>
                    <i class="icon">&#xf18e;</i>
                  </template>
                </el-input>
              </div>
            </div>
            <div class="form-context-box">
              <div class="form-sub-title">{{ t('pop.cpuUnit') }}</div>
              <div class="form-input-box">
                <el-slider v-model="form.cpu" :step="100" :max="32000" show-input />
              </div>
            </div>
            <div class="form-context-box">
              <div class="form-sub-title">{{ t('pop.memoryMb') }}</div>
              <div class="form-input-box">
                <el-slider v-model="form.memory" :step="100" :max="32000" show-input />
              </div>
            </div>
            <div class="form-context-box" v-show="curContainer == 0">
              <div class="form-sub-title">{{ t('pop.level') }}</div>
              <div class="form-input-box">
                <el-slider v-model="level" :max="8" show-input show-stops />
              </div>
            </div>
            <div class="form-context-box" v-show="curContainer == 0">
              <div class="form-sub-title">{{ t('pop.durationBlocks') }}</div>
              <div class="form-input-box">
                <div class="duration-blocks-row">
                  <el-input-number
                    v-model="durationBlocks"
                    :min="1"
                    :max="4294967295"
                    :step="100"
                    controls-position="right"
                    class="duration-blocks-input"
                  />
                  <el-select
                    v-model="durationQuickPreset"
                    class="duration-quick-select"
                    :placeholder="t('pop.durationQuickPresetPlaceholder')"
                    @change="onDurationQuickPresetChange"
                  >
                    <el-option :label="t('pop.durationPresetCustom')" :value="DURATION_QUICK_CUSTOM" />
                    <el-option :label="t('pop.durationPreset1d')" value="d1" />
                    <el-option :label="t('pop.durationPreset7d')" value="d7" />
                    <el-option :label="t('pop.durationPreset1m')" value="m1" />
                    <el-option :label="t('pop.durationPreset6m')" value="m6" />
                    <el-option :label="t('pop.durationPreset1y')" value="y1" />
                  </el-select>
                </div>
                <div class="field-hint">{{ t('pop.durationBlocksHint') }}</div>
                <div class="field-hint">{{ t('pop.durationBlocksHint2s') }}</div>
              </div>
            </div>
            <div class="form-context-box" v-show="curContainer == 0">
              <div class="form-sub-title">{{ t('pop.payTokenRowTitle') }}</div>
              <div class="form-input-box">
                <div class="pay-token-row">
                  <el-select
                    v-model="payAsset"
                    class="pay-token-type-select"
                    :placeholder="t('pop.payTokenType')"
                  >
                    <el-option
                      v-for="opt in payTokenSelectOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                  <el-input
                    v-model="prepayAmount"
                    disabled
                    readonly
                    class="pay-token-amount-input"
                    :placeholder="t('pop.prepayAmountAutoPlaceholder')"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="box-step" id="f1" v-if="teeVersion != 'SGX'">
            <div class="classTitle">
              <i class="icon">&#xee15;</i>{{ t('pop.commandSetting') }}
            </div>
            <div class="form-table-box">
              <div class="form-sub-title">{{ t('pop.commandNotice') }}</div>
              <div class="form-input-box">
                <el-input v-model="form.command" :placeholder="t('pop.commandExample')">
                  <template #prepend>
                    <el-select v-model="form.commandPrefix" :placeholder="t('pop.select')" style="width: 130px">
                      <el-option label="/bin/sh" value="SH" />
                      <el-option label="/bin/bash" value="BASH" />
                      <el-option label="/bin/zsh" value="ZSH" />
                    </el-select>
                  </template>
                </el-input>
              </div>
            </div>
          </div>

          <div class="box-step" id="f2">
            <div class="classTitle"><i class="icon">&#xe654;</i>{{ t('pop.environmentSetting') }}</div>
            <div class="form-table-box">
              <div class="flex" :key="index" v-for="(item, index) in form.env">
                <el-input v-model="item.key" :placeholder="t('pop.keyNameOrFileName')">
                  <template #prepend>
                    <el-select v-model="item.prefix" :placeholder="t('pop.select')" style="width: 170px">
                      <el-option :label="t('pop.publicEnv')" value="Env" />
                      <el-option :label="t('pop.secretEnv')" value="Encrypt" />
                    </el-select>
                  </template>
                </el-input>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <el-input v-if="item.prefix == 'Env'" v-model="item.value" :placeholder="t('pop.valueName')">
                  <template #prepend>{{ t('pop.value') }}</template>
                </el-input>
                <el-select v-if="item.prefix == 'Encrypt'" v-model="item.id" :placeholder="t('pop.selectSecret')">
                  <template #label="{ label }">
                    <div v-if="label != null">
                      <span>#{{ label.id }} {{ label.key }}</span>
                    </div>
                  </template>
                  <el-option :label="s" :value="s.id" v-for="s in secrets">
                    <span>#{{ s.id }} {{ s.key }}</span>
                  </el-option>
                </el-select>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <el-button size="large" type="danger" circle :icon="Delete" @click="removeItem('env', index as number)" />
              </div>
              <el-button size="large" @click="addItem('env')">
                <span class="icon">&#xe604;</span>&nbsp;&nbsp;{{ t('pop.add') }}&nbsp;&nbsp;
              </el-button>
            </div>
          </div>

          <div class="box-step" id="f3">
            <div class="classTitle"><i class="icon">&#xe645;</i>{{ t('pop.storageSetting') }}</div>
            <div class="form-table-box">
              <div class="flex" :key="index" v-for="(d, index) in form.disk">
                <el-input v-model="d.path" :placeholder="t('pop.mountPath')" />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <el-select v-model="d.id" :placeholder="t('pop.selectDisk')">
                  <template #label="{ label }">
                    <div v-if="label.data != null">
                      <span style="float: left">#{{ label.id }} {{ label.data.SecretSSD[0] }}</span>
                      <span style="
                          float: right;
                          color: var(--el-text-color-secondary);
                          font-size: 13px;
                        ">
                        {{ label.data.SecretSSD[2] }} GB
                      </span>
                    </div>
                  </template>
                  <el-option :label="disk" :value="disk.id" v-for="disk in disks">
                    <span style="float: left">#{{ disk.id }} {{ disk.data.SecretSSD[0] }}</span>
                    <span style="
                        float: right;
                        color: var(--el-text-color-secondary);
                        font-size: 13px;
                      ">
                      {{ disk.data.SecretSSD[2] }} GB
                    </span>
                  </el-option>
                </el-select>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <el-button size="large" type="danger" circle :icon="Delete" @click="removeItem('disk', index as number)" />
              </div>
              <el-button size="large" @click="addItem('disk')">
                <span class="icon">&#xe604;</span>&nbsp;&nbsp;{{ t('pop.add') }}&nbsp;&nbsp;
              </el-button>
            </div>
          </div>

          <div class="box-step last-step" id="f4">
            <div class="classTitle"><i class="icon">&#xe66d;</i>{{ t('pop.networkSetting') }}</div>
            <div class="form-table-box">
              <div class="flex" :key="index" v-for="(item, index) in form.port">
                <el-input type="number" v-model="item.value" :min="0" :max="65535"
                  :placeholder="t('pop.containerPort')">
                  <template #prepend>
                    <el-select v-model="item.prefix" :placeholder="t('pop.select')" style="width: 170px">
                      <el-option :label="t('pop.tcpExpose')" value="Tcp" />
                      <el-option :label="t('pop.udpExpose')" value="Udp" />
                      <el-option :label="t('pop.tcpProject')" value="ProjectTcp" />
                      <el-option :label="t('pop.udpProject')" value="ProjectUdp" />
                    </el-select>
                  </template>
                </el-input>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <el-button size="large" type="danger" circle :icon="Delete" @click="removeItem('port', index as number)" />
              </div>
              <el-button size="large" @click="addItem('port')">
                <span class="icon">&#xe604;</span>&nbsp;&nbsp;{{ t('pop.add') }}&nbsp;&nbsp;
              </el-button>
            </div>
          </div>

          <div class="margin-end-30"></div>

          <el-anchor class="form-anchor" :container="containerRef" direction="vertical" type="default" :bound="200"
            @click="handleClick">
            <el-anchor-link class="form-anchor-item" href="#f0" :title="t('pop.baseSetting')" />
            <el-anchor-link class="form-anchor-item" href="#f1" :title="t('pop.commandSetting')" />
            <el-anchor-link class="form-anchor-item" href="#f2" :title="t('pop.environmentSetting')"/>
            <el-anchor-link class="form-anchor-item" href="#f3" :title="t('pop.storageSetting')" />
            <el-anchor-link class="form-anchor-item" href="#f4" :title="t('pop.networkSetting')" />
          </el-anchor>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { NATIVE_PAY_ASSET, PAY_TOKEN_OPTIONS } from "@/constants/payTokens";
import { DURATION_QUICK_CUSTOM } from "@/constants/durationBlocksPreset";
import { useDurationQuickPreset } from "@/composables/useDurationQuickPreset";
import { useContractPrepayAutoFill } from "@/composables/useContractPrepayAutoFill";
import type { PodPrepayEstimateInput } from "@/utils/podContractPrepay";
import { ElNotification, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { Delete, Close } from '@element-plus/icons-vue';
import { getUrlParams } from "@/utils/pop";
import { validFormArray } from "./utils";
import { deepCopy } from "@/utils/object";
import { $getQueryApi, $getTxProvider } from "@/plugins/chain";

const pid = getUrlParams("project_id");
const props = defineProps(["router", "store", "close", "app"])
const { t } = useI18n();

const payTokenSelectOptions = computed(() =>
  PAY_TOKEN_OPTIONS.map((o) => ({
    value: o.payAsset,
    label: t(o.labelKey),
  })),
);

const containerRef = ref<HTMLElement | null>(null)
const formRef = ref<FormInstance>()
const handleClick = (e: MouseEvent) => {
  e.preventDefault()
}

const temps = (window as any).extTemps().filter((v: any) => v.create_type == "service")
const curTemp = ref<string>("")
const defaultContainer = {
  image: "",
  cpu: 1000,
  memory: 800,
  gpu: 0,
  disk: [],
  port: [],
  commandPrefix: "SH",
  command: "",
  env: [],
}
const name = ref<string>("")
const level = ref<number>(1)
/** 租用时长（区块数），对应合约 duration_blocks */
const durationBlocks = ref<number>(43200)
const { durationQuickPreset, onDurationQuickPresetChange } = useDurationQuickPreset(durationBlocks)
/** 支付资产 ID（u32），对应合约 pay_asset */
const payAsset = ref<number>(NATIVE_PAY_ASSET)
/** 随交易转入的原生代币数量（链上最小单位，整数字符串），用于预付；由租期与资源估算 */
const prepayAmount = ref<string>("")
const teeVersion = ref<string>("CVM")
const curContainer = ref<any>(0)
const containers = ref<any[]>([deepCopy(defaultContainer)])
const form = ref<any>(deepCopy(defaultContainer))

const store = props.store;
const userAddr = store.state.userInfo.addr;
const disks = ref<any[]>([]);
const secrets = ref<any[]>([]);

function diskGbById(id: string | number): bigint {
  const d = disks.value.find((x: any) => String(x.id) === String(id))
  const n = d?.data?.SecretSSD?.[2]
  if (n == null || n === "") return 0n
  try {
    return BigInt(Math.max(0, Math.floor(Number(n))))
  } catch {
    return 0n
  }
}

function getPrepayEstimateInput(): PodPrepayEstimateInput {
  const teeType = teeVersion.value === "SGX" ? "SGX" : "CVM"
  const snapshot = containers.value.map((c, idx) =>
    idx === curContainer.value
      ? { ...c, cpu: form.value.cpu, memory: form.value.memory, gpu: form.value.gpu ?? 0, disk: form.value.disk ?? [] }
      : { ...c, gpu: c.gpu ?? 0 },
  )
  const containersArg = snapshot.map((c) => ({
    cpu: Number(c.cpu) || 0,
    mem: Number(c.memory) || 0,
    gpu: Number(c.gpu) || 0,
    disk: (c.disk || []).map((d: any) => ({ id: d.id })),
  }))
  return {
    teeType,
    level: Math.max(1, Math.min(255, Math.floor(Number(level.value)) || 1)),
    payAsset: payAsset.value,
    durationBlocks: Math.max(1, Math.floor(Number(durationBlocks.value)) || 1),
    containers: containersArg,
    diskGb: diskGbById,
  }
}

useContractPrepayAutoFill(prepayAmount, durationBlocks, payAsset, getPrepayEstimateInput, () => ({
  level: level.value,
  tee: teeVersion.value,
  containers: containers.value.map((c) => ({ cpu: c.cpu, memory: c.memory, gpu: c.gpu, disk: c.disk })),
  cur: curContainer.value,
  formCpu: form.value.cpu,
  formMem: form.value.memory,
  formGpu: form.value.gpu,
  formDisk: form.value.disk,
  disksLen: disks.value.length,
}))

onMounted(async () => {
  getList()
});

const getList = async () => {
  const slist = await $getQueryApi().secrets(userAddr, null, 1000)
  const dlist = await $getQueryApi().disks(userAddr, null, 1000)
  secrets.value = slist
  disks.value = dlist
};

const TeeVersionChange = () => {
  containers.value[curContainer.value] = deepCopy(form.value)
}

const addContainer = () => {
  let oldCs = deepCopy(containers.value)
  oldCs.push(deepCopy(defaultContainer))
  containers.value = oldCs
  activeContainer(oldCs.length - 1)
}

const activeContainer = (i: number) => {
  // 保存状态
  if (curContainer.value != i) {
    containers.value[curContainer.value] = deepCopy(form.value)

    // 开启新的状态
    curContainer.value = i
  }

  form.value = deepCopy(containers.value[i])
}

const deleteContainer = (i: number) => {
  containers.value.splice(i, 1)

  form.value = containers.value[0]
  curContainer.value = 0
}

const createFilter = (queryString: string) => {
  return (restaurant: any) => {
    return (
      restaurant.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

const closeClick = () => {
  props.close();
};

const toAdd = async () => {
  containers.value[curContainer.value] = deepCopy(form.value)
  await $getTxProvider(async (chain, builder): Promise<void> => {
    if (!chain.client) {
      return;
    }
    const client = chain.client;

    let validDatas: any[] = []
    for (var i = 0; i < containers.value.length; i++) {
      const c = containers.value[i]
      const validData = validFormArray(c)
      if (!validData.ok) return;
      validDatas.push(validData.data)
    }

    const signer = props.store.state.userInfo.addr;
    if (name.value == "") {
      ElNotification({
        title: t("common.error"),
        message: t("pop.containerNameRequired"),
        type: "error",
      })
      return
    }

    if (teeVersion.value == "") {
      ElNotification({
        title: t("common.error"),
        message: t("pop.teeVersionRequired"),
        type: "error",
      })
      return
    }

    if (!durationBlocks.value || durationBlocks.value < 1) {
      ElNotification({
        title: t("common.error"),
        message: t("pop.validateDurationBlocks"),
        type: "error",
      })
      return
    }

    const prepay = prepayAmount.value.trim()
    if (!prepay || !/^\d+$/.test(prepay) || BigInt(prepay) <= 0n) {
      ElNotification({
        title: t("common.error"),
        message: t("pop.validatePrepayAmount"),
        type: "error",
      })
      return
    }

    const dry = await builder.createPod(
      name.value,
      "CPU",
      teeVersion.value,
      validDatas,
      0,
      level.value,
      payAsset.value,
      BigInt(0),
      durationBlocks.value,
      prepay,
    )

    const tx = await chain.buildCall(dry, signer)
    await chain.proxysignAndSend(tx, pid!, signer, () => {
      props.close();
    }, () => { })
  });
};

const addItem = (t: string) => {
  switch (t) {
    case 'env':
      form.value.env.push({
        prefix: "Env",
        key: "",
        value: "",
      });
      break;
    case 'port':
      form.value.port.push({
        prefix: "Tcp",
        value: null
      });
      break;
    case 'disk':
      form.value.disk.push({
        path: "",
        id: null
      });
      break;
  }
};

const removeItem = (t: string, i: string | number) => {
  form.value[t].splice(Number(i), 1);
};
</script>

<style lang="scss" scoped>
@use "../../../assets/styles/components/pop.scss";

.field-hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}

.pay-token-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.pay-token-type-select {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.pay-token-amount-input {
  flex: 1;
  min-width: 0;
}

.duration-blocks-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.duration-blocks-input {
  flex: 1;
  min-width: 0;
}

.duration-quick-select {
  width: 132px;
  flex-shrink: 0;
}
</style>