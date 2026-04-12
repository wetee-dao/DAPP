<template>
  <div class="dao-members">
    <div class="container">
      <div class="header">
        <h1>{{ t('govMembers.title') }}</h1>
        <div class="header-actions">
          <div class="header-stats">
            <el-statistic :title="t('govMembers.totalMembers')" :value="members.length" />
          </div>
          <!-- 加入/退出 DAO 按钮 -->
          <div class="action-buttons">
            <template v-if="!isMember">
              <el-button
                v-if="publicJoinEnabled"
                type="primary"
                :loading="joining"
                @click="handleJoinDao"
              >
                {{ t('govMembers.join') }}
              </el-button>
              <el-tag v-else type="info">{{ t('govMembers.publicJoin') }} {{ t('common.disabled') }}</el-tag>
            </template>
            <el-button
              v-else
              type="danger"
              :loading="leaving"
              @click="handleLeaveDao"
            >
              {{ t('govMembers.leave') }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- 搜索框 -->
      <el-card class="search-card">
        <el-input
          v-model="searchText"
          :placeholder="t('common.search')"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </el-card>

      <!-- 成员列表 -->
      <el-card class="members-card">
        <el-table
          :data="filteredMembers"
          v-loading="loading"
          style="width: 100%"
        >
          <el-table-column type="index" label="#" width="60" />
          <el-table-column label="地址" min-width="300">
            <template #default="scope">
              <div class="address-cell">
                <el-tooltip :content="scope.row" placement="top">
                  <span class="address-text">{{ scope.row }}</span>
                </el-tooltip>
                <el-button
                  type="text"
                  size="small"
                  @click="copyAddress(scope.row)"
                >
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
                <el-tag v-if="scope.row === currentAddress" size="small" type="success">
                  {{ t('govMembers.you') }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="t('govMembers.myBalance')" width="150">
            <template #default="scope">
              {{ formatBalance(balances[scope.row]?.total || "0") }}
            </template>
          </el-table-column>
          <el-table-column label="锁定" width="150">
            <template #default="scope">
              {{ formatBalance(balances[scope.row]?.locked || "0") }}
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!loading && filteredMembers.length === 0" :description="t('common.noData')" />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { Search, DocumentCopy } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import {
  getMemberList,
  getBalance,
  getLockBalance,
  setDaoContractAddress,
  getDaoContractAddress,
  getPublicJoin,
} from "@/apis/dao";
import { $getTxProvider } from "@/plugins/chain";
import { BN } from "@polkadot/util";

const router = useRouter();
const store = useStore();
const { t } = useI18n();

const loading = ref(false);
const members = ref<string[]>([]);
const balances = ref<Record<string, { available: string; locked: string; total: string }>>({});
const searchText = ref("");
const publicJoinEnabled = ref(false);
const joining = ref(false);
const leaving = ref(false);

// 当前用户地址
const currentAddress = computed(() => store.state.userInfo?.addr || "");

// 当前用户是否为成员
const isMember = computed(() => {
  return members.value.includes(currentAddress.value);
});

// 过滤后的成员列表
const filteredMembers = computed(() => {
  if (!searchText.value) {
    return members.value;
  }
  const search = searchText.value.toLowerCase();
  return members.value.filter((member) =>
    member.toLowerCase().includes(search)
  );
});

// 格式化余额
const formatBalance = (balance: any): string => {
  if (!balance) return "0";
  if (typeof balance === "string") return balance;
  if (typeof balance === "object" && balance.toString) return balance.toString();
  return String(balance);
};

// 加载成员列表
const loadMembers = async () => {
  try {
    loading.value = true;
    const list = await getMemberList();
    members.value = list || [];
    
    // 加载每个成员的余额信息
    await loadBalances();
  } catch (error) {
    console.error("加载成员列表失败:", error);
    members.value = [];
  } finally {
    loading.value = false;
  }
};

// 加载余额信息
const loadBalances = async () => {
  const balancePromises = members.value.map(async (member) => {
    try {
      const [available, locked] = await Promise.all([
        getBalance(member),
        getLockBalance(member),
      ]);
      
      const availableBN = new BN(available || "0");
      const lockedBN = new BN(locked || "0");
      const totalBN = availableBN.add(lockedBN);

      balances.value[member] = {
        available: availableBN.toString(),
        locked: lockedBN.toString(),
        total: totalBN.toString(),
      };
    } catch (error) {
      console.error(`加载成员 ${member} 余额失败:`, error);
      balances.value[member] = {
        available: "0",
        locked: "0",
        total: "0",
      };
    }
  });

  await Promise.all(balancePromises);
};

// 加载公开加入状态
const loadPublicJoinStatus = async () => {
  try {
    publicJoinEnabled.value = await getPublicJoin();
  } catch (error) {
    console.error("加载公开加入状态失败:", error);
    publicJoinEnabled.value = false;
  }
};

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑已在 computed 中处理
};

// 复制地址
const copyAddress = async (address: string) => {
  try {
    await navigator.clipboard.writeText(address);
    ElMessage.success(t('common.copied'));
  } catch (error) {
    ElMessage.error(t('common.copyFailed'));
  }
};

// 公开加入 DAO
const handleJoinDao = async () => {
  try {
    joining.value = true;
    
    await $getTxProvider(async (chain, builder) => {
      const txData = await (builder as any).ink_builder(
        getDaoContractAddress(),
        "public_join",
        {},
        "0"
      );
      
      const signer = store.state.userInfo.addr;
      await chain.signAndSend(
        await chain.buildCall(txData, signer),
        signer,
        () => {
          ElMessage.success(t('govMembers.join') + " " + t('common.success'));
          loadMembers();
        },
        (error: any) => {
          console.error("加入DAO失败:", error);
          ElMessage.error(t('common.error') + ": " + error);
        }
      );
    });
  } catch (error: any) {
    ElMessage.error(t('common.error') + ": " + (error.message || error));
  } finally {
    joining.value = false;
  }
};

// 退出 DAO
const handleLeaveDao = async () => {
  try {
    leaving.value = true;
    
    await $getTxProvider(async (chain, builder) => {
      const txData = await (builder as any).ink_builder(
        getDaoContractAddress(),
        "leave",
        {},
        "0"
      );
      
      const signer = store.state.userInfo.addr;
      await chain.signAndSend(
        await chain.buildCall(txData, signer),
        signer,
        () => {
          ElMessage.success(t('govMembers.leave') + " " + t('common.success'));
          loadMembers();
        },
        (error: any) => {
          console.error("退出DAO失败:", error);
          ElMessage.error(t('common.error') + ": " + error);
        }
      );
    });
  } catch (error: any) {
    ElMessage.error(t('common.error') + ": " + (error.message || error));
  } finally {
    leaving.value = false;
  }
};

onMounted(async () => {
  // TODO: 需要根据实际情况设置 DAO 合约地址
  // setDaoContractAddress("0x...");
  
  await Promise.all([loadMembers(), loadPublicJoinStatus()]);
});
</script>

<style lang="scss" scoped>
.dao-members {
  padding: 20px;
  min-height: calc(100vh - 60px);

  .container {
    max-width: 1400px;
    margin: 0 auto;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .header-stats {
      display: flex;
      gap: 24px;
    }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .search-card {
    margin-bottom: 20px;
  }

  .members-card {
    .address-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      .address-text {
        font-family: monospace;
        font-size: 14px;
        max-width: 250px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>
