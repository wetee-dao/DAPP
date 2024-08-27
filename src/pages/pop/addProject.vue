<template>
  <div class="service" @click="closeClick">
    <div @click="(e: any) => e.stopPropagation()">
      <div class="title">
        <i class="icon">&#xe675;</i>Create Project
        <i class="icon right" @click="closeClick">&#xe604;</i>
      </div>
      <el-form :model="form" class="form simple-form">
        <div class="form-context-box">
          <div class="form-sub-title">Name</div>
          <div class="form-input-box">
            <el-input v-model="form.name" placeholder="Name"></el-input>
          </div>
        </div>
        <div class="form-context-box">
          <div class="form-sub-title">Description</div>
          <div class="form-input-box">
            <el-input v-model="form.desc" placeholder="Description"></el-input>
          </div>
        </div>
        <div class="form-context-box">
          <div class="form-sub-title">Prepaid Amount</div>
          <div class="form-input-box">
            <el-input v-model="form.deposit" placeholder="Confidential deposit" show-stops>
              <template #suffix>WTE</template>
            </el-input>
          </div>
        </div>
        <div class="form-context-box">
          <el-button size="large" type="primary" @click="toAdd">Add</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { ElNotification } from "element-plus";

const props = defineProps(["router", "store", "close", "app"])

const form = reactive({
  name: '',
  desc: "",
  deposit: 10,
})

const closeClick = () => {
  props.close();
};

const toAdd = async () => {
  const g = props.app!.config.globalProperties;
  const chain = g.$getChain();
  if (!chain.client) {
    return;
  }

  if (!form.name) {
    ElNotification({
      title: 'Error',
      message: "Please input name",
      type: 'error',
    })
    return;
  }

  if (!form.desc) {
    ElNotification({
      title: 'Error',
      message: "Please input description",
      type: 'error',
    })
    return;
  }

  await chain.client.query.timestamp.now();

  const client = chain.client;
  const signer = props.store.state.userInfo.addr;

  try {
    const tx = client.tx.weTEEProject.createProxyProject(form.name,form.desc,form.deposit*Math.pow(10,client.registry.chainDecimals[0]))
    await chain.SignAndSend(tx, signer, () => {
      props.close();
    }, () => {
      props.close();
    })
  } catch (e: any) {
    ElNotification({
      title: 'Error',
      message: "" + e.toString(),
      type: 'error',
    })
  }
};

</script>

<style lang="scss" scoped>

@import "../../assets/styles/components/pop.scss";
</style>