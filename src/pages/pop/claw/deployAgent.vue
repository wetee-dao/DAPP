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
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElNotification } from "element-plus";
import { $getQueryApi, $getTxProvider } from "@/plugins/chain";
import { getUrlParams } from "@/utils/pop";
import { validFormArray } from "@/pages/pop/substrate/utils";

const props = defineProps(["router", "store", "close", "app", "ps"]);
const { t } = useI18n();

const agentType = ref<string>(props.ps?.agentType || "openclaw");
const name = ref<string>("");
const containerVersion = ref<string>("");
const soulMd = ref<string>("");
const userMd = ref<string>("");

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
  const pid = getUrlParams("project_id");
  if (!pid) {
    ElNotification({
      title: t("common.error"),
      message: "project_id is required in url",
      type: "error",
    });
    return;
  }

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

    const dry = await builder.createPod(
      agentName,
      "CPU",
      "CVM",
      [validData.data],
      0,
      1,
      BigInt(0),
    );

    const tx = await chain.buildCall(dry, signer);
    await chain.proxysignAndSend(tx, pid!, signer, () => {
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
</style>

