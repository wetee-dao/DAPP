<template>
  <div class="service" @click="closeClick">
    <div @click="(e) => e.stopPropagation()">
      <div class="title">
        <i class="icon">&#xe701;</i>{{ t('claw.deployAgent') }}
        <div class="space"></div>
        <div class="right-tool">
          <div class="deploy-btn" @click="deploy">
            {{ t('claw.deploy') }}
          </div>
          <div class="close-btn" @click="closeClick">
            <i class="icon right">&#xe604;</i>
          </div>
        </div>
      </div>

      <el-form class="form">
        <div class="form-box">
          <div class="box-step">
            <div class="classTitle">
              <i class="icon">&#xe6bc;</i>{{ t('claw.baseSetting') }}
            </div>

            <div class="form-context-box">
              <div class="form-sub-title">{{ t('claw.agentName') }}</div>
              <div class="form-input-box">
                <el-input v-model="name" :placeholder="t('claw.agentNamePlaceholder')" />
              </div>
            </div>

            <div class="form-context-box">
              <div class="form-sub-title">{{ t('claw.selectAgentType') }}</div>
              <div class="form-input-box">
                <el-select v-model="agentType">
                  <el-option label="OpenClaw" value="openclaw" />
                  <el-option label="ZeroClaw" value="zeroclaw" />
                  <el-option label="Hermes-Agent" value="hermes-agent" />
                </el-select>
              </div>
            </div>

            <div class="form-context-box">
              <div class="form-sub-title">{{ t('claw.containerVersion') }}</div>
              <div class="form-input-box">
                <el-input v-model="containerVersion" :placeholder="t('claw.containerVersionPlaceholder')" />
              </div>
            </div>

            <div class="form-context-box">
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
            <div class="form-context-box">
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
                    readonly
                    class="pay-token-amount-input"
                    :placeholder="t('pop.prepayAmountAutoPlaceholder')"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="box-step">
            <div class="classTitle">
              <i class="icon">&#xe6bc;</i>{{ t('claw.initDocs') }}
            </div>

            <div class="form-context-box">
              <div class="form-sub-title">SOUL.md</div>
              <div class="form-input-box">
                <el-input
                  v-model="soulMd"
                  type="textarea"
                  :rows="10"
                  :placeholder="t('claw.soulMdPlaceholder')"
                />
              </div>
            </div>

            <div class="form-context-box">
              <div class="form-sub-title">USER.md</div>
              <div class="form-input-box">
                <el-input
                  v-model="userMd"
                  type="textarea"
                  :rows="10"
                  :placeholder="t('claw.userMdPlaceholder')"
                />
              </div>
            </div>
          </div>
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
import { useI18n } from "vue-i18n";
import { ElMessage, ElNotification } from "element-plus";
import { $getQueryApi, $getTxProvider } from "@/plugins/chain";
import { getUrlParams } from "@/utils/pop";
import { validFormArray } from "@/pages/pop/substrate/utils";

const props = defineProps(["router", "store", "close", "app", "ps"]);
const { t } = useI18n();

const payTokenSelectOptions = computed(() =>
  PAY_TOKEN_OPTIONS.map((o) => ({
    value: o.payAsset,
    label: t(o.labelKey),
  })),
);

const agentType = ref<string>(props.ps?.agentType || "openclaw");
const name = ref<string>("");
const containerVersion = ref<string>("");
const soulMd = ref<string>("");
const userMd = ref<string>("");
const durationBlocks = ref<number>(43200);
const { durationQuickPreset, onDurationQuickPresetChange } = useDurationQuickPreset(durationBlocks);
const payAsset = ref<number>(NATIVE_PAY_ASSET);
const prepayAmount = ref<string>("");

function getAgentPrepayEstimateInput(): PodPrepayEstimateInput {
  return {
    teeType: "CVM",
    level: 1,
    payAsset: payAsset.value,
    durationBlocks: Math.max(1, Math.floor(Number(durationBlocks.value)) || 1),
    containers: [{ cpu: 1000, mem: 3000, gpu: 0, disk: [] }],
    diskGb: () => 0n,
  };
}

useContractPrepayAutoFill(prepayAmount, durationBlocks, payAsset, getAgentPrepayEstimateInput);

const isClawImage = (image: string, tpe: string) => {
  const img = String(image || "").toLowerCase();
  switch (tpe) {
    case "openclaw":
      return img.includes("openclaw");
    case "zeroclaw":
      return img.includes("zeroclaw");
    case "hermes-agent":
      return img.includes("hermes") && img.includes("agent");
    default:
      return false;
  }
};

const guessDefaultImage = async (tpe: string): Promise<string> => {
  try {
    const list = await $getQueryApi().pods(null, 1000);
    for (const v of list || []) {
      const image = v?.[2]?.[0]?.[1]?.image;
      if (image && isClawImage(String(image), tpe)) {
        return String(image);
      }
    }
  } catch (_) {
    // ignore, fallback below
  }
  // conservative fallback, user can override by version
  if (tpe === "openclaw") return "openclaw:latest";
  if (tpe === "zeroclaw") return "zeroclaw:latest";
  return "hermes-agent:latest";
};

const applyVersion = (image: string, version: string) => {
  const v = String(version || "").trim();
  if (!v) return image;
  const img = String(image || "").trim();
  if (!img) return img;
  const atSplit = img.split("@");
  if (atSplit.length > 1) {
    // digest images: keep digest, ignore tag override
    return img;
  }
  const parts = img.split(":");
  if (parts.length <= 1) return `${img}:${v}`;
  parts.pop();
  return `${parts.join(":")}:${v}`;
};

const closeClick = () => {
  props.close();
};

const deploy = async () => {
  const pid = getUrlParams("project_id") || "-1";

  const tpe = agentType.value;
  const agentName = (name.value || "").trim() || `${tpe}-${Date.now()}`;
  const baseImage = await guessDefaultImage(tpe);
  const image = applyVersion(baseImage, containerVersion.value);

  const env: any[] = [];
  if (soulMd.value.trim()) {
    env.push({ prefix: "Env", key: "SOUL_MD", value: soulMd.value });
  }
  if (userMd.value.trim()) {
    env.push({ prefix: "Env", key: "USER_MD", value: userMd.value });
  }
  env.push({ prefix: "Env", key: "CLAW_AGENT_TYPE", value: tpe });

  const containerForm: any = {
    image,
    cpu: 1000,
    memory: 3000,
    disk: [],
    port: [],
    commandPrefix: "SH",
    command: "",
    env,
    gpu: 0,
  };

  await $getTxProvider(async (chain, builder): Promise<void> => {
    if (!chain.client) return;
    const signer = props.store.state.userInfo.addr;

    const validData = validFormArray(containerForm);
    if (!validData.ok) return;

    if (!durationBlocks.value || durationBlocks.value < 1) {
      ElNotification({ title: t("common.error"), message: t("pop.validateDurationBlocks"), type: "error" });
      return;
    }
    const prepay = prepayAmount.value.trim();
    if (!prepay || !/^\d+$/.test(prepay) || BigInt(prepay) <= 0n) {
      ElNotification({ title: t("common.error"), message: t("pop.validatePrepayAmount"), type: "error" });
      return;
    }

    const dry = await builder.createPod(
      agentName,
      "CPU",
      "CVM",
      [validData.data],
      0,
      1,
      payAsset.value,
      BigInt(0),
      durationBlocks.value,
      prepay,
    );

    const tx = await chain.buildCall(dry, signer);
    await chain.proxysignAndSend(tx, pid, signer, () => {
      ElMessage.success(t("common.success"));
      props.close();
    }, () => {
      props.close();
    });
  });
};

onMounted(async () => {
  // prefill a reasonable default name
  if (!name.value) {
    name.value = `${agentType.value}-${new Date().toISOString().slice(0, 10)}`;
  }
});
</script>

<style lang="scss" scoped>
@use "../../../assets/styles/components/pop.scss";

:deep(.el-textarea__inner) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
}

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

