<template>
  <div class="service" @click="closeClick">
    <div @click="(e: any) => e.stopPropagation()">
      <div class="title">
        <i class="icon">&#xe77c;</i>Create Confidential Task
        <i class="icon right" @click="closeClick">&#xe604;</i>
      </div>
      <el-form class="form" ref="formRef">
        <div class="form-box" ref="containerRef">
          <div class="box-step" id="f0">
            <div class="classTitle">
              <i class="icon">&#xe6bc;</i>
              BaseSetting
            </div>
            <div class="form-context-box">
              <div class="form-sub-title">Docker image</div>
              <div class="form-input-box">
                <el-autocomplete 
                  @select="handleSelectApp"
                  v-model="form.image"
                  :fetch-suggestions="querySearch"
                  placeholder="Docker image"
                >
                  <template #prefix>
                    <i class="icon">&#xf18e;</i>
                  </template>
                  <template #default="{ item }">
                    <div class="input-app">
                      <img class="icon" :src="item.icon" />
                      <div class="app-box">
                        <div class="app-title">{{ item.name }} - {{ item.docker.image }}</div>
                        <span class="app-desc">{{ item.desc }}</span>
                      </div>
                    </div>
                   
                  </template>
                </el-autocomplete>
              </div>
            </div>
            <div class="form-context-box">
              <div class="form-sub-title">Name</div>
              <div class="form-input-box">
                <el-input v-model="form.name" placeholder="Service name"></el-input>
              </div>
            </div>
            <div class="form-context-box">
              <div class="form-sub-title">CPU （1 unit is 1/1000 core）</div>
              <div class="form-input-box">
                <el-slider v-model="form.cpu" :step="100" :max="32000" show-input />
              </div>
            </div>
            <div class="form-context-box">
              <div class="form-sub-title">Memory （MB）</div>
              <div class="form-input-box">
                <el-slider v-model="form.memory" :step="100" :max="32000" show-input />
              </div>
            </div>
            <div class="form-context-box">
              <div class="form-sub-title">Level</div>
              <div class="form-input-box">
                <el-slider v-model="form.level" :max="8" show-input show-stops />
              </div>
            </div>
          </div>
          <!-- </el-row> -->
          <div class="box-step" id="f1">
            <div class="classTitle">
              <i class="icon">&#xee15;</i>
              CommandSetting
            </div>
            <div class="form-table-box">
              <div class="form-sub-title">If no input is provided, default Docker startup parameters will be used.</div>
              <div class="form-input-box">
                <el-input v-model="form.command" placeholder="for example:  /usr/sbin/httpd -f httpd.conf">
                  <template #prepend>
                    <el-select v-model="form.commandPrefix" placeholder="Select" style="width: 130px">
                      <el-option label="/bin/sh" value="SH" />
                      <el-option label="/bin/bash" value="BASH" />
                      <el-option label="/bin/zsh" value="ZSH" />
                    </el-select>
                  </template>
                </el-input>
              </div>
            </div>
          </div>

          <div class="box-step" id="f2">
            <div class="classTitle"><i class="icon">&#xe654;</i>EnvironmentSetting</div>
            <div class="form-table-box">
              <div class="flex" v-for="(item, index) in form.env">
                <el-input v-model="item.key" placeholder="key name / file name">
                  <template #prepend>
                    <el-select v-model="item.prefix" placeholder="Select" style="width: 170px">
                      <el-option label="Environment key" value="Env" />
                      <el-option label="File path" value="File" />
                    </el-select>
                  </template>
                </el-input>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <el-input v-model="item.value" placeholder="value name">
                  <template #prepend>value</template>
                </el-input>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <el-button size="large" type="danger" circle :icon="Delete" @click="removeItem('env', index)" />
              </div>
              <el-button size="large" @click="addItem('env')">
                <span class="icon">&#xe604;</span>&nbsp;&nbsp;Add&nbsp;&nbsp;
              </el-button>
            </div>
          </div>

          <div class="box-step" id="f3">
            <div class="classTitle"><i class="icon">&#xe66d;</i>NetWorkSetting</div>
            <div class="form-table-box">
              <div class="flex" v-for="(item, index) in form.port">
                <el-input type="number" v-model="item.value" :min="0" :max="65535"
                  placeholder="container port: 0 - 65535">
                  <template #prepend>
                    <el-select v-model="item.prefix" placeholder="Select" style="width: 170px">
                      <el-option label="TCP to expose" value="Tcp" />
                      <el-option label="UDP to expose" value="Udp" />
                      <el-option label="TCP in project" value="ProjectTcp" />
                      <el-option label="UDP in project" value="ProjectUdp" />
                    </el-select>
                  </template>
                </el-input>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <el-button size="large" type="danger" circle :icon="Delete" @click="removeItem('port', index)" />
              </div>
              <el-button size="large" @click="addItem('port')">
                <span class="icon">&#xe604;</span>&nbsp;&nbsp;Add&nbsp;&nbsp;
              </el-button>
            </div>
          </div>

          <div class="box-step last-step" id="f4">
            <div class="classTitle"><i class="icon">&#xe645;</i>StorageSetting</div>
            <div class="form-table-box">
              <div class="flex" v-for="(item, index) in form.disk">
                <el-input v-model="item.key" placeholder="ssd path">
                  <template #prepend>
                    <el-select v-model="item.prefix" placeholder="Select" style="width: 100px">
                      <el-option label="SSD" value="SSD" />
                    </el-select>
                  </template>
                </el-input>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <el-input type="number" v-model="item.value" placeholder="ssd size">
                  <template #prepend>size</template>
                  <template #append>
                    GB
                  </template>
                </el-input>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <el-button size="large" type="danger" circle :icon="Delete" @click="removeItem('disk', index)" />
              </div>
              <el-button size="large" @click="addItem('disk')">
                <span class="icon">&#xe604;</span>&nbsp;&nbsp;Add&nbsp;&nbsp;
              </el-button>
            </div>
          </div>

          <div class="box-step last-step margin-end-30" id="f5">
            <div class="form-context-box">
              <el-button size="large" type="primary" @click="toAdd">Deploy Now &nbsp;&nbsp;<i
                  class="icon">&#xe62c;</i></el-button>
            </div>
          </div>

          <el-anchor class="form-anchor" :container="containerRef" direction="vertical" type="default" :bound="200"
            @click="handleClick">
            <el-anchor-link class="form-anchor-item" href="#f0" title="BaseSetting" />
            <el-anchor-link class="form-anchor-item" href="#f1" title="CommandSetting" />
            <el-anchor-link class="form-anchor-item" href="#f2" title="EnvironmentSetting" />
            <el-anchor-link class="form-anchor-item" href="#f3" title="NetWorkSetting" />
            <el-anchor-link class="form-anchor-item" href="#f4" title="StorageSetting" />
          </el-anchor>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { ElNotification, FormInstance } from "element-plus";
import { getUrlParams } from "@/utils/pop";
import { Delete } from '@element-plus/icons-vue'
import { validFormArray } from "./utils";

const pid = getUrlParams("project_id");

const props = defineProps(["router", "store", "close", "app"])
const containerRef = ref<HTMLElement | null>(null)
const formRef = ref<FormInstance>()
const handleClick = (e: MouseEvent) => {
  e.preventDefault()
}

const images = ref<any[]>((window as any).teeApps.filter( (v:any) => v.create_type=="task" ).map( (v:any) => { 
  v.cpu = 1000;
  v.memory = 3000;
  return v
}));
const form = reactive<any>({
  name: 'test',
  image: images.value[0].image,
  cpu: 1000,
  memory: 3000,
  disk: [],
  port: [],
  commandPrefix: "SH",
  command: "",
  env: [],
  level: 1,
})

const handleSelectApp = (item: any) => {
  form.image = item.docker.image;
  form.name = item.name;
  form.teeVersion = item.runtime;
  if(item.docker.cmd){
    form.command = item.docker.cmd;
  }
  
  if(item.docker.port){
    let ports = []
    for(let i=0;i<item.docker.port.length;i++){
      ports.push({
        prefix: item.docker.port[i].key,
        value: item.docker.port[i].value
      })
    }
    form.port = ports;
  }else{
    form.port = []
  }
  
  if(item.docker.disk){
    let disks = []
    for(let i=0;i<item.docker.disk.length;i++){
      disks.push({
        prefix: "SSD",
        key: item.docker.disk[i].key,
        value: item.docker.disk[i].value
      })
    }
    form.disk = disks;
  }else{
    form.disk = []
  }

  if(item.docker.env){
    let envs = []
    for(let i=0;i<item.docker.env.length;i++){
      envs.push({
        prefix: "Env",
        key: item.docker.env[i].key,
        value: item.docker.env[i].value
      })
    }
    form.env = envs;
  }else{
    form.env = []
  }
}

const querySearch = (queryString: string, cb:any) => {
  const results = queryString
    ? images.value.filter(createFilter(queryString))
    : images.value
  cb(results)
}

const createFilter = (queryString:string) => {
  return (restaurant:any) => {
    return (
      restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

const closeClick = () => {
  props.close();
};

const toAdd = async (item: any) => {
  const chain = props.app!.config.globalProperties.$getChain();
  if (!chain.client) {
    return;
  }
  await chain.client.query.timestamp.now();
  const client = chain.client;


  const validData = validFormArray(client, form, 0)
  if (!validData.ok) return;

  const signer = props.store.state.userInfo.addr;

  if(form.name == ""){
    ElNotification({
      title: "Error",
      message: "Container name is required",
      type: "error",
    })
    return
  }

  if(form.image == ""){
    ElNotification({
      title: "Error",
      message: "Container image is required",
      type: "error",
    })
    return
  }

  try {
    const tx = client.tx.task.create(
      form.name,
      form.image,
      "{}",
      validData.port,
      validData.command,
      validData.env,
      form.cpu,
      form.memory,
      validData.disk,
      form.level,
      client.createType('TEEVersion', 'SGX'),
    )

    await chain.ProxySignAndSend(tx, pid, signer, () => {
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

const addItem = (t: string) => {
  switch (t) {
    case 'env':
      form.env.push({
        prefix: "Env",
        key: "",
        value: "",
      });
      break;
    case 'port':
      form.port.push({
        prefix: "Tcp",
        value: null
      });
      break;
    case 'disk':
      form.disk.push({
        prefix: "SSD",
        key: "",
        value: null
      });
      break;
  }
};

const removeItem = (t: string, i: number) => {
  form[t].splice(i, 1);
};
</script>

<style lang="scss"scoped>

@import "../../assets/styles/components/pop.scss";
</style>