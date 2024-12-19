<template>
<svg class="logo-icon"viewBox="0 0 358 351" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="logo-g" transform="translate(-89.000000, -92.000000)" fill="#50FA82" fill-rule="nonzero">
            <g id="编组" transform="translate(89.000000, 92.000000)">
                <polygon id="路径-2" points="267.928287 205.179283 294.820717 232.071713 265.936255 259.960159 239.043825 236.055777"></polygon>
                <polygon id="三角形" points="3.0582277e-16 181.2749 183.266932 350.59761 0 350.59761"></polygon>
                <polygon id="路径" points="0 0 8.37384197e-15 128.486056 238.047809 350.59761 357.569721 350.59761 357.569721 170.318725 265.936255 259.960159 241.035857 235.059761 357.569721 115.537849 357.569721 2.98804781 179.282869 175.298805"></polygon>
            </g>
        </g>
    </g>
</svg>
</template>

<script setup lang="ts">
// import { ref } from 'vue';

// const props = defineProps(["showName","radius"])
// const showName = ref(props.showName)
// const radius = ref(props.radius)
</script>

<style lang='scss' scoped>
.logo-icon {
    display: inline-block;
    height: 100%;
    position: relative;
    
    path {
        fill: $primary-text;
    }

    polygon {
        fill: $primary-text;
    }
}
</style>