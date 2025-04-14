<template>
    <ul class="pop">
        <li v-for="(item, index) in list" class="flex" @click="select(index)" :key="index">
            <i v-if="curr.url == item.url" class="icon active">&#xe692;</i>{{ item.name }}
            <div class="space"></div>
            <div class="ping">{{ping[index]}} ms</div>
        </li>
    </ul>
</template>

<script lang="ts" setup>
import { chainUrls } from '@/plugins/chain';
import { ref, watch } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const list: any[] = chainUrls()
const curr = ref(store.state.chainUrl)
const ping = ref(store.state.setPins)
watch(() => store.state.setPins, (newVal, _) => {
    ping.value = newVal
})

const select = (index: number) => {
    store.dispatch("setChainUrl", list[index])
    window.location.reload()
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
        padding: 15px 30px 15px 30px;
        border-bottom: 1px solid rgba($secondary-text-rgb, 0.15);
        position: relative;

        &:hover {
            background-color: rgba($secondary-text-rgb, 0.05);
        }

        .active {
            font-size: 10px;
            color: $primary-text;
            transform: rotate(90deg);
            position: absolute;
            left: 13px
        }
    }

    li:last-child {
        border-bottom: none;
    }

    .ping {
        color: rgba($primary-text-rgb, 0.8);
    }
}
</style>