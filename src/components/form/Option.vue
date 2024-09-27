<template>
    <div class="option">
        <component class="input" v-if="cname != null" :is="cname" :arg="props.arg" :value="value" @input="onInput" />
        <el-input class="input" v-if="!cname" :placeholder="'type: '+props.arg.type.type" 
            disabled
        >
            <template #prepend>{{ props.arg.name||props.arg.label }}</template>
        </el-input>
        <el-switch
            class="switch"
            v-model="bool"
            size="large"
            inline-prompt
            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
            active-text="enable "
            inactive-text="disable"
        />
    </div>
</template>

<script setup lang="ts">
import { AbiMessageParam } from '@polkadot/api-contract/types';
import { onMounted, ref, shallowRef, watch } from 'vue';
import { renderSubComponent } from './utils';

const props = defineProps(["arg", "value"])
const emit = defineEmits(['input'])

const arg: AbiMessageParam = props.arg
const cname = shallowRef<any>(null)
const value = ref<any>(props.value)
const bool = ref(true)

watch(() => bool.value, (val) => {
    if (!val) {
        cname.value = null
        emit('input', null)
    }else{
        // @ts-ignore
        cname.value = renderSubComponent(arg.type.sub!)
        emit('input', value.value)
    }
})

watch(() => props.value, (val) => {
    value.value = val
})

onMounted(() => {
    // @ts-ignore
    cname.value = renderSubComponent(arg.type.sub!)
})

const onInput = (val: any) => {
    emit('input', val)
}
</script>
<style lang="scss" scoped>
.option {
    display: flex;
    align-items: baseline;
    .input{
        flex: 1;
        margin-right: 10px;
    }
    .switch{
        opacity: 0.6;
        height: 40px;
        :deep(.el-switch__core){
            height: 45px;
            border-radius: 8px;
            .el-switch__action{
                border-radius: 8px;
                height: 40px;
            }
        }
    }
}
</style>
