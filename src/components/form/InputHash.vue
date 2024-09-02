<template>
  <el-input placeholder="input string or hex" :model-value="inputValue" @input="onInput">
    <template #prepend>{{ props.arg.name || props.arg.label }}</template>
  </el-input>
</template>

<script setup lang="ts">
import { inject, ref, watch } from 'vue';
const wetee: any = inject('wetee')

const props = defineProps(["arg", "value"])
const emit = defineEmits(['input'])
const inputValue = ref<any>(props.value)
const api = wetee().client;

const onInput = (value: any) => {
  inputValue.value = value
  const { isValid, message } = validate(value);
  if (!isValid) {
    return;
  }
  const v = api.registry.createType('H256', value);
  emit('input', v)
}

const isHexRegex = /^0x[A-F0-9]+$/i;
const validate = (value: string) => {
  if (value.length < 64) {
    return { isValid: false, message: 'Input too short! Expecting 64 characters.' };
  }
  if (value.length > 64) {
    return { isValid: false, message: 'Input too long! Expecting 64 characters.' };
  }
  if (!isHexRegex.test(value)) {
    return { isValid: false, message: 'Not a valid hex string' };
  }

  return {
    isValid: true,
    message: '',
  };
}
</script>