<template>
    <el-form class="update-form form" ref="formRef">
        <div class="form-box" ref="containerRef">
            <div class="box-step" id="f0">
                <div class="classTitle">
                    <i class="icon">&#xe6bc;</i>
                    BaseSetting
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

            <div class="box-step" id="f1">
                <div class="classTitle">
                    <i class="icon">&#xee15;</i>
                    CommandSetting
                </div>
                <div class="form-table-box">
                    <div class="form-sub-title">If no input is provided, default Docker startup parameters will be used.
                    </div>
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
                        <el-button size="large" type="danger" circle :icon="Delete"
                            @click="removeItem('port', index)" />
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
                        <el-button size="large" type="danger" circle :icon="Delete"
                            @click="removeItem('disk', index)" />
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
                <el-anchor-link class="form-anchor-item" href="#f2" title="EnvironmentSetting"
                    v-show="curContainer == 0" />
                <el-anchor-link class="form-anchor-item" href="#f3" title="NetWorkSetting" />
                <el-anchor-link class="form-anchor-item" href="#f4" title="StorageSetting" />
            </el-anchor>
        </div>
    </el-form>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { Delete } from '@element-plus/icons-vue';
import { getUrlParams } from "@/utils/pop";
import { deepCopy } from "@/utils/object";
import { FormInstance } from "element-plus";

const pid = getUrlParams("project_id");
const props = defineProps(["router", "store", "close", "app"])
const containerRef = ref<HTMLElement | null>(null)
const formRef = ref<FormInstance>()
const handleClick = (e: MouseEvent) => {
    e.preventDefault()
}

const defaultContainer = {
  teeVersion: "",
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
const form = ref<any>(deepCopy(defaultContainer))

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
@import "@/assets/styles/components/pop.scss";
.update-form {
    height: 100% !important;
    .form-anchor{
        position: fixed;
        top: 250px;
        right: 20px;
        width: 180px;
    }
}
</style>