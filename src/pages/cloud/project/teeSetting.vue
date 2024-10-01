<template>
    <Service/>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import Service from "./teeUpdate/service.vue"

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
.setting-box {
    
}
</style>