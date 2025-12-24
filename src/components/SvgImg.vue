<template>
    <svg :class="svgClass" ref="svg" aria-hidden="true" :style="'fill:'+color">
        <use class="svg-use" :href="symbolId"  />
        <title v-if="iconTitle">{{ iconTitle }}</title>
    </svg>
</template>

<script setup lang="ts">
import {  computed, onMounted, ref, type VNodeRef } from 'vue'

const props = defineProps({
    prefix: {
        type: String,
        default: 'icon'
    },
    name: {
        type: String,
        required: true
    },
    className: {
        type: String,
        default: ''
    },
    iconTitle: {
        type: String,
        default: '',
    },
})

const svg = ref<VNodeRef | undefined>(undefined)
const symbolId = computed(() => `#${props.name}`)
const svgClass = computed(() => {
    if (props.className) {
        return `svg-icon ${props.className}`
    }
    return 'svg-icon'
})
const color = ref("")

onMounted(()=>{
    const style = window.getComputedStyle(svg.value)
    color.value = style.color
})
</script>
<style scope>
.svg-icon {
    vertical-align: -0.1em;
    fill: currentColor;
    overflow: hidden;
}
</style>
