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
          :class="{ active: item.module === props.module, disabled: item.disabled }"
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
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import service, { insType } from "../utils/service";
import Logo2 from "./icons/Logo2.vue";
import TeeVmLogo from "./icons/TeeVmLogo.vue";
import TeeClawLogo from "./icons/TeeClawLogo.vue";

const router = useRouter();
const { t } = useI18n();
const input = ref("");
const lists = ref(service);
const props = defineProps(["module"])

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
    url: '',
    active: false,
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
  router.push(item.url);
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
    width: 4.25rem;
    min-width: 4.25rem;
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
    padding: 4px 8px 10px 0px;
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
    gap: 8px;
    padding: 10px 6px;
    cursor: pointer;
    color: rgba($secondary-text-rgb, 0.52);
    transition: background-color 0.2s ease, color 0.2s ease, opacity 0.2s ease;

    @media (hover: hover) {
      &:hover:not(.disabled):not(.active) {
        background-color: rgba($secondary-text-rgb, 0.02);
        color: rgba($secondary-text-rgb, 0.78);
      }
    }

    &.active {
      color: $primary-text;
      position: relative;

      &::after {
        content: " ";
        position: absolute;
        top: 19%;
        left: 0;
        width: 5px;
        height: 40%;
        background-color: $primary-text;
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
      }
    }

    &.disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }

  .product-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    background-color: rgba($secondary-text-rgb, 0.06);
    overflow: hidden;
  }

  .product-icon-inner {
    width: 24px;
    height: 24px;
    display: block;
  }

  .product-name {
    font-size: 10px;
    line-height: 1.2;
    text-align: center;
    word-break: break-word;
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
    font-size: 13px;
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
