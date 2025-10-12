<template>
  <div class="service" @click="closeClick">
    <div @click="(e: any) => e.stopPropagation()">
      <div class="title">
        <!-- <i class="icon">&#xe675;</i> -->
        Create Secret Disk
        <div class="space"></div>
        <div class="close-btn" @click="closeClick">
          <i class="icon right">&#xe604;</i>
        </div>
      </div>
      <el-form :model="form" class="form simple-form">
        <div class="form-context-box">
          <div class="form-sub-title">Disk Key Name</div>
          <div class="form-input-box">
            <el-input v-model="form.key" placeholder="Name"></el-input>
          </div>
        </div>
        <div class="form-context-box">
          <div class="form-sub-title">Size （GB）</div>
          <div class="form-input-box">
            <el-slider v-model="form.size" :step="1" :max="1024" show-input />
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
import { reactive, ref } from "vue";
import { ElNotification } from "element-plus";
import { $getTxProvider, $getQueryApi } from "@/plugins/chain";
import { initDisk } from "@/apis/secret";

const props = defineProps(["router", "store", "close", "app"])

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
        message: "Please input name",
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
          title: 'Error',
          message: "Create disk failed",
          type: 'error',
        })
        throw "Create disk failed";
      }

      id = dry.dry.Ok
      const tx = await chain.buildCall(dry)
      await chain.signAndSend(tx, signer, () => {
        props.close();
      }, () => { })
    })

    if (!id) {
      return
    }

    const resp =await initDisk(id, signer)
    console.log(resp)
    ElNotification({
      title: 'Success',
      message: "Secret disk created",
      type: 'success',
    })
  })
};

</script>

<style lang="scss" scoped>
@use "../../assets/styles/components/pop.scss";
</style>