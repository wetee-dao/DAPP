<template>
  <div class="service" @click="closeClick">
    <div @click="(e: any) => e.stopPropagation()">
      <div class="title">
        <!-- <i class="icon">&#xe675;</i> -->
        Create Secret data
        <div class="space"></div>
        <div class="close-btn" @click="closeClick">
          <i class="icon right">&#xe604;</i>
        </div>
      </div>
      <el-form :model="form" class="form simple-form">
        <div class="form-context-box">
          <div class="form-sub-title">Secret Key Name</div>
          <div class="form-input-box">
            <el-input v-model="form.key" placeholder="Name"></el-input>
          </div>
        </div>
        <div class="form-context-box">
          <div class="form-sub-title">Secret Data</div>
          <div class="form-input-box">
            <el-input type="textarea" v-model="form.value" :rows="6" placeholder="Input secret data"></el-input>
          </div>
        </div>
        <div class="form-context-box">
          <el-button size="large" type="primary" @click="toAdd">Submit to chain</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import { ElNotification } from "element-plus";
import { $getTxProvider } from "@/plugins/chain";
import { SecretRSA, uploadSecret } from "@/apis/secret";
import JSEncrypt from "jsencrypt";
import { blake2bHash } from "@/utils/hash";

const props = defineProps(["router", "store", "close", "app"])

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
        title: 'Error',
        message: "Please input name",
        type: 'error',
      })
      return;
    }

    if (!form.value) {
      ElNotification({
        title: 'Error',
        message: "Please input description",
        type: 'error',
      })
      return;
    }

    const client = chain.client;
    if (!client) {
      ElNotification({
        title: 'Error',
        message: "Please connect to the chain",
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
        title: 'Error',
        message: "Encrypt failed",
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
        title: 'Success',
        message: "Upload secret success",
        type: 'success',
      })

      id = dry.dry.Ok
    })

    await uploadSecret(id, encrypted, "0x" + hash, signer)
  })
};

</script>

<style lang="scss" scoped>
@use "../../assets/styles/components/pop.scss";
</style>