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
const props = defineProps(["title"])
const title = ref(props.title || "Loading");
</script>

<style lang='scss'>
.loading-box{
    width: 100%;
    height: 100%;
    .loader{
        margin: 35vh auto auto auto;
        display: flex;
        justify-content: center;
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