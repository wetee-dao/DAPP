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
            style="--el-switch-on-color: #233e2f;"
            active-text=" enable "
            inactive-text="disable"
        />
    </div>
</template>

<script setup lang="ts">
import { AbiMessageParam } from '@polkadot/api-contract/types';
import { inject, onMounted, ref, shallowRef, watch } from 'vue';
import { renderSubComponent } from './utils';
import { getInitValue } from '@/utils/initValue';
import { TypeDef } from '@polkadot/types/types';

const props = defineProps(["arg", "value"])
const emit = defineEmits(['input'])
const wetee: any = inject('wetee')
const api = wetee().client;

const arg: AbiMessageParam = props.arg
const cname = shallowRef<any>(null)
const value = ref<any>(props.value)
const bool = ref(false)

watch(() => bool.value, (val) => {
    if (!val) {
        cname.value = null
        emit('input', null)
    }else{
        // @ts-ignore
        cname.value = renderSubComponent(arg.type.sub!)
        let v = getInitValue(api, [], arg.type.sub! as TypeDef)
        value.value = v
        emit('input', v)
    }
})

watch(() => props.value, (val) => {
    value.value = val
})

onMounted(() => {
    emit('input', null)
})

const onInput = (val: any) => {
    emit('input', val)
}
</script>
<style lang="scss" scoped>
.option {
    display: flex;
    align-items: start;
    .input{
        flex: 1;
        // margin-right: 10px;
    }
    .switch{
        margin-left: -4px;
        margin-top: 3px;
        :deep(.el-switch__core){
            height: 46px;
            border-top-right-radius: 6px;
            border-bottom-right-radius: 6px;
            border-top-left-radius: 2px;
            border-bottom-left-radius: 2px;
            .el-switch__action{
                height: 25px;
                background-color: transparent;
                &::before{
                    content: " ";
                    background-color: var(--el-color-white);
                    height: 100%;
                    width: 70%;
                    border-radius: 5px;
                }
            }
        }
    }
}
</style>
