<template>
  <div class="headerNav">
    <div v-for="(item, index) in paths" @click="closeClick(index)">
      <div class="px">
        /
      </div>
      <div class="p">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

const emit = defineEmits(['closeClick']);
const props = defineProps(["paths"])
const paths = props.paths;
const router = useRouter();
const closeClick = (i: string | number) => {
  const item = paths[Number(i)];
  router.push(item.url);
}
</script>

<style lang="scss" scoped>

.headerNav {
  border-radius: 0;
  color: rgba($secondary-text-rgb, 0.55);
  padding: 0 8px;
  align-items: center;
  font-size: 13px;
  letter-spacing: 0.02em;

  &>div {
    display: inline-flex;
    align-items: center;
  }

  .px {
    cursor: default;
    user-select: none;
    opacity: 0.4;
    padding: 0 2px;
  }

  .p {
    cursor: pointer;
    margin: 0 6px;
    color: rgba($secondary-text-rgb, 0.78);
    transition: color 0.15s ease;

    &:hover {
      color: $primary-text;
    }
  }

  /* 最后一级为当前页，略强调 */
  & > div:last-child .p {
    color: rgba($secondary-text-rgb, 0.9);
  }
}

@media screen and (max-width: 700px) {
  .headerNav {
    display: none;
  }
}
</style>
