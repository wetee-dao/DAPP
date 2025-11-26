<template>
  <div class="service" @click="closeClick">
    <div @click="(e) => e.stopPropagation()">
      <div class="title">
        Update Container
        <div class="space"></div>
        <div class="right-tool">
          <div class="deploy-btn" @click="submit()">
            Submit to chain
          </div>
          <div class="close-btn" @click="closeClick">
            <i class="icon right">&#xe604;</i>
          </div>
        </div>
      </div>
      <el-form class="form" ref="formRef">
        <div class="form-box" ref="containerRef">
          <div class="box-step" id="f0">
            <div class="classTitle">
              <i class="icon">&#xe6bc;</i>BaseSetting
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
          </div>

          <div class="box-step" id="f1" v-if="teeVersion != 'SGX'">
            <div class="classTitle">
              <i class="icon">&#xee15;</i>CommandSetting
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
                      <el-option label="Public Env" value="Env" />
                      <el-option label="Secret Env" value="Encrypt" />
                    </el-select>
                  </template>
                </el-input>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <el-input v-if="item.prefix == 'Env'" v-model="item.value" placeholder="value name">
                  <template #prepend>value</template>
                </el-input>
                <el-select v-if="item.prefix == 'Encrypt'" v-model="item.id" placeholder="select secret">
                  <template #label="{ label }">
                    <div v-if="label != null">
                      <span>#{{ label }}</span>
                    </div>
                  </template>
                  <el-option :label="s.id + ' '+s.key" :value="s.id" v-for="s in secrets">
                    <span>#{{ s.id }} {{ s.key }}</span>
                  </el-option>
                </el-select>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <el-button size="large" type="danger" circle :icon="Delete" @click="removeItem('env', index)" />
              </div>
              <el-button size="large" @click="addItem('env')">
                <span class="icon">&#xe604;</span>&nbsp;&nbsp;Add&nbsp;&nbsp;
              </el-button>
            </div>
          </div>

          <div class="box-step" id="f3">
            <div class="classTitle"><i class="icon">&#xe645;</i>StorageSetting</div>
            <div class="form-table-box">
              <div class="flex" :key="index" v-for="(d, index) in form.disk">
                <el-input v-model="d.path" placeholder="mount path" />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <el-select v-model="d.id" placeholder="select disk">
                  <template #label="{ label }">
                    <div v-if="label.data != null">
                      <span style="float: left">#{{ label.id }} {{ label.data.SecretSSD[0] }}</span>
                      <span style="
                          float: right;
                          color: var(--el-text-color-secondary);
                          font-size: 13px;
                        ">
                        {{ label.data.SecretSSD[2] }} GB
                      </span>
                    </div>
                  </template>
                  <el-option :label="disk" :value="disk.id" v-for="disk in disks">
                    <span style="float: left">#{{ disk.id }} {{ disk.data.SecretSSD[0] }}</span>
                    <span style="
                        float: right;
                        color: var(--el-text-color-secondary);
                        font-size: 13px;
                      ">
                      {{ disk.data.SecretSSD[2] }} GB
                    </span>
                  </el-option>
                </el-select>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <el-button size="large" type="danger" circle :icon="Delete" @click="removeItem('disk', index)" />
              </div>
              <el-button size="large" @click="addItem('disk')">
                <span class="icon">&#xe604;</span>&nbsp;&nbsp;Add&nbsp;&nbsp;
              </el-button>
            </div>
          </div>

          <div class="box-step last-step" id="f4">
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

          <div class="margin-end-30"></div>

          <el-anchor class="form-anchor" :container="containerRef" direction="vertical" type="default" :bound="200"
            @click="handleClick">
            <el-anchor-link class="form-anchor-item" href="#f0" title="BaseSetting" />
            <el-anchor-link class="form-anchor-item" href="#f1" title="CommandSetting" />
            <el-anchor-link class="form-anchor-item" href="#f2" title="EnvironmentSetting" />
            <el-anchor-link class="form-anchor-item" href="#f3" title="StorageSetting" />
            <el-anchor-link class="form-anchor-item" href="#f4" title="NetWorkSetting" />
          </el-anchor>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { FormInstance } from "element-plus";
import { Delete } from '@element-plus/icons-vue';
import { deepCopy } from "@/utils/object";
import { $getQueryApi, $getTxProvider } from "@/plugins/chain";
import { parseEnv, validFormArray } from "./utils";

const props = defineProps(["router", "store", "close", "ps", "app"])
const containerRef = ref<HTMLElement | null>(null)
const formRef = ref<FormInstance>()
const podId = props.ps.podId
const id = props.ps.id
const teeVersion = props.ps.teeVersion
const container = props.ps.container
let defaultContainer: any = {
  image: "",
  cpu: 1000,
  memory: 800,
  commandPrefix: "SH",
  command: "",
  disk: [],
  port: [],
  env: [],
}

if (container) {
  defaultContainer = {
    image: container.image || "",
    cpu: parseInt(container.cpu.replaceAll(",", "")) || 1000,
    memory: parseInt(container.mem.replaceAll(",", "")),
    commandPrefix: "SH",
    command: "",
    disk: container.disk,
    port: [],
    env: parseEnv(container.env),
  }
}
const form = ref<any>(deepCopy(defaultContainer))

const store = props.store;
const userAddr = store.state.userInfo.addr;
const disks = ref<any[]>([]);
const secrets = ref<any[]>([]);

const handleClick = (e: MouseEvent) => {
  e.preventDefault()
}

onMounted(async () => {
  getList()
});

const getList = async () => {
  const slist = await $getQueryApi().secrets(userAddr, null, 1000)
  const dlist = await $getQueryApi().disks(userAddr, null, 1000)
  secrets.value = slist
  disks.value = dlist
};

const closeClick = () => {
  props.close();
};

const submit = async () => {
  await $getTxProvider(async (chain, builder): Promise<void> => {
    const validData = validFormArray(form.value)
    if (!validData.ok) return;

    let dry = null;
    if (id) {
      dry = await builder.editContainer(
        podId,
        id,
        validData.data,
      )
    } else {
      dry = await builder.createContainer(
        podId,
        validData.data,
      )
    }

    const signer = props.store.state.userInfo.addr;
    const tx = await chain.buildCall(dry, signer)
    await chain.proxysignAndSend(tx, "-1", signer, () => {
      props.close();
    }, () => { })
  })
}

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
        path: "",
        id: null
      });
      break;
  }
};

const removeItem = (t: string, i: number) => {
  form.value[t].splice(i, 1);
};
</script>

<style lang="scss" scoped>
@use "../../../assets/styles/components/pop.scss";
</style>