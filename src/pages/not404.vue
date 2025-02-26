<template>
  <div class="tips">Service setup is in progress, please be patient...</div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs } from 'vue';

export default defineComponent({
  name: 'not404',
  components: {},
  setup() {
    const data = reactive({
      isLoading: false,
      token: ''
    });
    onMounted(() => { });

    return {
      ...toRefs(data)
    };
  }
});
</script>

<style scoped>
.tips {
  margin-top: 20%;
  text-align: center;
  font-size: 30px;
}
</style>
