<template>
  <div>
    <el-input placeholder="input string or hex" :model-value="inputValue" @input="onInput">
      <template #prepend>{{ props.arg.name || props.arg.label }}</template>
    </el-input>
    <div v-if="errmsg" class="arg-form-item__error">{{ errmsg }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps(["arg", "value"])
const emit = defineEmits(['input'])
const inputValue = ref<any>(props.value)
const errmsg = ref('')

const onInput = (value: any) => {
  inputValue.value = value
  const { isValid, message } = validate(value);
  if (!isValid) {
    errmsg.value = message;
    emit('input',"")
    return;
  }
  errmsg.value = '';
  emit('input', value)
}

const isHexRegex = /^0x[A-F0-9]+$/i;
const validate = (value: string) => {
  if (value.length > 2 && value.startsWith("0x") && !isHexRegex.test(value)) {
    return { isValid: false, message: 'Not a valid hex string' };
  }

  return {
    isValid: true,
    message: '',
  };
}
</script>