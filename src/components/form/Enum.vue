<template>
    <el-select :placeholder="'Select ' + arg.type.displayName" :model-value="value" :disabled="props.disabled"
        @change="onInput">
        <el-option v-for="(item, i) in subs" :label="item.name" :value="i" />
        <template #prefix>
            <div class="label">
                {{ arg.name || arg.label }}
            </div>
        </template>
    </el-select>
</template>

<script setup lang="ts">
import { TypeDef } from '@polkadot/types/types';
import { ref, watch } from 'vue';

const props = defineProps(["arg", "value", "disabled"])
const emit = defineEmits(['input'])
const arg = props.arg
const subs: TypeDef[] = arg.type.sub
const value = ref<any>(props.value)
watch(() => props.value, (val) => {
    value.value = val
})
const onInput = (value: any) => {
    emit('input', value)
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
</style>