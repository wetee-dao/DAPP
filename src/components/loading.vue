<template>
    <div class="loading-box" >
        <div class="loader-logo"></div>
        <div class="text">{{ title }}</div>
    </div>
</template>

<script setup lang="ts">
import { defineProps,ref } from "vue";
const props = defineProps(["params"])
const title = ref(props.params.title || "Connecting to chain...");
</script>

<style lang='scss'>
.loading-box{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgb(29 36 34 / 94%);
    z-index: 200;
    .loader-logo{
        position: relative;
        margin: 35vh auto auto auto;
        top: 0;
        left: 0;
    }
    .text{
        width: 100%;
        text-align: center;
        margin-top: 25px;
        color: rgba($primary-text-rgb, 0.6) ;
        font-size: 16px;
        font-weight: 600;
    }
}
</style>