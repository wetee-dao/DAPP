<template>
  <div class="dao-vote-proposal">
    <div class="container">
      <el-card class="proposal-card" v-if="proposal">
        <template #header>
          <div class="card-header">
            <h2>投票提案 #{{ proposalId }}</h2>
            <el-tag :type="getStatusType(proposalStatus)">
              {{ proposalStatus }}
            </el-tag>
          </div>
        </template>

        <!-- 提案信息 -->
        <div class="proposal-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="提案ID">{{ proposalId }}</el-descriptions-item>
            <el-descriptions-item label="状态">{{ proposalStatus }}</el-descriptions-item>
            <el-descriptions-item label="合约地址">
              {{ proposal.contract || "DAO合约自身" }}
            </el-descriptions-item>
            <el-descriptions-item label="转账金额">
              {{ formatBalance(proposal.amount) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 投票统计 -->
        <div class="vote-stats" v-if="voteList.length > 0">
          <h3>投票统计</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">同意 (YES)</div>
              <div class="stat-value yes">{{ formatBalance(yesVotes) }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">反对 (NO)</div>
              <div class="stat-value no">{{ formatBalance(noVotes) }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">总投票权重</div>
              <div class="stat-value">{{ formatBalance(totalVotes) }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">批准率</div>
              <div class="stat-value">{{ approvalRate }}%</div>
            </div>
          </div>
        </div>

        <!-- 投票列表 -->
        <div class="vote-list" v-if="voteList.length > 0">
          <h3>投票列表</h3>
          <el-table :data="voteList" style="width: 100%">
            <el-table-column prop="calller" label="投票人" width="200" />
            <el-table-column label="意见" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.opinion === 0 ? 'success' : 'danger'">
                  {{ scope.row.opinion === 0 ? "YES" : "NO" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="pledge" label="投票权重" />
            <el-table-column prop="vote_block" label="投票区块" />
          </el-table>
        </div>

        <!-- 投票操作 -->
        <div class="vote-action" v-if="canVote">
          <h3>投票</h3>
          <el-form :model="voteForm" :rules="voteRules" ref="voteFormRef" label-width="120px">
            <el-form-item label="投票意见" prop="opinion">
              <el-radio-group v-model="voteForm.opinion">
                <el-radio :label="0">同意 (YES)</el-radio>
                <el-radio :label="1">反对 (NO)</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="投票金额" prop="amount">
              <el-input
                v-model="voteForm.amount"
                placeholder="输入投票权重金额（代币将被锁定）"
                clearable
              >
                <template #append>
                  <el-button @click="setMaxAmount">最大</el-button>
                </template>
              </el-input>
              <div class="form-tip">
                可用余额: {{ formatBalance(availableBalance) }}
              </div>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleVote" :loading="voting">
                提交投票
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <div v-else class="no-vote">
          <el-alert
            :title="getNoVoteMessage()"
            type="info"
            :closable="false"
          />
        </div>
      </el-card>

      <el-card v-else class="loading-card">
        <el-skeleton :rows="5" animated />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { $getTxProvider } from "@/plugins/chain";
import {
  getProposal,
  getProposalStatus,
  getVoteList,
  getBalance,
  getLockBalance,
  submitVote,
  Opinion,
  PropStatus,
  setDaoContractAddress,
  getDaoContractAddress,
} from "@/apis/dao";
import { BN } from "@polkadot/util";

const route = useRoute();
const router = useRouter();
const store = useStore();
const voteFormRef = ref();

const proposalId = ref<number>(parseInt(route.params.id as string) || 0);
const proposal = ref<any>(null);
const proposalStatus = ref<PropStatus>(PropStatus.Pending);
const voteList = ref<any[]>([]);
const availableBalance = ref<string>("0");
const voting = ref(false);

const voteForm = ref({
  opinion: Opinion.YES,
  amount: "",
});

const voteRules = {
  opinion: [{ required: true, message: "请选择投票意见", trigger: "change" }],
  amount: [
    { required: true, message: "请输入投票金额", trigger: "blur" },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (!value || parseFloat(value) <= 0) {
          callback(new Error("投票金额必须大于0"));
        } else if (parseFloat(value) > parseFloat(availableBalance.value)) {
          callback(new Error("投票金额不能超过可用余额"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

// 计算投票统计
const yesVotes = computed(() => {
  return voteList.value
    .filter((v) => v.opinion === 0 && !v.deleted)
    .reduce((sum, v) => sum.plus(new BN(v.pledge || 0)), new BN(0))
    .toString();
});

const noVotes = computed(() => {
  return voteList.value
    .filter((v) => v.opinion === 1 && !v.deleted)
    .reduce((sum, v) => sum.plus(new BN(v.pledge || 0)), new BN(0))
    .toString();
});

const totalVotes = computed(() => {
  return new BN(yesVotes.value).plus(new BN(noVotes.value)).toString();
});

const approvalRate = computed(() => {
  const total = parseFloat(totalVotes.value);
  if (total === 0) return "0";
  const yes = parseFloat(yesVotes.value);
  return ((yes / total) * 100).toFixed(2);
});

const canVote = computed(() => {
  return proposalStatus.value === PropStatus.Ongoing;
});

// 格式化余额
const formatBalance = (balance: any): string => {
  if (!balance) return "0";
  if (typeof balance === "string") return balance;
  if (typeof balance === "object" && balance.toString) return balance.toString();
  return String(balance);
};

// 获取状态类型
const getStatusType = (status: PropStatus): string => {
  const typeMap: Record<PropStatus, string> = {
    [PropStatus.Pending]: "info",
    [PropStatus.Ongoing]: "warning",
    [PropStatus.Confirming]: "warning",
    [PropStatus.Approved]: "success",
    [PropStatus.Rejected]: "danger",
    [PropStatus.Canceled]: "info",
  };
  return typeMap[status] || "info";
};

// 设置最大金额
const setMaxAmount = () => {
  voteForm.value.amount = availableBalance.value;
};

// 获取不可投票消息
const getNoVoteMessage = (): string => {
  if (proposalStatus.value === PropStatus.Pending) {
    return "提案尚未进入投票阶段，需要先支付决定押金";
  } else if (proposalStatus.value === PropStatus.Approved) {
    return "提案已通过";
  } else if (proposalStatus.value === PropStatus.Rejected) {
    return "提案已被拒绝";
  } else if (proposalStatus.value === PropStatus.Canceled) {
    return "提案已取消";
  }
  return "当前无法投票";
};

// 加载提案信息
const loadProposal = async () => {
  try {
    proposal.value = await getProposal(proposalId.value);
    proposalStatus.value = await getProposalStatus(proposalId.value);
    await loadVoteList();
  } catch (error) {
    console.error("加载提案信息失败:", error);
  }
};

// 加载投票列表
const loadVoteList = async () => {
  try {
    voteList.value = await getVoteList(proposalId.value);
  } catch (error) {
    console.error("加载投票列表失败:", error);
  }
};

// 加载用户余额
const loadBalance = async () => {
  try {
    const userAddr = store.state.userInfo.addr;
    availableBalance.value = await getBalance(userAddr);
  } catch (error) {
    console.error("加载余额失败:", error);
  }
};

// 提交投票
const handleVote = async () => {
  if (!voteFormRef.value) return;

  await voteFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    try {
      voting.value = true;

      await $getTxProvider(async (chain, builder) => {
        // 构建交易数据
        const txData = await (builder as any).ink_builder(
          getDaoContractAddress(),
          "submit_vote",
          {
            proposal_id: proposalId.value,
            opinion: voteForm.value.opinion,
          },
          voteForm.value.amount
        );

        const signer = store.state.userInfo.addr;
        await chain.signAndSend(
          await chain.buildCall(txData, signer),
          signer,
          () => {
            ElMessage.success("投票提交成功！");
            voteForm.value.amount = "";
            loadProposal();
            loadBalance();
          },
          (error: any) => {
            console.error("提交投票失败:", error);
          }
        );
      });
    } catch (error: any) {
      ElMessage.error("提交投票失败: " + (error.message || error));
    } finally {
      voting.value = false;
    }
  });
};

onMounted(async () => {
  // TODO: 需要根据实际情况设置 DAO 合约地址
  // setDaoContractAddress("0x...");
  
  await Promise.all([loadProposal(), loadBalance()]);
});
</script>

<style lang="scss" scoped>
.dao-vote-proposal {
  padding: 20px;
  min-height: calc(100vh - 60px);

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .proposal-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
    }

    .proposal-info {
      margin-bottom: 24px;
    }

    .vote-stats {
      margin: 24px 0;

      h3 {
        margin-bottom: 16px;
        font-size: 18px;
        font-weight: 600;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;

        .stat-item {
          padding: 16px;
          background: var(--el-bg-color-page);
          border-radius: 8px;

          .stat-label {
            font-size: 14px;
            color: var(--el-text-color-secondary);
            margin-bottom: 8px;
          }

          .stat-value {
            font-size: 20px;
            font-weight: 600;

            &.yes {
              color: var(--el-color-success);
            }

            &.no {
              color: var(--el-color-danger);
            }
          }
        }
      }
    }

    .vote-list {
      margin: 24px 0;

      h3 {
        margin-bottom: 16px;
        font-size: 18px;
        font-weight: 600;
      }
    }

    .vote-action {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--el-border-color);

      h3 {
        margin-bottom: 16px;
        font-size: 18px;
        font-weight: 600;
      }

      .form-tip {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-top: 4px;
      }
    }

    .no-vote {
      margin-top: 24px;
    }
  }

  .loading-card {
    min-height: 400px;
  }
}
</style>
