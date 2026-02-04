<template>
  <div class="dao-proposals">
    <div class="container">
      <div class="header">
        <h1>提案列表</h1>
        <el-button type="primary" @click="goToCreate">
          <el-icon><Plus /></el-icon>
          发起提案
        </el-button>
      </div>

      <!-- 筛选器 -->
      <el-card class="filter-card">
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="状态筛选">
            <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
              <el-option label="全部" value="" />
              <el-option
                v-for="status in statusOptions"
                :key="status.value"
                :label="status.label"
                :value="status.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadProposals">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
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
          <el-table-column prop="id" label="提案ID" width="100" />
          <el-table-column label="状态" width="120">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="合约地址" min-width="200">
            <template #default="scope">
              {{ scope.row.contract || "DAO合约自身" }}
            </template>
          </el-table-column>
          <el-table-column label="转账金额" width="150">
            <template #default="scope">
              {{ formatBalance(scope.row.amount) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click.stop="goToVote(scope.row.id)"
                v-if="scope.row.status === 'Ongoing'"
              >
                投票
              </el-button>
              <el-button
                type="info"
                size="small"
                @click.stop="viewDetail(scope.row.id)"
              >
                详情
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

        <el-empty v-if="!loading && proposals.length === 0" description="暂无提案" />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { Plus } from "@element-plus/icons-vue";
import {
  getProposals,
  getProposalStatus,
  PropStatus,
  setDaoContractAddress,
} from "@/apis/dao";

const router = useRouter();

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

const statusOptions = [
  { label: "待处理", value: PropStatus.Pending },
  { label: "进行中", value: PropStatus.Ongoing },
  { label: "确认中", value: PropStatus.Confirming },
  { label: "已批准", value: PropStatus.Approved },
  { label: "已拒绝", value: PropStatus.Rejected },
  { label: "已取消", value: PropStatus.Canceled },
];

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
