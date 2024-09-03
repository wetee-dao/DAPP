<template>
  <div>
    <el-input :placeholder="'input '+props.arg.type.type" 
      :model-value="value"
      @input="onInput"
    >
      <template #prepend>{{ props.arg.name||props.arg.label }}</template>
    </el-input>
    <div v-if="errmsg" class="arg-form-item__error">{{ errmsg }}</div>
  </div>
</template>

<script setup lang="ts">
import { BN } from '@polkadot/util';
import { ref, watch } from 'vue';

const props = defineProps(["arg","value"])
const emit = defineEmits(['input'])
const value = ref<any>(props.value)
const errmsg = ref('')

function isNumber(value:string) {
  return /^[1-9]\d*$/.test(value);
}

const onInput = (val:any) => {
  const isValid = isNumber(val);
  if (!isValid) {
    errmsg.value = "Invalid input";
    value.value = '';
    emit('input',undefined)
    return;
  }
  errmsg.value = '';
  value.value = val

  emit('input',new BN(val))
}
</script>