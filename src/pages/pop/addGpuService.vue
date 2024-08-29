<template>
  <div class="service" @click="closeClick">
    <div @click="(e) => e.stopPropagation()">
      <div class="title no-border">
        <i class="icon">&#xe649;</i>Create GPU Compute service
        <i class="icon right" @click="closeClick">&#xe604;</i>
      </div>
      <div class="toolbar">
        <ul class="tabs">
          <li class="tab-item template">
            <el-autocomplete @select="handleTempApp" v-model="curTemp" :fetch-suggestions="querySearch"
              placeholder="Select app template">
              <template #prefix>
                <i class="icon">&#xe680;</i>
              </template>
              <template #default="{ item }">
                <div class="input-app" :key="item.name">
                  <img class="icon" :src="item.icon" />
                  <div class="app-box">
                    <div class="app-title">{{ item.name }}</div>
                    <span class="app-desc">{{ item.desc }}</span>
                  </div>
                </div>
              </template>
              <template #suffix>
                <i class="icon select">&#xe809;</i>
              </template>
            </el-autocomplete>
          </li>
          <li :class="curContainer == 0 ? 'tab-item active' : 'tab-item'" @click="activeContainer(0)">Main container
          </li>
          <li :class="curContainer == (index + 1) ? 'tab-item active' : 'tab-item'" @click="activeContainer(index + 1)"
            v-for="(_item, index) in containers.filter((_item, index) => index > 0)" :key="index">
            &nbsp;&nbsp;Side #{{ index + 1 }}
            <el-icon class="delete-container" @click.stop="deleteContainer(index + 1)">
              <Close />
            </el-icon>
          </li>
          <li class="tab-item no-border" v-if="containers[0].teeVersion == 'CVM'" @click="addContainer">
            <span class="icon">&#xe604;</span>&nbsp;Add container
          </li>
        </ul>
        <div class="space"></div>
        <el-button size="large" type="primary" @click="toAdd()">
          Deploy Now &nbsp;&nbsp;<i class="icon">&#xe62c;</i>
        </el-button>
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
                <el-input v-model="form.image" placeholder="Docker image">
                  <template #prefix>
                    <i class="icon">&#xf18e;</i>
                  </template>
                </el-input>
              </div>
            </div>
            <div class="form-context-box" v-show="curContainer == 0">
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
              <div class="form-sub-title">GPU device</div>
              <div class="form-input-box">
                <el-slider v-model="form.gpu" :max="3" show-input show-stops />
              </div>
            </div>
            <div class="form-context-box" v-show="curContainer == 0">
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
              <div class="flex" :key="index" v-for="(item, index) in form.env">
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
              <div class="flex" :key="index" v-for="(item, index) in form.port">
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
              <div class="flex" :key="index" v-for="(item, index) in form.disk">
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

          <div class="margin-end-30"></div>

          <el-anchor class="form-anchor" :container="containerRef" direction="vertical" type="default" :bound="200"
            @click="handleClick">
            <el-anchor-link class="form-anchor-item" href="#f0" title="BaseSetting" />
            <el-anchor-link class="form-anchor-item" href="#f1" title="CommandSetting" />
            <el-anchor-link class="form-anchor-item" href="#f2" title="EnvironmentSetting" v-show="curContainer == 0" />
            <el-anchor-link class="form-anchor-item" href="#f3" title="NetWorkSetting" />
            <el-anchor-link class="form-anchor-item" href="#f4" title="StorageSetting" />
          </el-anchor>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { ElNotification, FormInstance } from "element-plus";
import { Delete, Close } from '@element-plus/icons-vue';
import { getUrlParams } from "@/utils/pop";
import { validFormArray } from "./utils";
import { deepCopy } from "@/utils/object";

const pid = getUrlParams("project_id");
const props = defineProps(["router", "store", "close", "app"])
const containerRef = ref<HTMLElement | null>(null)
const formRef = ref<FormInstance>()
const handleClick = (e: MouseEvent) => {
  e.preventDefault()
}

const temps = (window as any).extTemps().filter((v: any) => v.create_type == "gpu")
const curTemp = ref<string>("")
const defaultContainer = {
  teeVersion: "CVM",
  image: "",
  cpu: 1000,
  memory: 800,
  disk: [],
  port: [],
  commandPrefix: "SH",
  command: "",
  env: [],
  level: 1,
}
const curContainer = ref<any>(0)
const containers = ref<any[]>([deepCopy(defaultContainer)])
const form = ref<any>(deepCopy(defaultContainer))

const addContainer = () => {
  let oldCs = deepCopy(containers.value)
  oldCs.push(deepCopy(defaultContainer))
  containers.value = oldCs
  activeContainer(oldCs.length - 1)
}

const activeContainer = (i: number) => {
  // 保存状态
  if (curContainer.value != i) {
    containers.value[curContainer.value] = deepCopy(form.value)

    // 开启新的状态
    curContainer.value = i
  }

  form.value = deepCopy(containers.value[i])
}

const deleteContainer = (i: number) => {
  containers.value.splice(i, 1)

  form.value = containers.value[0]
  curContainer.value = 0
}

const handleTempApp = (item: any) => {
  curTemp.value = item.name
  console.log(deepCopy(item.containers))

  containers.value = deepCopy(item.containers)
  activeContainer(0)
}

const querySearch = (queryString: string, cb: any) => {
  let results = queryString
    ? temps.filter(createFilter(queryString))
    : temps

  if(results.length == 0) results = temps
  cb(results)
}

const createFilter = (queryString: string) => {
  return (restaurant: any) => {
    return (
      restaurant.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

const closeClick = () => {
  props.close();
};

const toAdd = async () => {
  containers.value[curContainer.value] = form.value
  const g = props.app!.config.globalProperties;
  const chain = g.$getChain();
  if (!chain.client) {
    return;
  }
  const client = chain.client;

  let mainData: any = {}
  let validDatas: any[] = []
  let envs: any[] = []
  for (var i = 0; i < containers.value.length; i++) {
    const c = containers.value[i]
    const validData = validFormArray(client, c, i)
    if (!validData.ok) return;
    if (i == 0) {
      mainData = {
        name: c.name,
        level: c.level,
        teeVersion: c.teeVersion,
        ...validData.data,
      }
    } else {
      validDatas.push(validData.data)
    }
    envs.push(...validData.data.env)
    console.log(envs)
  }

  const signer = props.store.state.userInfo.addr;
  if(mainData.name == ""){
    ElNotification({
      title: "Error",
      message: "Container name is required",
      type: "error",
    })
    return
  }
  try {
    //@ts-ignore
    const none = new Option(client.registry, "Vec<u8>", null);
    const tx = client.tx.weTEEGpu.create(
      mainData.name,
      mainData.image,
      "",
      "",
      JSON.stringify(containers.value[0].meta),
      mainData.port,
      mainData.command,
      envs,
      none,
      mainData.cpu,
      mainData.memory,
      mainData.disk,
      mainData.gpu,
      validDatas.map((v: any) => {
        return {
          image: v.image,
          command: v.command,
          port: v.port,
          cr: {
            cpu: v.cpu,
            mem: v.mem,
            disk: v.disk,
            gpu: 0
          }
        }
      }),
      mainData.level,
      client.createType('TEEVersion', mainData.teeVersion),
    )

    await chain.ProxySignAndSend(tx, pid, signer, () => {
      props.close();
    }, () => { })
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
      form.value.env.push({
        prefix: "Env",
        key: "",
        value: "",
      });
      break;
    case 'port':
      form.value.port.push({
        prefix: "Tcp",
        value: null
      });
      break;
    case 'disk':
      form.value.disk.push({
        prefix: "SSD",
        key: "",
        value: null
      });
      break;
  }
};

const removeItem = (t: string, i: number) => {
  form.value[t].splice(i, 1);
};
</script>

<style lang="scss" scoped>
@import "../../assets/styles/components/pop.scss";
</style>