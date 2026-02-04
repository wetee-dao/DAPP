<template>
  <div class="bill-box">
    <div class="header">
      <div class="item">Contract account:&nbsp;&nbsp;{{ info.Contract }}</div>
      <div class="item">Substrate account:&nbsp;&nbsp;{{ accountData.ss58 }}<div class="space"></div>
        <div class="free">Free:&nbsp;&nbsp;{{ accountData.balance.value }} {{ accountData.balance.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { $getQueryApi } from '@/plugins/chain';
const props = defineProps(["info"])

const info = ref<any>(props.info)
const accountData = ref<any>({})

onMounted(() => {
  $getQueryApi().contactInfo(info.value.Contract).then((res: any) => {
    accountData.value = res
  })
})

</script>

<style lang='scss' scoped>
.bill-box {
  padding: 10px 32px;

  .item {
    font-size: 16px;
    color: $secondary-text;
    margin-top: 10px;
    background-color: rgba($gray-bg-rgb, 0.06);
    padding: 20px;
    border-radius: 10px;
    display: flex;
    word-break: break-all;

    .free {
      color: rgba($primary-text-rgb, 0.8);
      margin-left: 10px;
      text-align: right;
      width: 120px;
    }
  }
}

</style>