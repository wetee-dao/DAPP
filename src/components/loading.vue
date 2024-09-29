<template>
    <div class="loading-box" >
        <div class="loader">
            <div class="loader-logo"></div>
            <div class="text">{{ title }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps,ref } from "vue";
const props = defineProps(["params"])
const title = ref(props.params.title || "Send transaction to chain");
</script>

<style lang='scss' scoped>
.loading-box{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgb(29 36 34 / 94%);
    z-index: 200;
    .loader{
        margin: 35vh auto auto auto;
        display: flex;
        justify-content: center;
        font-family: "letter-font",Serif;
        .loader-logo{
            position: relative;
            top: 0;
            left: 0;
        }
        .text{
            text-align: center;
            color: rgba($primary-text-rgb, 0.6) ;
            font-size: 22px;
            font-weight: 600;
            margin-left: 20px;
            line-height: 56px;
        }
    }
}
</style>