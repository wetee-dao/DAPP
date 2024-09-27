<template>
  <div>
    <el-input :disabled="props.disabled" :placeholder="'type: '+props.arg.type.type" 
      :model-value="value"
      @input="onInput"
    >
      <template #prepend>{{ props.arg.name||props.arg.label }}</template>
    </el-input>
    <div v-if="errmsg" class="arg-form-item__error">{{ errmsg }}</div>
  </div>
</template>

<script setup lang="ts">
import { BN, nToU8a } from '@polkadot/util';
import { ref, watch } from 'vue';

const props = defineProps(["arg","value","disabled"])
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

  let n = new BN(val)
  console.log(props.arg.type.type)
  if (props.arg.type.type.includes('u32')) {
    if (n.gtn(4294967295)) {
      errmsg.value = "Invalid u32 input";
      value.value = '';
      emit('input',undefined)
      return;
    }
  }
  
  if (props.arg.type.type.includes('u8')) {
    if (n.gtn(255)) {
      errmsg.value = "Invalid u8 input";
      value.value = ""
      emit('input',undefined)
      return;
    }
  }
  
  if (props.arg.type.type.includes('u16')) {
    if (n.gtn(65535)) {
      errmsg.value = "Invalid input";
      value.value = '';
      emit('input',undefined)
      return;
    }
  }
  
  errmsg.value = '';
  value.value = val

  emit('input',new BN(val))
}
</script>