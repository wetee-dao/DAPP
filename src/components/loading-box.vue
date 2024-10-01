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
        letter-spacing: 5px;
        background: linear-gradient(90deg, rgba($secondary-text-rgb, 0.04) 50%, #0000 0) right/200% 100%;
        animation: l21 2s infinite linear;
        height: 50px;
        line-height: 50px;
        padding: 0 5px;
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