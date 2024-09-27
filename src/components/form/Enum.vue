<template>
    <div class="enum">
        <el-select class="select" :placeholder="'Select ' + arg.type.displayName" :model-value="value" :disabled="props.disabled"
            @change="onInput">
            <el-option v-for="(item, i) in subs" :label="item.name" :value="i" />
            <template #prefix>
                <div class="label">
                    {{ arg.name || arg.label }}
                </div>
            </template>
        </el-select>
        <component class="input" v-if="cname != null" :is="cname" :arg="farg" :value="fvalue" @input="onFInput" />
    </div>
</template>

<script setup lang="ts">
import { TypeDef } from '@polkadot/types/types';
import { inject, ref, shallowRef, watch } from 'vue';
import { renderSubComponent } from './utils';
import { getInitValue } from '@/utils/initValue';

const wetee: any = inject('wetee')
const api = wetee().client;
const props = defineProps(["arg", "value", "disabled"])
const emit = defineEmits(['input'])
const arg = props.arg

const subs: TypeDef[] = arg.type.sub
const value = ref<any>(props.value)

const cname = shallowRef<any>(null)
const farg = ref<any>(null)
const fvalue = ref<any>(null)

const onInput = (index: any) => {
    value.value = index
    if (subs[index].type=="Null"){
        cname.value = null
        farg.value = null
        
        emit('input', {[subs[index].name as string]: null})
    }else{
        farg.value = {
            name: "status",
            type: subs[index],
        }
        let v = getInitValue(api, [], subs[index] as TypeDef)
        emit('input', {[subs[index].name as string]: v})
        
        fvalue.value = v
        // @ts-ignore
        cname.value = renderSubComponent(subs[index])
    }
}

const onFInput = (v: any) => {
    emit('input', {[subs[value.value].name as string]: v})
}
</script>

<style lang="scss" scoped>
.label {
    text-align: left;
    border-right: 3px solid rgba($color: $secondary-text-rgb, $alpha: 0.2);
    margin: -18px 0 -18px 0px;
    padding-left: 8px;
    padding-right: 19px;
    height: 42px;
    line-height: 42px;
}

.enum{
    display: flex;
    .input{
        margin-left: 10px;
        flex: 1;
    }
    .select{
        flex: 1;
    }
}


</style>