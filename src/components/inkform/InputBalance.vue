<template>
  <el-input :disabled="props.disabled" placeholder="type: balance" :model-value="inputValue" @input="onInput">
    <template #prepend>{{ props.arg.name || props.arg.label }}</template>
  </el-input>
  <div v-if="errmsg" class="arg-form-item__error">{{ errmsg }}</div>
</template>

<script setup lang="ts">
import { fromBalance, fromSats, toBalance } from '@/utils/bn';
import { ApiPromise } from '@polkadot/api';
import { BN, BN_ZERO } from '@polkadot/util';
import { ref, watch, inject } from 'vue';
const wetee: any = inject('wetee')

const props = defineProps(["arg","value","disabled"])
const emit = defineEmits(['input'])
const errmsg = ref('')
const inputValue = ref<any>(props.value)
const api = wetee().client;
export type OrFalsy<T> = T | null | undefined;

const onInput = (value: any) => {
  const val = value;
  const isValid = isNumber(val);
  if (!isValid) {
    errmsg.value = "Invalid input";
    value.value = '';
    emit('input',undefined)
    return;
  }
  
  if (val.length < 26) {
    const bn = toBalance(api, val);
    emit('input', bn)
    inputValue.value = getStringValue(api, bn);
  }else{
    inputValue.value = val
  }
}

function isNumber(value:string) {
  return /^[1-9]\d*$/.test(value);
}

function getStringValue(api: ApiPromise, value: OrFalsy<BN>) {
  if (!value) {
    return '';
  }

  return fromBalance(fromSats(api, value || BN_ZERO));
}

</script>