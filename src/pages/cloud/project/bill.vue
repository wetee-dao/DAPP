<template>
  <div class="bill-box">
    <div class="header">
      <div class="item">Contract account:&nbsp;&nbsp;{{ info.ContractId }}<div class="space"></div>
        <div class="free">Free:&nbsp;&nbsp;{{ accountData.free }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';

import useGlobelProperties from "@/store/globel";
const props = defineProps(["info"])

const global = useGlobelProperties()
const wetee: any = inject('wetee')
const info = ref<any>(props.info)
const accountData = ref<any>({})

onMounted(() => {
  wetee().client.query.system.account(info.value.ContractId).then((res: any) => {
    accountData.value = res.toHuman().data
  })
})


</script>

<style lang='scss' scoped>
.bill-box {
  padding: 10px 42px;

  .item {
    font-size: 16px;
    color: $secondary-text;
    margin-top: 10px;
    background-color: rgba($gray-bg, 0.06);
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