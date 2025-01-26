<template>
  <div class="service" @click="closeClick">
    <div @click="(e) => e.stopPropagation()">
      <div class="title no-border">
        <i class="icon">&#xe663;</i>Create Ink! smart contract
        <i class="icon right" @click="closeClick">&#xe604;</i>
      </div>
      <div class="toolbar">
        <ul class="tabs">
          <li class="tab-item template">
            <el-autocomplete @select="handleTempApp" v-model="curTemp" :fetch-suggestions="querySearch"
              placeholder="Select ink! template">
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
              ContractSetting
            </div>
            <div class="form-context-box">
              <div class="form-sub-title">Upload the smart contract compilation package (.contract file)</div>
              <div class="form-input-box">
                <el-input v-model="form.hash" placeholder="Smart contract code">
                  <template #prefix>
                    <i class="icon">&#xe645;</i>
                  </template>
                  <template #suffix>
                    <el-upload class="upload-btn" accept=".abi,.contract" :show-file-list="false"
                      :http-request="uploadFile">
                      <span v-if="!form.hash">
                        Click here to upload new contract&nbsp;&nbsp;
                      </span>
                      <el-icon :size="22">
                        <Upload />
                      </el-icon>
                    </el-upload>
                  </template>
                </el-input>
              </div>
            </div>
            <div class="form-context-box" v-show="curContract == 0">
              <div class="form-sub-title">Name</div>
              <div class="form-input-box">
                <el-input v-model="form.name" placeholder="Contract name"></el-input>
              </div>
            </div>
          </div>

          <div class="box-step" id="f1">
            <div class="classTitle">
              <i class="icon">&#xee15;</i>
              DeploySetting
            </div>

            <div class="form-table-box" v-if="constructors.length > 0">
              <div class="form-sub-title">Contract Deployment Constructor</div>
              <div class="form-input-box">
                <el-select v-model="constructorIndex" placeholder="Select contract constructor"
                  @change="onConstructorChange">
                  <el-option :label="formatConstructorMethod(c)" :value="index" v-for="(c, index) in constructors" />
                </el-select>
                <div :class="index == 0 ? 'arg-input first-arg' : 'arg-input'" v-for="(arg, index) in args">
                  <ArgInput :arg="arg" :value="argValues[arg.name]" @input="setArg(index, $event)" />
                </div>
              </div>
            </div>

            <div class="form-table-box">
              <div class="form-sub-title">RefTime Limit</div>
              <div class="form-input-box">
                <el-input v-model="form.refTime" placeholder="for example:  /usr/sbin/httpd -f httpd.conf">
                </el-input>
              </div>
            </div>

            <div class="form-table-box">
              <div class="form-sub-title">ProofSize Limit</div>
              <div class="form-input-box">
                <el-input v-model="form.proofSize" placeholder="for example:  /usr/sbin/httpd -f httpd.conf">
                </el-input>
              </div>
            </div>
          </div>

          <div class="margin-end-30"></div>

          <div class="dry-run" direction="vertical">
            <div class="dry-run-title">Dry-run outcome</div>
            <div class="dry-run-item">
              -&nbsp; GasConsumed
              <div class="dry-run-tag">
                <div class="t">refTime</div> {{ dryRun[0] }}
              </div>
              <div class="dry-run-tag">
                <div class="t">proofSize</div> {{ dryRun[1] }}
              </div>
            </div>
            <div class="dry-run-item">
              -&nbsp; GasRequired
              <div class="dry-run-tag">
                <div class="t">refTime</div> {{ dryRun[2] }}
              </div>
              <div class="dry-run-tag">
                <div class="t">proofSize</div> {{ dryRun[3] }}
              </div>
            </div>
          </div>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { ElNotification, FormInstance, UploadRequestOptions } from "element-plus";
import { Close, Upload } from '@element-plus/icons-vue';
import { getUrlParams } from "@/utils/pop";
import { deepCopy } from "@/utils/object";
import { readFileAsync } from "@/utils/dom";
import { addContractCode } from "@/apis/contract_indexer";
import { getProjectByID } from "@/apis/project";
import { Abi } from "@polkadot/api-contract";
import { AbiConstructor, AbiMessageParam } from "@polkadot/api-contract/types";
import { ApiPromise } from "@polkadot/api";
import { BN_ZERO } from "@polkadot/util";
import { InstantiateData, createInstantiateTx, formatProofSize, formatRefTime, getGasLimit, getStorageDepositLimit, transformUserInput } from "@/utils/ink";
import { Balance } from "@polkadot/types/interfaces";
import { randomAsHex } from "@polkadot/util-crypto";
import { $getChainProvider } from "@/plugins/chain";

const pid = getUrlParams("project_id");
const props = defineProps(["router", "store", "close", "app"])
const formRef = ref<FormInstance>()

const temps: any[] = []
const curTemp = ref<string>("")
const defaultContract = {
  name: "",
  hash: "",
  refTime: 100,
  proofSize: 100,
}
const form = ref<any>(deepCopy(defaultContract))

// 智能合约列表
const curContract = ref<any>(0)

// 构造函数
const constructors = ref<AbiConstructor[]>([])
const constructorIndex = ref<number>(0)

// 构造函数参数
const args = ref<AbiMessageParam[]>([])
const argValues = ref<Record<string, unknown>>({})

// slat
const salt = ref<string>(randomAsHex(32))
const dryRun = ref<string[]>(["0", "0", "0", "0"])

const abi = ref<Abi | null>(null)
const codeHashUrlParam = ref<string | undefined>(undefined)

const uploadFile = async (options: UploadRequestOptions): Promise<XMLHttpRequest | Promise<unknown>> => {
  const file = options.file as File;
  const data = await readFileAsync(file)
  const project = await getProjectByID(props.store.state.userInfo.addr, pid!)

  await addContractCode({
    project: project.addr,
    abi: data
  })

  let api: ApiPromise | undefined = undefined;
  await $getChainProvider(async (chain): Promise<void> => {
    api = chain.client
  }, undefined, true);
  const cabi = new Abi(data, api!.registry.getChainProperties());

  const name = cabi.info.contract.name.toString();
  const source: any = cabi.json.source

  form.value.name = name
  form.value.hash = source.hash

  constructors.value = cabi.constructors

  onConstructorChange(0);
  abi.value = cabi

  return new Promise(async (resolve, reject) => {
  });
}

const setArg = (index: number, value: any) => {
  console.log(value)
  argValues.value[constructors.value[constructorIndex.value].args[index].name] = value

  dryTry()
}

const formatConstructorMethod = (c: any) => {
  let args = ""
  for (let i = 0; i < c.args.length; i++) {
    const arg = c.args[i];
    args += arg.name + ':' + arg.type.type.toString()
    if (i != c.args.length - 1) {
      args += ','
    }
  }
  return c.method + '(' + args + ')'
}

const onConstructorChange = (index: number) => {
  constructorIndex.value = index;
  args.value = constructors.value[index].args

  let newArgs: Record<string, unknown> = {}
  constructors.value[index].args.forEach((arg, index) => {
    newArgs[arg.name] = null
  })
  argValues.value = newArgs

  dryTry()
}

const dryTry = async () => {
  await $getChainProvider(async (chain): Promise<void> => {
    const api = chain.client!

    const accountId = props.store.state.userInfo.addr
    const { freeBalance } = await api.derive.balances.account(accountId)
    const constructor = constructors.value[constructorIndex.value]
    const inputData = constructor?.toU8a(transformUserInput(api.registry, constructor.args, argValues.value));

    const isUsingSalt = true
    const params = [
      accountId,
      constructor?.isPayable
        ? api.registry.createType('Balance', 100)
        : api.registry.createType('Balance', BN_ZERO),
      getGasLimit(false, form.value.refTime, form.value.proofSize, api.registry),
      getStorageDepositLimit(false, freeBalance, api.registry),
      codeHashUrlParam.value ? { Existing: codeHashUrlParam.value } : { Upload: abi.value!.info.source.wasm },
      inputData ?? '',
      isUsingSalt ? salt.value : '',
    ]

    const dryRunResult: any = await api.call.contractsApi.instantiate(...params);
    form.value.refTime = dryRunResult?.gasRequired.refTime.toString()
    form.value.proofSize = dryRunResult?.gasRequired.proofSize.toString()

    const refTime = formatRefTime(dryRunResult?.gasConsumed.refTime, "ms")
    const proofSize = formatProofSize(dryRunResult.gasConsumed.proofSize, 'kb');
    console.log("gasConsumed ", refTime, proofSize)
    const refTime2 = formatRefTime(dryRunResult?.gasRequired.refTime, "ms")
    const proofSize2 = formatProofSize(dryRunResult.gasRequired.proofSize, 'kb');
    console.log("gasRequired ", refTime2, proofSize2)

    dryRun.value = [refTime, proofSize, refTime2, proofSize2]
  }, undefined, true);
}

// export function createConstructorOptions(registry: Registry, data?: AbiConstructor[]): DropdownOption<number>[] {
//   return (data || []).map((constructor, index) => ({
//     label: <MessageSignature message={constructor} registry={registry} />,
//     value: index,
//   }));
// }

// const getApi = (): ApiPromise => {
//   const g = props.app!.config.globalProperties;
//   const chain = g.$getChain();
//   const client = chain.client;
//   return client
// }

const handleTempApp = (item: any) => {
  curTemp.value = item.name
  console.log(deepCopy(item.contracts))
}

const querySearch = (queryString: string, cb: any) => {
  let results = queryString
    ? temps.filter(createFilter(queryString))
    : temps

  if (results.length == 0) results = temps
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
  await $getChainProvider(async (chain): Promise<void> => {
    const api = chain.client!
    const accountId = props.store.state.userInfo.addr

    if (abi.value == null) {
      ElNotification({
        title: 'Error',
        message: "Please upload the ink! smart contract",
        type: 'error',
      })
      return
    }

    if (constructors.value.length == 0) {
      ElNotification({
        title: 'Error',
        message: "Constructor not validable",
        type: 'error',
      })
      return
    }

    for (const k in argValues.value) {
      if (argValues.value[k] == null) {
        ElNotification({
          title: 'call error',
          message: "Contract call arg " + k + " is null",
          type: 'error',
        })
        return
      }
    }

    const constructor = constructors.value[constructorIndex.value]
    const params: InstantiateData = {
      accountId: accountId,
      argValues: argValues.value,
      value: constructor?.isPayable
        ? api.registry.createType('Balance', 100) as Balance
        : api.registry.createType('Balance', BN_ZERO) as Balance,
      metadata: abi.value! as Abi,
      name: form.value.name,
      constructorIndex: constructorIndex.value,
      salt: salt.value,
      storageDepositLimit: null,
      gasLimit: getGasLimit(true, form.value.refTime, form.value.proofSize, api.registry)!,
      codeHash: codeHashUrlParam.value,
    };

    try {
      const tx = createInstantiateTx(api, params);
      if (!tx) return;

      await chain.proxysignAndSend(tx, pid!, accountId, (result: any) => {
        console.log(result)
        props.close();
      }, () => { })

      if (codeHashUrlParam.value) {

      } else {

      }
    } catch (e) {
      console.error(e);
    }
    salt.value = randomAsHex(32);
  });
};
</script>

<style lang="scss" scoped>
@use "../../assets/styles/components/pop.scss";

.upload-btn {
  height: 100%;
  display: flex;
  align-items: center;
  border-left: 2px solid rgba($gray-bg, 0.2);
  padding-left: 12px;
  cursor: pointer;
}
</style>