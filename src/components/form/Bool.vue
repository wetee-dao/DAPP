<template>
  <el-select 
    :placeholder="'Select '+props.arg.type.type"
    :model-value="value"
    @change="onInput"
  >
    <el-option label="True" :value="true"/>
    <el-option label="Fasle" :value="false"/>
    <template #prefix>
      <div class="label">
        {{ props.arg.name||props.arg.label }}
      </div>
    </template>
  </el-select>
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

<style lang="scss">
.label{
  // background-color: red;
  width: 53px;
  text-align: center;
  border-right: 3px solid rgba($color: $secondary-text-rgb, $alpha: 0.2);
  margin: -18px 0 -18px -18px;
  height: 42px;
  line-height: 42px;
}
</style>