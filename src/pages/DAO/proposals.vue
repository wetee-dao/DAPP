<template>
  <div class="dao-proposals">
    <div class="container">
      <div class="header">
        <h1>{{ t('dao.proposalsTitle') }}</h1>
        <el-button type="primary" @click="goToCreate">
          <el-icon><Plus /></el-icon>
          {{ t('dao.createProposal') }}
        </el-button>
      </div>

      <!-- 筛选器 -->
      <el-card class="filter-card">
        <el-form :inline="true" :model="filterForm">
          <el-form-item :label="t('dao.statusFilter')">
            <el-select v-model="filterForm.status" :placeholder="t('dao.allStatus')" clearable>
              <el-option :label="t('dao.all')" value="" />
              <el-option
                v-for="status in statusOptions"
                :key="status.value"
                :label="status.label"
                :value="status.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadProposals">{{ t('dao.query') }}</el-button>
            <el-button @click="resetFilter">{{ t('dao.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 提案列表 -->
      <el-card class="proposals-card">
        <el-table
          :data="proposals"
          v-loading="loading"
          style="width: 100%"
          @row-click="handleRowClick"
        >
          <el-table-column prop="id" :label="t('dao.proposalId')" width="100" />
          <el-table-column :label="t('dao.status')" width="120">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="t('dao.contractAddress')" min-width="200">
            <template #default="scope">
              {{ scope.row.contract || t('dao.daoSelfContract') }}
            </template>
          </el-table-column>
          <el-table-column :label="t('dao.transferAmount')" width="150">
            <template #default="scope">
              {{ formatBalance(scope.row.amount) }}
            </template>
          </el-table-column>
          <el-table-column :label="t('dao.action')" width="200" fixed="right">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click.stop="goToVote(scope.row.id)"
                v-if="scope.row.status === 'Ongoing'"
              >
                {{ t('dao.vote') }}
              </el-button>
              <el-button
                type="info"
                size="small"
                @click.stop="viewDetail(scope.row.id)"
              >
                {{ t('dao.detail') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination" v-if="total > 0">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>

        <el-empty v-if="!loading && proposals.length === 0" :description="t('dao.noProposals')" />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Plus } from "@element-plus/icons-vue";
import {
  getProposals,
  getProposalStatus,
  PropStatus,
  setDaoContractAddress,
} from "@/apis/dao";

const router = useRouter();
const { t } = useI18n();

const loading = ref(false);
const proposals = ref<any[]>([]);
const total = ref(0);

const filterForm = ref({
  status: "",
});

const pagination = ref({
  page: 1,
  size: 20,
});

const statusOptions = computed(() => [
  { label: t("dao.pending"), value: PropStatus.Pending },
  { label: t("dao.ongoing"), value: PropStatus.Ongoing },
  { label: t("dao.confirming"), value: PropStatus.Confirming },
  { label: t("dao.approved"), value: PropStatus.Approved },
  { label: t("dao.rejected"), value: PropStatus.Rejected },
  { label: t("dao.canceled"), value: PropStatus.Canceled },
]);

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

// 加载提案列表
const loadProposals = async () => {
  try {
    loading.value = true;
    const list = await getProposals(pagination.value.page - 1, pagination.value.size);
    
    // 获取每个提案的状态
    const proposalsWithStatus = await Promise.all(
      list.map(async (proposal: any, index: number) => {
        try {
          const status = await getProposalStatus(proposal.id || index);
          return {
            ...proposal,
            id: proposal.id || index,
            status: status,
          };
        } catch (error) {
          return {
            ...proposal,
            id: proposal.id || index,
            status: PropStatus.Pending,
          };
        }
      })
    );

    // 根据筛选条件过滤
    let filtered = proposalsWithStatus;
    if (filterForm.value.status) {
      filtered = proposalsWithStatus.filter(
        (p) => p.status === filterForm.value.status
      );
    }

    proposals.value = filtered;
    total.value = filtered.length;
  } catch (error) {
    console.error("加载提案列表失败:", error);
    proposals.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 重置筛选
const resetFilter = () => {
  filterForm.value.status = "";
  pagination.value.page = 1;
  loadProposals();
};

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.value.size = size;
  pagination.value.page = 1;
  loadProposals();
};

// 页码改变
const handlePageChange = (page: number) => {
  pagination.value.page = page;
  loadProposals();
};

// 行点击
const handleRowClick = (row: any) => {
  viewDetail(row.id);
};

// 查看详情
const viewDetail = (id: number) => {
  router.push(`/dao/vote/${id}`);
};

// 去投票
const goToVote = (id: number) => {
  router.push(`/dao/vote/${id}`);
};

// 去创建提案
const goToCreate = () => {
  router.push("/dao/create");
};

// 监听筛选条件变化
watch(
  () => filterForm.value.status,
  () => {
    pagination.value.page = 1;
    loadProposals();
  }
);

onMounted(async () => {
  // TODO: 需要根据实际情况设置 DAO 合约地址
  // setDaoContractAddress("0x...");
  
  await loadProposals();
});
</script>

<style lang="scss" scoped>
.dao-proposals {
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
  }

  .filter-card {
    margin-bottom: 20px;
  }

  .proposals-card {
    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
