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
  color: rgba($secondary-text-rgb,1);
  // font-weight: bold;
  // color: rgba($primary-text-rgb,0.3);
  padding: 0 5px;
  align-items: center;

  &>div {
    display: inline-flex;
    align-items: center;
    font-size: 16px;
  }

  .px{
    cursor: pointer;
    // font-size: 15px;
  }

  .p {
    cursor: pointer;
    // font-size: 15px;
    margin: 0px 7px;
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
