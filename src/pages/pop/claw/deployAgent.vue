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
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";

const props = defineProps(["router", "store", "close", "app", "ps"]);
const { t } = useI18n();

const agentType = ref<string>(props.ps?.agentType || "openclaw");
const name = ref<string>("");
const containerVersion = ref<string>("");
const soulMd = ref<string>("");
const userMd = ref<string>("");

const closeClick = () => {
  props.close();
};

const deploy = () => {
  // 部署流程后续接入链上/后端，这里先保留弹窗交互与入口与参数形状
  const payload = {
    agentType: agentType.value,
    name: name.value,
    containerVersion: containerVersion.value,
    soulMd: soulMd.value,
    userMd: userMd.value,
  };
  void payload;
  ElMessage.info(t("claw.deployPending", { name: agentType.value }));
  props.close();
};
</script>

<style lang="scss" scoped>
@use "../../../assets/styles/components/pop.scss";

:deep(.el-textarea__inner) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
}
</style>

