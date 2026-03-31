<template>
  <div class="service" @click="closeClick">
    <div @click="(e: any) => e.stopPropagation()">
      <div class="title">
        <!-- <i class="icon">&#xe675;</i> -->
        {{ t('secret.createTitle') }}
        <div class="space"></div>
        <div class="close-btn" @click="closeClick">
          <i class="icon right">&#xe604;</i>
        </div>
      </div>
      <el-form :model="form" class="form simple-form">
        <div class="form-context-box">
          <div class="form-sub-title">{{ t('secret.keyName') }}</div>
          <div class="form-input-box">
            <el-input v-model="form.key" :placeholder="t('secret.inputName')"></el-input>
          </div>
        </div>
        <div class="form-context-box">
          <div class="form-sub-title">{{ t('secret.secretData') }}</div>
          <div class="form-input-box">
            <el-input type="textarea" v-model="form.value" :rows="6" :placeholder="t('secret.inputSecretData')"></el-input>
          </div>
        </div>
        <div class="form-context-box">
          <el-button size="large" type="primary" @click="toAdd">{{ t('secret.submitToChain') }}</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import { ElNotification } from "element-plus";
import { useI18n } from "vue-i18n";
import { $getTxProvider } from "@/plugins/chain";
import { SecretRSA, uploadSecret } from "@/apis/secret";
import JSEncrypt from "jsencrypt";
import { blake2bHash } from "@/utils/hash";

const props = defineProps(["router", "store", "close", "app"])
const { t } = useI18n();

const form = reactive({
  key: '',
  value: "",
})

const closeClick = () => {
  props.close();
};

const toAdd = async () => {
  await $getTxProvider(async (chain): Promise<void> => {
    if (!form.key) {
      ElNotification({
        title: t('common.error'),
        message: t('secret.pleaseInputName'),
        type: 'error',
      })
      return;
    }

    if (!form.value) {
      ElNotification({
        title: t('common.error'),
        message: t('secret.pleaseInputDescription'),
        type: 'error',
      })
      return;
    }

    const client = chain.client;
    if (!client) {
      ElNotification({
        title: t('common.error'),
        message: t('secret.pleaseConnectChain'),
        type: 'error',
      })
      return;
    }

    const signer = props.store.state.userInfo.addr;
    const rsa = await SecretRSA()
    const crypt = new JSEncrypt();
    crypt.setPublicKey(rsa.secret_rsa);
    const encrypted = crypt.encrypt(form.value);
    if (!encrypted) {
      ElNotification({
        title: t('common.error'),
        message: t('secret.encryptFailed'),
        type: 'error',
      })
      return;
    }

    let id = ""
    const hash = blake2bHash(form.value, 32)
    await $getTxProvider(async (chain, builder): Promise<void> => {
      const dry = await builder.createSecret(form.key, "0x" + hash)
      const tx = await chain.buildCall(dry, signer)
      await chain.signAndSend(tx, signer, () => {
        props.close();
      }, () => { })

      ElNotification({
        title: t('common.success'),
        message: t('secret.uploadSuccess'),
        type: 'success',
      })

      id = dry.dry.Ok
    })

    const resp = await uploadSecret(id, encrypted, "0x" + hash, signer)
    // console.log(resp)
  })
};

</script>

<style lang="scss" scoped>
@use "../../../assets/styles/components/pop.scss";
</style>