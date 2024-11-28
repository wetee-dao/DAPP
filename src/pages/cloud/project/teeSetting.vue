<template>
    <Service/>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Service from "./teeUpdate/service.vue"

// import useGlobelProperties from "@/plugins/globel";
import { getHttpApi } from '@/plugins/chain';
const props = defineProps(["info"])

const info = ref<any>(props.info)
const accountData = ref<any>({})

onMounted(() => {
    getHttpApi().query("system","account",[info.value.ContractId]).then((res: any) => {
        accountData.value = res.data
    })
})
</script>

<style lang='scss' scoped>
.setting-box {
    
}
</style>