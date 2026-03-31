<template>
  <div class="tips">{{ t('notFound.setupInProgress') }}</div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'not404',
  components: {},
  setup() {
    const { t } = useI18n();
    const data = reactive({
      isLoading: false,
      token: ''
    });
    onMounted(() => { });

    return {
      t,
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
