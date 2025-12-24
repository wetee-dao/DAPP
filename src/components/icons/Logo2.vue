<template>
    <svg :class="'logo-icon ' + (fillBorder ? 'fill' : '')" viewBox="0 0 665 502" version="1.1"
        xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="编组" transform="translate(-361.831792, 0.000000)"  fill-rule="nonzero">
            <g id="2" transform="translate(361.903962, 0.000000)">
                <g transform="translate(372.134109, 0.000000)" id="路径">
                    <polygon points="187.05846 210.255741 105.589939 210.255741 105.589939 291.730846 187.05846 291.730846"></polygon>
                    <polygon points="292.491405 106.41858 211.022885 106.41858 211.022885 187.893685 292.491405 187.893685"></polygon>
                    <polygon points="292.334411 209.444645 210.865891 209.444645 210.865891 291.312266 292.334411 291.312266"></polygon>
                    <polygon points="292.793722 0 211.325201 0 211.325201 81.475105 292.793722 81.475105"></polygon>
                    <polygon points="81.4685204 210.524895 0 210.524895 0 292 81.4685204 292"></polygon>
                    <polygon points="81.4685204 316.524895 4.54747351e-13 316.524895 4.54747351e-13 398 81.4685204 398"></polygon>
                    <polygon points="81.4685204 420.524895 4.54747351e-13 420.524895 4.54747351e-13 502 81.4685204 502"></polygon>
                    <polygon points="186.46852 419.524895 105 419.524895 105 501 186.46852 501"></polygon>
                    <polygon points="292.46852 419.524895 211 419.524895 211 501 292.46852 501"></polygon>
                    <polygon points="81.4914051 0.269153822 0.0228846627 0.269153822 0.0228846627 81.7442588 81.4914051 81.7442588"></polygon>
                    <polygon points="186.901466 0.527092902 105.432945 0.527092902 105.432945 82.0021979 186.901466 82.0021979"></polygon>
                </g>
                <g id="+" transform="translate(0.000000, 208.527093)">
                    <polygon id="路径" points="187.192569 211.728648 105.724048 211.728648 105.724048 293.203753 187.192569 293.203753"></polygon>
                    <polygon id="路径" points="186.625514 105.891488 105.156994 105.891488 105.156994 187.366592 186.625514 187.366592"></polygon>
                    <polygon id="路径" points="81.4685204 105.917552 0 105.917552 0 187.785173 81.4685204 187.785173"></polygon>
                    <polygon id="路径" points="292.927831 105.472907 211.45931 105.472907 211.45931 186.948012 292.927831 186.948012"></polygon>
                    <polygon id="路径" points="187.035575 0 105.567055 0 105.567055 81.475105 187.035575 81.475105"></polygon>
                </g>
            </g>
        </g>
    </g>
    </svg>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps(["fill"])
const fillBorder = ref(props.fill)
watch(() => props.fill, (val) => {
  fillBorder.value = val
})
</script>

<style lang='scss' scoped>
.logo-icon {
    display: inline-block;
    height: 100%;
    position: relative;

    path {
        stroke: $primary-text;
    }

    polygon {
        stroke: $primary-text;
    }

    &.fill {
        path {
            fill: $primary-text;
        }

        polygon {
            fill: $primary-text;
        }

    }
}
</style>