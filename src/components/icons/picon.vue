<template>
<div class="picon">
    <Cloud v-if="icon === 'cloud'" class="logo-icon"/>
    <Miner v-if="icon === 'miner'" class="logo-icon" />
    <Builder v-if="icon === 'builder'" class="logo-icon" />
    <MPC v-if="icon === 'mpc'" class="logo-icon" />
    <Bridge v-if="icon === 'bridge'" class="logo-icon" />
    <Store v-if="icon === 'disk'" class="logo-icon" />
    <Secret v-if="icon === 'secret'" class="logo-icon" />
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Cloud from "./cloud.vue";
import Miner from "./miner.vue";
import Builder from "./builder.vue";
import MPC from "./MPC.vue";
import Bridge from './bridge.vue';
import Store from './store.vue';
import Secret from './secret.vue';

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
    height: 100%;
}
</style>