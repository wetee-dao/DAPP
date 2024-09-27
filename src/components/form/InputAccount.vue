<template>
  <el-input :disabled="props.disabled" placeholder="type: ss58 address" :model-value="inputValue" @input="onInput">
    <template #prepend>{{ props.arg.name || props.arg.label }}</template>
  </el-input>
  <div v-if="errmsg" class="arg-form-item__error">{{ errmsg }}</div>
</template>

<script setup lang="ts">
import { ss58toHex } from '@/utils/chain';
import { ref, watch } from 'vue';

const props = defineProps(["arg","value","disabled"])
const emit = defineEmits(['input'])
const inputValue = ref<any>(props.value)
const errmsg = ref('')

const onInput = (value: any) => {
  inputValue.value = value
  const { isValid, message } = validate(value);
  if (!isValid) {
    errmsg.value = message;
    emit('input', undefined)
    inputValue.value = ""
    return;
  }
  errmsg.value = '';
  emit('input', value)
}

const validate = (value: string) => {
  try{
    ss58toHex(value)
    return {
      isValid: true,
      message: '',
    };
  }catch(e){
  }
  return {
      isValid: false,
      message: "invalid ss58 address"
    }
}
</script>