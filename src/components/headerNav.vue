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
const closeClick = (i:number) => {
  const item = paths[i];
  router.push(item.url);
}
</script>

<style lang="scss" scoped>

.headerNav {
  border-radius: 4px;
  color: $secondary-text;
  padding: 0 20px;
  // height: 27px;
  align-items: center;

  &>div {
    display: inline-flex;
    align-items: center;
  }

  .px{
    line-height: 17px;
    cursor: pointer;
    font-size: 14px;
    height: 16px;
    line-height: 16px;
  }

  .p {
    cursor: pointer;
    font-size: 14px;
    height: 12px;
    line-height: 12px;
    margin: 0px 6px;
    border-radius: 4px;
    &:hover{
      text-decoration: underline;
      color: $primary-text;
    }
  }
}

@media screen and (max-width: 700px) {
  .headerNav {
    display: none;
  }
}
</style>
