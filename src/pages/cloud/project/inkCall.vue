<template>
  <div class="play-box">
    <div class="call-box">
      <div class="form-box">
        <el-form class="form" ref="formRef">
          <div class="form-table-box" v-if="messages.length > 0">
            <div class="form-sub-title">Message to Send</div>
            <div class="form-input-box">
              <el-select v-model="messageIndex" placeholder="Select contract message" @change="onMessageChange">
                <el-option :label="formatMessageMethod(c)" :value="index" v-for="(c, index) in messages" />
              </el-select>
              <div :class="index == 0 ? 'arg-input first-arg' : 'arg-input'" v-for="(arg, index) in args">
                <ArgInput :key="arg.name" :arg="arg" :value="argValues[arg.name]" @input="setArg(index, $event)" />
              </div>
            </div>
          </div>

          <div class="form-table-box">
            <div class="form-sub-title">RefTime Limit</div>
            <div class="form-input-box">
              <el-input v-model="form.refTime">
              </el-input>
            </div>
          </div>

          <div class="form-table-box">
            <div class="form-sub-title">ProofSize Limit</div>
            <div class="form-input-box">
              <el-input v-model="form.proofSize">
              </el-input>
            </div>
          </div>

          <div class="form-table-box">
            <el-button size="large" type="primary" @click="onSubmit()">
              Call contract &nbsp;&nbsp;<i class="icon">&#xe62c;</i>
            </el-button>
          </div>
        </el-form>
      </div>

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
  </div>
</template>

<script lang="ts" setup>
import { inject, onMounted, ref } from 'vue';
import { Action, ElMessageBox, ElNotification, FormInstance } from 'element-plus';
import { deepCopy } from '@/utils/object';
import { formatProofSize, formatRefTime, getGasLimit, getStorageDepositLimit, transformUserInput } from '@/utils/ink';
import { BN, BN_ZERO } from '@polkadot/util';
import { Abi, ContractPromise } from '@polkadot/api-contract';
import { AbiMessage, AbiParam, ContractCallOutcome, ContractOptions } from '@polkadot/api-contract/types';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { useStore } from 'vuex';

const props = defineProps(["inkInfo"])
const store = useStore();
const abi = new Abi(props.inkInfo.Abi)
const messages = ref<AbiMessage[]>(abi.messages)
const messageIndex = ref<number>(0)
const wetee: any = inject('wetee')
const args = ref<AbiParam[]>([])
const argValues = ref<Record<string, unknown>>({})
let dryRunBN: BN[] = []
const dryRun = ref<string[]>(["0", "0", "0", "0"])

/// from values
const formRef = ref<FormInstance>()
const defaultArgs = {
  name: "",
  hash: "",
  refTime: 100,
  proofSize: 100,
}
const form = ref<any>(deepCopy(defaultArgs))

onMounted(() => {
  setTimeout(() => {
    onMessageChange(messageIndex.value)
  }, 800)
})

const setArg = (index: number, value: any) => {
  argValues.value[messages.value[messageIndex.value].args[index].name] = value

  dryTry()
}

const onMessageChange = (index: number) => {
  messageIndex.value = index;
  args.value = messages.value[index].args

  let newArgs: Record<string, unknown> = {}
  messages.value[index].args.forEach((arg, index) => {
    newArgs[arg.name] = null
  })
  argValues.value = newArgs

  dryTry()
}

const dryTry = async () => {
  const api = wetee().client;
  const accountId = store.state.userInfo.addr;
  const { freeBalance } = await api.derive.balances.account(accountId)
  const message = messages.value[messageIndex.value]
  const inputData = message?.toU8a(transformUserInput(api.registry, message.args, argValues.value));
  const contractId = props.inkInfo.ContractId
  const params = [
    accountId,
    contractId,
    message?.isPayable
      ? api.registry.createType('Balance', 100)
      : api.registry.createType('Balance', BN_ZERO),
    getGasLimit(false, form.value.refTime, form.value.proofSize, api.registry),
    getStorageDepositLimit(false, freeBalance, api.registry),
    inputData ?? '',
  ]

  const dryRunResult: any = await api.call.contractsApi.call(...params);
  form.value.refTime = dryRunResult?.gasRequired.refTime.toString()
  form.value.proofSize = dryRunResult?.gasRequired.proofSize.toString()

  const refTime = formatRefTime(dryRunResult?.gasConsumed.refTime, "ms")
  const proofSize = formatProofSize(dryRunResult.gasConsumed.proofSize, 'kb');
  const refTime2 = formatRefTime(dryRunResult?.gasRequired.refTime, "ms")
  const proofSize2 = formatProofSize(dryRunResult.gasRequired.proofSize, 'kb');

  dryRunBN = [dryRunResult?.gasConsumed.refTime, dryRunResult?.gasConsumed.proofSize, dryRunResult?.gasRequired.refTime, dryRunResult?.gasRequired.proofSize]
  dryRun.value = [refTime, proofSize, refTime2, proofSize2]
}

const formatMessageMethod = (c: any) => {
  let args = ""
  for (let i = 0; i < c.args.length; i++) {
    const arg = c.args[i];
    args += (arg as any).name + ':' + arg.type.type
    if (i != c.args.length - 1) {
      args += ','
    }
  }
  return c.method + '(' + args + ')'
}

const onSubmit = async () => {
  const chain = wetee();
  const api = chain.client;
  const contract = new ContractPromise(api, new Abi(props.inkInfo.Abi), props.inkInfo.ContractId);
  const message = messages.value[messageIndex.value]
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
  const transformed = transformUserInput(contract.registry, message.args, argValues.value);

  new BN(form.value.refTime)
  const option: ContractOptions = {
    gasLimit: getGasLimit(true, new BN(form.value.refTime), new BN(form.value.proofSize), api.registry)!,
    // storageDepositLimit: getStorageDepositLimit(
    //   false,
    //   userInput,
    //   api.registry,
    //   predictedStorageDeposit,
    // ),
    storageDepositLimit: null,
  };

  if (message.isMutating) {
    const method = contract.tx[message.method]
    let ext: SubmittableExtrinsic<'promise'> | null = null;
    if (transformed.length > 0) {
      ext = method(
        option,
        ...transformed
      );
    } else {
      ext = method(
        option,
      );
    }
    const signer = store.state.userInfo.addr;
    await chain.SignAndSend(ext, signer, () => {
      ElNotification({
        title: 'Notice',
        message: "Contract call successfully",
        type: 'success',
      })
    }, () => {

    })
  } else {
    let result: ContractCallOutcome | null = null;
    const method = contract.query[message.method]
    if (transformed.length > 0) {
      result = await method(
        store.state.userInfo.addr,
        option,
        ...transformed
      );
    } else {
      result = await method(
        store.state.userInfo.addr,
        option,
      );
    }
    if (result.result!.isOk) {
      ElMessageBox.alert("Read result: " + (result.output!.toHuman() as any)["Ok"], 'Contract read successfully', {
        confirmButtonText: "Close",
        callback: (action: Action) => {},
      })
    } else {
      ElNotification({
        title: 'Contract call error',
        message: "Error: " + JSON.stringify(result!.result.asErr.toHuman()),
        type: 'error',
      })
    }
  }
}
</script>

<style lang='scss'>
.play-box {
  padding-bottom: 20px;

  .play-item {
    background-color: rgba($secondary-text-rgb, 0.03);
    margin: 20px 30px 0px 30px;
  }

  .abi {
    padding: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .message,
  .database {
    color: rgba($primary-text-rgb, 0.8);
  }

  .doc {
    font-size: 14px;
    padding: 10px;
    color: rgba($secondary-text-rgb, 0.4);
    line-height: 20px;
    border-top: 2px solid rgba($secondary-text-rgb, 0.05);
  }

  .call-box {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 20px 30px 0px 30px;

    .form-box {
      flex: 1;
      margin-right: 40px;

      .form-table-box {
        padding: 0px 0 5px 15px;
        max-width: 900px;
        margin-bottom: 15px;

        .flex {
          margin-bottom: 10px;
        }

        >div:last-child {
          margin-bottom: 0;
        }


        .form-sub-title {
          margin-bottom: 5px;
          font-size: 13px;
          font-weight: bold;
        }
      }
    }

    .arg-input {
      margin-top: 10px;
      margin-left: 40px;
      width: calc(100% - 40px);
      position: relative;

      &>::after {
        content: ' ';
        width: 20px;
        height: 2px;
        background-color: rgba($color: $secondary-text-rgb, $alpha: 0.2);
        left: -20px;
        top: 22px;
        position: absolute;
      }

      &>::before {
        content: ' ';
        width: 2px;
        height: 54px;
        background-color: rgba($color: $secondary-text-rgb, $alpha: 0.2);
        left: -20px;
        top: -32px;
        position: absolute;
      }
    }

    .first-arg {
      &>::before {
        content: ' ';
        width: 2px;
        height: 33px;
        background-color: rgba($color: $secondary-text-rgb, $alpha: 0.2);
        left: -20px;
        top: -10px;
        position: absolute;
      }
    }

    .dry-run {
      width: 200px;
      background: rgba($color: $primary-bg-rgb, $alpha: 1);
      padding: 15px;
      border-radius: 6px;
      height: min-content;

      .dry-run-title {
        font-size: 17px;
        color: $primary-text;
      }

      .dry-run-item {
        font-size: 14px;
        margin-top: 20px;
      }

      .dry-run-tag {
        padding: 8px 10px;
        background-color: rgba($color: $secondary-text-rgb, $alpha: 0.05);
        border-radius: 4px;
        margin: 10px 0 10px 0;

        .t {
          width: 47%;
          margin-right: 5%;
          display: inline-block;
          text-align: center;
          border-right: 3px solid rgba($color: $secondary-text-rgb, $alpha: 0.1);
        }
      }
    }
  }
}
</style>