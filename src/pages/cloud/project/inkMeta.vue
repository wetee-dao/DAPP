<template>
    <div class="meta-box">
        <div class="meta-item" v-for="(item, index) in spec.constructors">
            <div class="abi constructor">
                <span>{{ item.label }}(</span>
                <span v-for="(arg, index) in item.args">
                    {{ arg.label }}: {{ arg.type.displayName[0] }}
                </span>
                <span>)</span>
            </div>
            <div class="doc">
                {{ item.length > 0 ? item.docs.join('\r\n') : "No documentation provided" }}
            </div>
        </div>

        <div class="meta-item" v-for="(item, index) in spec.messages">
            <div class="abi">
                <span>{{ item.label }}(</span>
                <span v-for="(arg, index) in item.args">
                    {{ arg.label }}: {{ arg.type.displayName[0] }}
                </span>
                <span>)</span>&nbsp;&nbsp;
                <el-icon class="database" v-if="item.mutates">
                    <Coin />
                </el-icon>
            </div>
            <div class="doc">
                {{ item.length > 0 ? item.docs.join('\r\n') : "No documentation provided" }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Coin } from '@element-plus/icons-vue'

const props = defineProps(["inkInfo"])
const spec = ref<any>(props.inkInfo.Abi.spec)
</script>

<style lang='scss'>
.meta-box {
    padding-bottom: 20px;

    .meta-item {
        background-color: rgba($secondary-text-rgb, 0.03);
        margin: 20px 45px 0px 45px;
        border-radius: 4px;
    }

    .abi {
        padding: 10px;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .constructor,
    .database {
        color: rgba($primary-text-rgb, 0.8);
    }

    .doc {
        font-size: 14px;
        padding: 10px;
        color: rgba($secondary-text-rgb, 0.4);
        line-height: 20px;
        border-top: 2px solid rgba($secondary-text-rgb, 0.05);
    }
}
</style>