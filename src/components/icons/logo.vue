<template>
    <!-- <svg class="logo-icon"viewBox="0 0 358 351" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="logo-g" transform="translate(-89.000000, -92.000000)" fill="#50FA82" fill-rule="nonzero">
            <g id="编组" transform="translate(89.000000, 92.000000)">
                <polygon id="三角形" points="3.0582277e-16 181.2749 183.266932 350.59761 0 350.59761"></polygon>
                <polygon id="路径" points="0 0 8.37384197e-15 128.486056 238.047809 350.59761 357.569721 350.59761 357.569721 170.318725 265.936255 259.960159 241.035857 235.059761 357.569721 115.537849 357.569721 2.98804781 179.282869 175.298805"></polygon>
            </g>
        </g>
    </g>
</svg> -->
    <svg :class="'logo-icon ' + (props.fill ? 'fill' : '')" viewBox="0 0 836 299" version="1.1"
        xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="logo-w" transform="translate(-21.000000, -26.000000)" fill-rule="nonzero" stroke-width="10">
                <g id="TTE" transform="translate(26.906087, 31.900000)">
                    <polygon id="路径"
                        points="0 31.9 0 0 239.111304 0 220.526087 31.9 135.366957 31.9 135.366957 287.1 103.466957 287.1 103.466957 31.9">
                    </polygon>
                    <polygon id="路径"
                        points="292.370435 31.9 292.370435 0 531.481739 0 512.896522 31.9 427.737391 31.9 427.737391 287.1 395.837391 287.1 395.837391 31.9">
                    </polygon>
                    <path
                        d="M583.908696,0 L824.129565,0 L824.129565,31.9 L615.808696,31.9 L615.808696,255.2 L824.129565,255.2 L824.129565,287.1 L583.908696,287.1 L583.908696,0 Z M627.45913,127.6 L823.852174,127.6 L823.852174,159.5 L646.044348,159.5 L627.45913,127.6 Z"
                        id="形状"></path>
                </g>
            </g>
        </g>
    </svg>
</template>

<script setup lang="ts">
const props = defineProps(["fill"])
// const showName = ref(props.showName)
// const radius = ref(props.radius)
</script>

<style lang='scss' scoped>
.logo-icon {
    display: inline-block;
    height: 100%;
    position: relative;

    path {
        // fill: rgba($secondary-text-rgb, 0.8);
        // fill: $primary-text;
        stroke: $primary-text;
    }

    polygon {
        // fill: rgba($secondary-text-rgb, 0.8);
        // fill: $primary-text;
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