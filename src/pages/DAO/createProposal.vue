<template>
  <div class="dao-create-proposal">
    <div class="container">
      <el-card class="proposal-card">
        <template #header>
          <div class="card-header">
            <h2>发起提案</h2>
          </div>
        </template>

        <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
          <el-form-item label="选择轨道" prop="trackId">
            <el-select v-model="form.trackId" placeholder="请选择投票轨道" style="width: 100%">
              <el-option
                v-for="track in tracks"
                :key="track.id"
                :label="track.name || `轨道 #${track.id}`"
                :value="track.id"
              >
                <div>
                  <div>{{ track.name || `轨道 #${track.id}` }}</div>
                  <div style="font-size: 12px; color: #999">
                    决定押金: {{ formatBalance(track.decision_deposit) }}
                  </div>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="合约地址" prop="contract">
            <el-input
              v-model="form.contract"
              placeholder="留空表示调用DAO合约自身"
              clearable
            />
            <div class="form-tip">留空表示调用DAO合约自身</div>
          </el-form-item>

          <el-form-item label="函数选择器" prop="selector">
            <el-input
              v-model="form.selector"
              placeholder="4字节十六进制，例如: 0x12345678"
              clearable
            />
            <div class="form-tip">4字节十六进制函数选择器</div>
          </el-form-item>

          <el-form-item label="调用参数" prop="input">
            <el-input
              v-model="form.input"
              type="textarea"
              :rows="4"
              placeholder="SCALE编码的参数（十六进制）"
            />
            <div class="form-tip">SCALE编码的参数，十六进制格式</div>
          </el-form-item>

          <el-form-item label="转账金额" prop="amount">
            <el-input
              v-model="form.amount"
              placeholder="随调用一起转账的原生代币数量"
              clearable
            >
              <template #append>原生代币</template>
            </el-input>
          </el-form-item>

          <el-form-item label="Gas限制" prop="refTimeLimit">
            <el-input
              v-model="form.refTimeLimit"
              placeholder="参考时间限制"
              clearable
            />
          </el-form-item>

          <el-form-item label="允许重入" prop="allowReentry">
            <el-switch v-model="form.allowReentry" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSubmit" :loading="submitting">
              提交提案
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElMessage, ElMessageBox } from "element-plus";
import { $getTxProvider } from "@/plugins/chain";
import {
  getTrackList,
  getDefaultTrack,
  submitProposal,
  setDaoContractAddress,
  getDaoContractAddress,
} from "@/apis/dao";
import { hexToU8a, u8aToHex } from "@polkadot/util";

const router = useRouter();
const store = useStore();
const formRef = ref();
const submitting = ref(false);
const tracks = ref<any[]>([]);

const form = ref({
  trackId: null as number | null,
  contract: "",
  selector: "",
  input: "",
  amount: "0",
  refTimeLimit: "1000000",
  allowReentry: false,
});

const rules = {
  trackId: [{ required: true, message: "请选择投票轨道", trigger: "change" }],
  selector: [
    { required: true, message: "请输入函数选择器", trigger: "blur" },
    {
      pattern: /^0x[0-9a-fA-F]{8}$/,
      message: "选择器必须是4字节十六进制（0x开头，8个字符）",
      trigger: "blur",
    },
  ],
  input: [{ required: false, message: "请输入调用参数", trigger: "blur" }],
  amount: [{ required: true, message: "请输入转账金额", trigger: "blur" }],
  refTimeLimit: [{ required: true, message: "请输入Gas限制", trigger: "blur" }],
};

// 格式化余额显示
const formatBalance = (balance: any): string => {
  if (!balance) return "0";
  if (typeof balance === "string") return balance;
  if (typeof balance === "object" && balance.toString) return balance.toString();
  return String(balance);
};

// 加载轨道列表
const loadTracks = async () => {
  try {
    const list = await getTrackList(0, 100);
    tracks.value = list || [];
    
    // 如果有默认轨道，设置为默认值
    const defaultTrack = await getDefaultTrack();
    if (defaultTrack !== null && defaultTrack !== undefined) {
      form.value.trackId = defaultTrack;
    } else if (tracks.value.length > 0) {
      form.value.trackId = tracks.value[0].id;
    }
  } catch (error) {
    console.error("加载轨道列表失败:", error);
  }
};

// 提交提案
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    try {
      submitting.value = true;

      // 构建 Call 对象
      const call = {
        contract: form.value.contract || null,
        selector: hexToU8a(form.value.selector),
        input: form.value.input ? hexToU8a(form.value.input) : [],
        amount: form.value.amount,
        ref_time_limit: form.value.refTimeLimit,
        allow_reentry: form.value.allowReentry,
      };

      await $getTxProvider(async (chain, builder) => {
        // 构建交易数据
        const txData = await (builder as any).ink_builder(
          getDaoContractAddress(),
          "submit_proposal",
          {
            call: call,
            track_id: form.value.trackId,
          },
          "0"
        );

        const signer = store.state.userInfo.addr;
        await chain.signAndSend(
          await chain.buildCall(txData, signer),
          signer,
          () => {
            ElMessage.success("提案提交成功！");
            router.push("/dao/proposals");
          },
          (error: any) => {
            console.error("提交提案失败:", error);
          }
        );
      });
    } catch (error: any) {
      ElMessage.error("提交提案失败: " + (error.message || error));
    } finally {
      submitting.value = false;
    }
  });
};

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields();
  loadTracks();
};

onMounted(async () => {
  // 从配置或环境变量获取 DAO 合约地址
  // TODO: 需要根据实际情况设置 DAO 合约地址
  // setDaoContractAddress("0x...");
  
  await loadTracks();
});
</script>

<style lang="scss" scoped>
.dao-create-proposal {
  padding: 20px;
  min-height: calc(100vh - 60px);

  .container {
    max-width: 800px;
    margin: 0 auto;
  }

  .proposal-card {
    .card-header {
      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
    }

    .form-tip {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }
  }
}
</style>
