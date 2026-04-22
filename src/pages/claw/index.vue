<template>
  <div class="claw-page">
    <div class="page-head">
      <h1 class="title">{{ t('claw.pageTitle') }}</h1>
      <p class="lead">{{ t('claw.lead') }}</p>
    </div>

    <div class="list-head">
      <h2 class="section-title">{{ t('claw.deployedAgentTitle') }}</h2>
      <el-button type="primary" plain @click="openDeploy()">
        {{ t('claw.deployAgent') }}
      </el-button>
    </div>

    <div class="agent-list">
      <div
        v-for="item in deployedAgents"
        :key="item.Id"
        class="agent-item"
        @click="openDeploy(item)"
      >
        <div class="name">{{ item.Name || `#${item.Id}` }}</div>
        <div class="meta">
          <span class="id">#{{ item.Id }}</span>
          <span class="sep">·</span>
          <span class="status">{{ item.Status ?? '-' }}</span>
        </div>
      </div>

      <div v-if="!loading && deployedAgents.length === 0" class="empty">
        {{ t('common.noData') }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import useGlobelProperties from "@/plugins/globel";
import { $getQueryApi } from "@/plugins/chain";

const { t } = useI18n();
const router = useRouter();
const store = useStore();
const global = useGlobelProperties();

const loading = ref(true);
const deployedAgents = ref<any[]>([]);

const isClawAgent = (pod: any) => {
  const type = String(pod?.Type ?? "");
  if (type !== "TASK") return false;
  const name = String(pod?.Name ?? "").toLowerCase();
  const image = String(pod?.Image ?? "").toLowerCase();
  return (
    name.includes("claw") ||
    image.includes("openclaw") ||
    image.includes("zeroclaw") ||
    image.includes("hermes") ||
    image.includes("claw")
  );
};

const loadList = async () => {
  loading.value = true;
  try {
    const list = await $getQueryApi().pods(null, 1000);
    const pods = (list || []).map((v: any) => ({
      Id: v[0],
      Name: v[1]?.name,
      Type: v[1]?.ptype,
      Image: v[2]?.[0]?.[1]?.image,
      Status: v[3],
    }));
    deployedAgents.value = pods.filter(isClawAgent);
  } finally {
    loading.value = false;
  }
};

const openDeploy = (item?: any) => {
  global.$DeployClawAgent(router, store, { agentType: item?.AgentType }, () => {
    loadList();
  });
};

onMounted(() => {
  loadList();
});
</script>

<style lang="scss" scoped>

.page-head {
  margin-bottom: 20px;
}

.title {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.3;
  margin: 0 0 10px;
  color: rgba($primary-text-rgb, 1);
}

.lead {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: rgba($secondary-text-rgb, 0.78);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 16px;
  color: rgba($primary-text-rgb, 0.95);
}

.list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.agent-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.agent-item {
  background: rgba($primary-bg-rgb, 1);
  border: 1px solid rgba($secondary-text-rgb, 0.12);
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-sizing: border-box;
  cursor: pointer;

  @media (hover: hover) {
    &:hover {
      border-color: rgba($secondary-text-rgb, 0.2);
      background: rgba($secondary-text-rgb, 0.02);
    }
  }
}

.name {
  font-size: 14px;
  font-weight: 600;
  color: rgba($primary-text-rgb, 1);
}

.meta {
  font-size: 12px;
  color: rgba($secondary-text-rgb, 0.72);
  display: flex;
  gap: 6px;
  align-items: center;
}

.sep {
  opacity: 0.6;
}

.empty {
  padding: 18px 0px;
  color: rgba($secondary-text-rgb, 0.62);
  text-align: left;
}
</style>
