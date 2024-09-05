<template>
  <div class="service" @click="closeClick">
    <div @click="(e: any) => e.stopPropagation()">
      <div class="title">
        Project Setting
        <i class="icon right" @click="closeClick">&#xe604;</i>
      </div>
      <div class="form simple-form" :style="{ overflow: 'auto' }">
        <div class="form-context-box">
          <div class="form-sub-title">Name</div>
          <div class="form-input-box">
            <el-input placeholder="Name"></el-input>
          </div>
        </div>
        <div class="form-context-box">
          <div class="form-sub-title">Description</div>
          <div class="form-input-box">
            <el-input placeholder="Description"></el-input>
          </div>
        </div>
        <div class="form-context-box">
          <el-button size="large" type="primary" @click="toAdd">Add</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps(["router", "store", "close"])

const closeClick = () => {
  props.close();
};

const toAdd = (item: any) => {
  props.router.push(item.adduri);
  props.close();
};

</script>

<style lang="scss" scoped>
@import "../../assets/styles/components/pop.scss";
</style>