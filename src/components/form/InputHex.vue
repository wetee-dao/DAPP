<template>
  <el-input placeholder="input string or hex" :model-value="inputValue" @input="onInput">
    <template #prepend>{{ props.arg.name || props.arg.label }}</template>
  </el-input>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps(["arg", "value"])
const emit = defineEmits(['input'])
const inputValue = ref<any>(props.value)

const onInput = (value: any) => {
  inputValue.value = value
  const { isValid, message } = validate(value);
  if (!isValid) {
    return;
  }
  emit('input', value)
}

const isHexRegex = /^0x[A-F0-9]+$/i;
const validate = (value: string) => {
  if (!isHexRegex.test(value)) {
    return { isValid: false, message: 'Not a valid hex string' };
  }

  return {
    isValid: true,
    message: '',
  };
}
</script>