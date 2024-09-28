<template>
  <component v-if="cname != null" :is="cname" :arg="props.arg" :value="value" @input="emit('input', $event)" />
</template>

<script setup lang="ts">
import { TypeDef } from '@polkadot/types/types';
import { AbiMessageParam } from '@polkadot/api-contract/types';
import { onMounted, ref, shallowRef, watch } from 'vue';
import { renderSubComponent } from './utils';

const props = defineProps(["arg", "value"])
const emit = defineEmits(['input'])

const arg: AbiMessageParam = props.arg
const type: TypeDef = arg.type
const cname = shallowRef<any>(null)
const value = ref<any>(props.value)

watch(() => props.value, (val) => {
  value.value = val
})

onMounted(() => {
  cname.value = renderSubComponent(type)
})
</script>
