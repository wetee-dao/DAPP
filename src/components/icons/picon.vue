<template>
<div class="picon">
    <Cloud v-if="icon === 'cloud'" class="logo-icon"/>
    <Miner v-if="icon === 'miner'" class="logo-icon" />
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Cloud from "./cloud.vue";
import Miner from "./miner.vue";
const props = defineProps(["icon"])
const icon = ref(props.icon);
</script>

<style lang='scss' scoped>
.picon{
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    height: 100%;
}

.logo-icon {
    width: 100%;
}
</style>