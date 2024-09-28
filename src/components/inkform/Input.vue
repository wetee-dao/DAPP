<template>
  <el-input placeholder="type not supported"
    disabled
    :model-value="value"
    @input="onInput"
  >
    <template #prepend>{{ props.arg.name||props.arg.label }}</template>
  </el-input>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps(["arg","value"])
const emit = defineEmits(['input'])
const value = ref<any>(props.value)
watch(() => props.value, (val) => {
  value.value = val
})
const onInput = (value:any) => {
  emit('input',value)
}
</script>