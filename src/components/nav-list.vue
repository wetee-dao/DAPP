<template>
  <div class="navList">
    <div class="product-rail">
      <div class="product-group-title">
        <Logo2 class="product-group-logo" :fill="true" />
      </div>
      <div
        v-for="product in productItems"
        :key="product.key"
        :class="['product-item', { active: product.active, disabled: product.disabled }]"
        @click="toProduct(product)"
      >
        <div class="product-icon">
          <component :is="product.icon" class="product-icon-inner" :fill="product.key === 'plusweb'" />
        </div>
        <div class="product-name">{{ product.label }}</div>
      </div>
    </div>
    <div class="list">
      <section
        class="group"
        v-for="group in groupedLists"
        :key="group.key"
      >
        <div class="group-title">
          {{ group.label }}
        </div>
        <div
          v-for="item in group.items"
          :key="item.name"
          :class="{ active: isItemActive(item), disabled: item.disabled }"
          class="nav-item"
          @click="toUri(item)"
        >
          <div class="icon">
            <Picon :icon="item.icon" />
          </div>
          <span class="label">{{ getLabel(item) }}</span>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import service, { insType } from "../utils/service";
import { clawBaseNav } from "../utils/claw-service";
import Logo2 from "./icons/Logo2.vue";
import TeeVmLogo from "./icons/TeeVmLogo.vue";
import TeeClawLogo from "./icons/TeeClawLogo.vue";
import { $getQueryApi } from "@/plugins/chain";
import useGlobelProperties from "@/plugins/globel";

const router = useRouter();
const store = useStore();
const global = useGlobelProperties();
const { t } = useI18n();
const input = ref("");
const props = defineProps(["module"])
const currentPath = computed(() => store.state.currentPath || "");

const deployedAgents = ref<insType[]>([]);

const lists = computed(() =>
  props.module === "claw" ? [...clawBaseNav, ...deployedAgents.value] : service
);

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

const loadDeployedAgents = async () => {
  if (props.module !== "claw") return;
  try {
    const list = await $getQueryApi().pods(null, 1000);
    const pods = (list || []).map((v: any) => ({
      Id: v[0],
      Name: v[1]?.name,
      Type: v[1]?.ptype,
      Image: v[2]?.[0]?.[1]?.image,
      Status: v[3],
    }));

    deployedAgents.value = pods
      .filter(isClawAgent)
      .map((p: any) => ({
        name: p.Name || `#${p.Id}`,
        group: "Agents",
        groupKey: "nav.clawAgents",
        icon: "claw",
        url: "",
        module: "claw",
        disabled: false,
        agentId: p.Id,
      }));
  } catch (e) {
    deployedAgents.value = [];
  }
};

onMounted(() => {
  loadDeployedAgents();
});

watch(
  () => props.module,
  (m) => {
    if (m === "claw") {
      loadDeployedAgents();
    }
  }
);

const productItems = computed(() => [
  {
    key: 'plusweb',
    label: t('nav.plusweb'),
    icon: TeeVmLogo,
    url: '/cloud',
    active: ['cloud', 'secret', 'disk', 'builder', 'bridge', 'mpc', 'dao', 'miner'].includes(props.module),
    disabled: false
  },
  {
    key: 'console',
    label: t('nav.console'),
    icon: TeeClawLogo,
    url: '/claw',
    active: props.module === 'claw',
    disabled: false
  }
]);

const groupedLists = computed(() => {
  const groups = new Map<string, { key: string; label: string; items: insType[] }>();

  lists.value.forEach((item) => {
    const key = item.group || 'default';
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: item.groupKey ? t(item.groupKey) : key,
        items: []
      });
    }
    groups.get(key)!.items.push(item);
  });

  return Array.from(groups.values());
});

const getLabel = (item: insType) => {
  return item.nameKey ? t(item.nameKey) : item.name;
};

const search = (list: any) => {
  return list.filter(
    (v: any) => v.name.toLowerCase().indexOf(input.value.toLowerCase()) > -1
  );
};

const toUri = (item: insType) => {
  if (item.disabled) {
    return;
  }
  if (props.module === "claw" && item.groupKey === "nav.clawAgents") {
    global.$DeployClawAgent(router, store, { agentId: (item as any).agentId }, () => {
      loadDeployedAgents();
    });
    return;
  }
  if (!item.url) return;
  router.push(item.url);
};

const isItemActive = (item: insType) => {
  if (props.module === "claw") {
    // claw 二级栏目中：
    // - “智能体管理”(基础菜单 /claw) 需要激活态
    // - 已部署智能体列表点击弹窗，不走路由激活
    if (item.url === "/claw") {
      return currentPath.value === "/claw";
    }
    return false;
  }
  return currentPath.value.startsWith(item.url);
};

const toProduct = (product: { disabled?: boolean; url?: string }) => {
  if (product.disabled || !product.url) {
    return;
  }
  router.push(product.url);
};
</script>

<style lang="scss" scoped>
.navList {
  position: fixed;
  left: 0;
  height: 100%;
  z-index: 99;
  top: 0px;
  width: 15.5rem;
  box-sizing: border-box;
  border-right: 1px solid rgba($secondary-text-rgb, 0.045);
  display: flex;
  flex-direction: row;

  .search {
    margin-bottom: 20px;
  }

  .product-rail {
    width: 4rem;
    min-width: 4rem;
    border-right: 1px solid rgba($secondary-text-rgb, 0.050);
    padding: 16px 8px 24px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }

  .product-group-title {
    width: 100%;
    padding: 4px 8px 10px 2px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .product-group-logo {
    width: 28px;
    height: 28px;
    display: block;
  }

  .product-item {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 5px 6px;
    cursor: pointer;
    color: rgba($secondary-text-rgb, 0.52);
    transition: background-color 0.2s ease, color 0.2s ease, opacity 0.2s ease;

    // 一级菜单图标/文字统一使用同一套样式
    // 通过 CSS 灰度 + 透明度实现未激活效果
    .product-icon-inner {
      filter: grayscale(1);
      opacity: 0.55;
      transition: filter 0.2s ease, opacity 0.2s ease;
    }

    @media (hover: hover) {
      &:hover:not(.disabled):not(.active) {
        background-color: rgba($secondary-text-rgb, 0.02);
        color: rgba($secondary-text-rgb, 0.78);
      }
    }

    &.active {
      color: $primary-text;
      position: relative;

      .product-icon-inner {
        filter: none;
        opacity: 1;
      }

      &::after {
        content: "";
        position: absolute;
        top: 50%;
        left: -1px;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 4px 0 4px 5px;
        border-color: transparent transparent transparent $primary-text;
      }
    }

    &.disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }

  .product-icon {
    width: 40px;
    // height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    // border-radius: 4px;
    // background-color: rgba($secondary-text-rgb, 0.06);
    overflow: hidden;
  }

  .product-icon-inner {
    width: 28px;
    height: 28px;
    display: block;
  }

  .product-name {
    font-size: 12px;
    line-height: 1.1;
    text-align: center;
    word-break: break-word;
    width: 30px;
  }

  .list {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 12px 8px 16px;
    gap: 12px;
    box-sizing: border-box;
  }

  .group {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .group-title {
    padding: 0 13px 15px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba($secondary-text-rgb, 0.34);
  }

  .nav-item {
    display: flex;
    align-items: center;
    border-radius: 4px;
    cursor: pointer;
    padding: 10px 12px;
    flex-direction: row;
    justify-content: flex-start;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.25;
    letter-spacing: 0.01em;
    color: rgba($secondary-text-rgb, 0.48);
    transition: color 0.2s ease, opacity 0.2s ease, background-color 0.2s ease;

    .label {
      flex: 1;
    }

    .icon {
      width: 18px;
      height: 18px;
      margin-right: 8px;
      display: block;
      flex-shrink: 0;
      opacity: 0.55;

      :deep(path) {
        fill: currentColor;
        transition: opacity 0.2s ease;
      }
    }

    @media (hover: hover) {
      &:hover:not(.disabled):not(.active) {
        color: rgba($secondary-text-rgb, 0.78);
        background-color: rgba($secondary-text-rgb, 0.05);

        .icon {
          opacity: 0.85;
        }

        &::after {
          opacity: 0.55;
          transform: translateX(0);
        }
      }
    }

    &.active {
      font-weight: 500;
      color: $primary-text;
      letter-spacing: 0.012em;
      background-color: rgba($secondary-text-rgb, 0.08);

      .icon {
        opacity: 1;
      }
    }

    &.disabled {
      opacity: 0.32;
      cursor: not-allowed;
    }
  }
}
</style>
