<template>
  <div class="dao-vote-proposal">
    <div class="container">
      <el-card class="proposal-card" v-if="proposal">
        <template #header>
          <div class="card-header">
            <h2>{{ t('dao.voteTitle', { id: proposalId }) }}</h2>
            <el-tag :type="getStatusType(proposalStatus)">
              {{ getStatusLabel(proposalStatus) }}
            </el-tag>
          </div>
        </template>

        <!-- 提案信息 -->
        <div class="proposal-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="t('dao.proposalId')">{{ proposalId }}</el-descriptions-item>
            <el-descriptions-item :label="t('dao.status')">{{ getStatusLabel(proposalStatus) }}</el-descriptions-item>
            <el-descriptions-item :label="t('dao.contractAddress')">
              {{ proposal.contract || t('dao.daoSelfContract') }}
            </el-descriptions-item>
            <el-descriptions-item :label="t('dao.transferAmount')">
              {{ formatBalance(proposal.amount) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 投票统计 -->
        <div class="vote-stats" v-if="voteList.length > 0">
          <h3>{{ t('dao.voteStats') }}</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">{{ t('dao.yesVotes') }} ({{ t('dao.yes') }})</div>
              <div class="stat-value yes">{{ formatBalance(yesVotes) }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">{{ t('dao.noVotes') }} ({{ t('dao.no') }})</div>
              <div class="stat-value no">{{ formatBalance(noVotes) }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">{{ t('dao.totalVoteWeight') }}</div>
              <div class="stat-value">{{ formatBalance(totalVotes) }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">{{ t('dao.approvalRate') }}</div>
              <div class="stat-value">{{ approvalRate }}%</div>
            </div>
          </div>
        </div>

        <!-- 投票列表 -->
        <div class="vote-list" v-if="voteList.length > 0">
          <h3>{{ t('dao.voteList') }}</h3>
          <el-table :data="voteList" style="width: 100%">
            <el-table-column prop="calller" :label="t('dao.voter')" width="200" />
            <el-table-column :label="t('dao.opinion')" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.opinion === 0 ? 'success' : 'danger'">
                  {{ scope.row.opinion === 0 ? t('dao.yes') : t('dao.no') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="pledge" :label="t('dao.voteWeight')" />
            <el-table-column prop="vote_block" :label="t('dao.voteBlock')" />
          </el-table>
        </div>

        <!-- 投票操作 -->
        <div class="vote-action" v-if="canVote">
          <h3>{{ t('dao.voteAction') }}</h3>
          <el-form :model="voteForm" :rules="voteRules" ref="voteFormRef" label-width="120px">
            <el-form-item :label="t('dao.voteOpinion')" prop="opinion">
              <el-radio-group v-model="voteForm.opinion">
                <el-radio :label="0">{{ t('dao.yes') }} (YES)</el-radio>
                <el-radio :label="1">{{ t('dao.no') }} (NO)</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item :label="t('dao.voteAmount')" prop="amount">
              <el-input
                v-model="voteForm.amount"
                :placeholder="t('dao.voteAmountPlaceholder')"
                clearable
              >
                <template #append>
                  <el-button @click="setMaxAmount">{{ t('dao.max') }}</el-button>
                </template>
              </el-input>
              <div class="form-tip">
                {{ t('dao.availableBalance') }}: {{ formatBalance(availableBalance) }}
              </div>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleVote" :loading="voting">
                {{ t('dao.submitVote') }}
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
import { useI18n } from "vue-i18n";
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
const { t } = useI18n();
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
  opinion: [{ required: true, message: t("dao.validateOpinion"), trigger: "change" }],
  amount: [
    { required: true, message: t("dao.validateVoteAmount"), trigger: "blur" },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (!value || parseFloat(value) <= 0) {
          callback(new Error(t("dao.validateVoteAmountPositive")));
        } else if (parseFloat(value) > parseFloat(availableBalance.value)) {
          callback(new Error(t("dao.validateVoteAmountAvailable")));
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
    .reduce((sum, v) => sum.add(new BN(v.pledge || 0)), new BN(0))
    .toString();
});

const noVotes = computed(() => {
  return voteList.value
    .filter((v) => v.opinion === 1 && !v.deleted)
    .reduce((sum, v) => sum.plus(new BN(v.pledge || 0)), new BN(0))
    .toString();
});

const totalVotes = computed(() => {
  return new BN(yesVotes.value).add(new BN(noVotes.value)).toString();
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
const getStatusType = (status: PropStatus): "primary" | "success" | "warning" | "info" | "danger" => {
  const typeMap: Record<PropStatus, "primary" | "success" | "warning" | "info" | "danger"> = {
    [PropStatus.Pending]: "info",
    [PropStatus.Ongoing]: "warning",
    [PropStatus.Confirming]: "warning",
    [PropStatus.Approved]: "success",
    [PropStatus.Rejected]: "danger",
    [PropStatus.Canceled]: "info",
  };
  return typeMap[status] || "info";
};

const getStatusLabel = (status: PropStatus) => {
  const labelMap: Record<PropStatus, string> = {
    [PropStatus.Pending]: t("dao.pending"),
    [PropStatus.Ongoing]: t("dao.ongoing"),
    [PropStatus.Confirming]: t("dao.confirming"),
    [PropStatus.Approved]: t("dao.approved"),
    [PropStatus.Rejected]: t("dao.rejected"),
    [PropStatus.Canceled]: t("dao.canceled"),
  };
  return labelMap[status] || String(status);
};

// 设置最大金额
const setMaxAmount = () => {
  voteForm.value.amount = availableBalance.value;
};

// 获取不可投票消息
const getNoVoteMessage = (): string => {
  if (proposalStatus.value === PropStatus.Pending) {
    return t("dao.noVotePending");
  } else if (proposalStatus.value === PropStatus.Approved) {
    return t("dao.noVoteApproved");
  } else if (proposalStatus.value === PropStatus.Rejected) {
    return t("dao.noVoteRejected");
  } else if (proposalStatus.value === PropStatus.Canceled) {
    return t("dao.noVoteCanceled");
  }
  return t("dao.noVoteDefault");
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
            ElMessage.success(t('dao.submitVoteSuccess'));
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
      ElMessage.error(t('dao.submitVoteError', { error: error.message || error }));
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
