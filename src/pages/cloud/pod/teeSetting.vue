<template>
    <!-- <Service/> -->
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { $getQueryApi } from '@/plugins/chain';
const props = defineProps(["info"])


onMounted(() => {
    // $getQueryApi().query("system","account",[info.value.ContractId]).then((res: any) => {
    //     accountData.value = res.data
    // })
})
</script>

<style lang='scss' scoped>

</style>