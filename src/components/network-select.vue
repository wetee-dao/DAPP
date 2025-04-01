<template>
    <ul class="pop">
        <li v-for="(item, index) in list" :class="'flex '+(curr.url==item.url?'active':'')" @click="select(item)" :key="index">
            {{ item.name }}
            <div class="space"></div>
            <div class="ping">Ping</div>
        </li>
    </ul>
</template>

<script lang="ts" setup>
import { chainUrls } from '@/plugins/chain';
import { ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const list: any[] = chainUrls()
const curr = ref(store.state.chainUrl)
const ping = ref({})


const select = (item: any) => {
    // ping.value = item
    // localStorage.setItem('network', JSON.stringify(item))
    // window.location.reload()
}
</script>

<style lang="scss" scoped>
.pop {
    width: 100%;
    background-color: rgba($primary-bg-rgb, 1);
    cursor: pointer;
    font-size: 14px;
    border: 1px solid rgba($secondary-text-rgb, 0.15);

    li {
        padding: 15px 20px 15px 27px;
        border-bottom: 1px solid rgba($secondary-text-rgb, 0.15);

        &:hover{
            background-color: rgba($secondary-text-rgb, 0.02);
        }

        &.active{
            position: relative;
            &::before{
                content: ' ';
                position: absolute;
                left: 12px;
                top: calc(50% - 3px);
                width: 6px;
                height: 6px;
                background-color: $primary-text;
                z-index: 10000;
            }
        }
    }
    
    li:last-child {
        border-bottom: none;
    }

    .ping {
        
    }
}
</style>