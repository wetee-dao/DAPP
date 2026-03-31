<template>
  <div class="service" @click="closeClick">
    <div @click="(e: any) => e.stopPropagation()">
      <div class="title">
        <!-- <i class="icon">&#xe675;</i> -->
        {{ t('pop.createSecretDisk') }}
        <div class="space"></div>
        <div class="close-btn" @click="closeClick">
          <i class="icon right">&#xe604;</i>
        </div>
      </div>
      <el-form :model="form" class="form simple-form">
        <div class="form-context-box">
          <div class="form-sub-title">{{ t('pop.diskKeyName') }}</div>
          <div class="form-input-box">
            <el-input v-model="form.key" :placeholder="t('secret.inputName')"></el-input>
          </div>
        </div>
        <div class="form-context-box">
          <div class="form-sub-title">{{ t('pop.sizeGb') }}</div>
          <div class="form-input-box">
            <el-slider v-model="form.size" :step="1" :max="1024" show-input />
          </div>
        </div>
        <div class="form-context-box">
          <el-button size="large" type="primary" @click="toAdd">{{ t('pop.submitToChain') }}</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { ElNotification } from "element-plus";
import { useI18n } from "vue-i18n";
import { $getTxProvider, $getQueryApi } from "@/plugins/chain";
import { initDisk } from "@/apis/secret";

const props = defineProps(["router", "store", "close", "app"])
const { t } = useI18n();

const form = reactive({
  key: '',
  size: 10
})

const closeClick = () => {
  props.close();
};

const toAdd = async () => {
  await $getTxProvider(async (chain): Promise<void> => {
    if (!form.key) {
      ElNotification({
        title: 'Error',
        message: t('secret.pleaseInputName'),
        type: 'error',
      })
      return;
    }

    let id = ""
    const signer = props.store.state.userInfo.addr;
    await $getTxProvider(async (chain, builder): Promise<void> => {
      const dry = await builder.createDisk(form.key, form.size)
      console.log(dry)
      if (!dry.dry.Ok) {
        ElNotification({
          title: t('common.error'),
          message: t('pop.createDiskFailed'),
          type: 'error',
        })
        throw t('pop.createDiskFailed');
      }

      id = dry.dry.Ok
      const tx = await chain.buildCall(dry, signer)
      await chain.signAndSend(tx, signer, () => {
        props.close();
      }, () => { })
    })

    if (!id) {
      return
    }

    const resp = await initDisk(id, signer)
    console.log(resp)
    ElNotification({
      title: t('common.success'),
      message: t('pop.secretDiskCreated'),
      type: 'success',
    })
  })
};

</script>

<style lang="scss" scoped>
@use "../../../assets/styles/components/pop.scss";
</style>