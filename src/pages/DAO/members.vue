<template>
  <div class="dao-members">
    <div class="container">
      <div class="header">
        <h1>成员列表</h1>
        <div class="header-stats">
          <el-statistic title="总成员数" :value="members.length" />
        </div>
      </div>

      <!-- 搜索框 -->
      <el-card class="search-card">
        <el-input
          v-model="searchText"
          placeholder="搜索成员地址"
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
              </div>
            </template>
          </el-table-column>
          <el-table-column label="可用余额" width="150">
            <template #default="scope">
              {{ formatBalance(balances[scope.row]?.available || "0") }}
            </template>
          </el-table-column>
          <el-table-column label="锁定余额" width="150">
            <template #default="scope">
              {{ formatBalance(balances[scope.row]?.locked || "0") }}
            </template>
          </el-table-column>
          <el-table-column label="总余额" width="150">
            <template #default="scope">
              {{ formatBalance(balances[scope.row]?.total || "0") }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click="viewMemberDetail(scope.row)"
              >
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!loading && filteredMembers.length === 0" description="暂无成员" />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Search, DocumentCopy } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import {
  getMemberList,
  getBalance,
  getLockBalance,
  setDaoContractAddress,
} from "@/apis/dao";
import { BN } from "@polkadot/util";

const router = useRouter();

const loading = ref(false);
const members = ref<string[]>([]);
const balances = ref<Record<string, { available: string; locked: string; total: string }>>({});
const searchText = ref("");

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

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑已在 computed 中处理
};

// 复制地址
const copyAddress = async (address: string) => {
  try {
    await navigator.clipboard.writeText(address);
    ElMessage.success("地址已复制到剪贴板");
  } catch (error) {
    ElMessage.error("复制失败");
  }
};

// 查看成员详情
const viewMemberDetail = (address: string) => {
  // TODO: 可以跳转到成员详情页面
  ElMessage.info("成员详情功能开发中");
};

onMounted(async () => {
  // TODO: 需要根据实际情况设置 DAO 合约地址
  // setDaoContractAddress("0x...");
  
  await loadMembers();
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

    .header-stats {
      display: flex;
      gap: 24px;
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
