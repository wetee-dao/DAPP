<template>
    <div class="loading-box">
        <div class="loader"></div>
    </div>
</template>

<script setup lang="ts">
</script>

<style lang='scss' scoped>
.loading-box {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .loader {
        width: fit-content;
        font-family: "letter-font",Serif;
        font-size: 20px;
        background: linear-gradient(90deg, rgba($secondary-text-rgb, 0.05) 50%, #0000 0) right/200% 100%;
        animation: l21 2s infinite linear;
        height: 45px;
        line-height: 45px;
    }

    .loader::before {
        content: "Loading...";
        color: $primary-text;
        padding: 0 5px;
        -webkit-background-clip: text;
        background-clip: text;
    }

    @keyframes l21 {
        100% {
            background-position: left
        }
    }
}
</style>