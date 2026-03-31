<template>
  <div class="navList">
    <!-- <div class="left" @click="(e: any) => e.stopPropagation()">
        <ul v-for="(item, _index) in lists">
          <li class="left_one" >
            <a href="javascript:void(0);">
              {{ item.name }}
            </a>
          </li>
        </ul>
      </div> -->
    <div class="list">
      <div
        :class="{ active: item.module === props.module, disabled: item.disabled }"
        @click="toUri(item)"
        :key="item.name"
        v-for="(item, index) in lists"
      >
        <div class="icon">
          <Picon :icon="item.icon" />
        </div>
        {{ getLabel(item) }}
        <!-- <div class="left"></div>
        <div class="right"></div> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import service, { insType } from "../utils/service";

const router = useRouter();
const { t } = useI18n();
const input = ref("");
const lists = ref(service);
const props = defineProps(["module"])

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
</script>

<style lang="scss" scoped>
.navList {
  position: fixed;
  left: 0;
  height: calc(100% - 60px);
  z-index: 99;
  top: 60px;
  width: 9.8rem;
  box-sizing: border-box;
  border-right: 1px solid rgba($secondary-text-rgb, 0.045);

  .search {
    margin-bottom: 20px;
  }

  .list {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 12px 0 24px;
    gap: 2px;

    > div {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 15px 20px 15px 18px;
      flex-direction: row;
      justify-content: flex-start;
      font-size: 15px;
      font-weight: 400;
      line-height: 1.3;
      letter-spacing: 0.02em;
      color: rgba($secondary-text-rgb, 0.48);
      transition: color 0.2s ease, opacity 0.2s ease;

      .icon {
        width: 20px;
        height: 20px;
        margin-right: 10px;
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

          .icon {
            opacity: 0.85;
          }
        }
      }

      &.active {
        font-weight: 500;
        color: $primary-text;
        letter-spacing: 0.025em;

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
}
</style>
