<template>
    <div class="home">
        <div class="btns">
            <el-button size="large" plain @click="add()">
                <el-icon class="el-icon--left">
                    <Plus />
                </el-icon>{{ t('disk.createNew') }}
            </el-button>
        </div>
        <el-table v-loading="loading" :element-loading-svg="svgLoading"  class="table"
            element-loading-svg-view-box="10, 10, 50, 50" :data="disks">
            <el-table-column prop="id" :label="t('disk.id')" width="100">
                <template #default="scope">
                    # {{ scope.row.id }}
                </template>
            </el-table-column>
            <el-table-column prop="data.SecretSSD[0]" :label="t('disk.diskName')" width="180" />
            <el-table-column :label="t('disk.size')" width="180" >
                <template #default="scope">
                    {{ scope.row.data.SecretSSD[2] }} <span class="size">GB</span>
                </template>
            </el-table-column>
            <el-table-column :label="t('disk.hash')">
                <template #default="scope">
                    {{ scope.row.data.SecretSSD[1] }}&nbsp;&nbsp;<span v-if="!scope.row.data.SecretSSD[1]" class="action">{{ t('disk.initKey') }}</span>
                </template>
            </el-table-column>
            <el-table-column fixed="right" :label="t('disk.operations')" width="150">
                <template #default="item">
                    <el-button link type="primary" size="small" @click="show(item.row)">
                        {{ t('disk.show') }}
                    </el-button>
                    <el-button link type="primary" size="small">{{ t('disk.edit') }}</el-button>
                    <el-button link type="primary" size="small" @click="del(item.row)">{{ t('disk.delete') }}</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script lang="ts" setup>
import useGlobelProperties from "@/plugins/globel";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { Plus } from '@element-plus/icons-vue'
import { svgLoading } from "@/utils/loading";
import { $getQueryApi, $getTxProvider } from "@/plugins/chain";
import { ElNotification } from "element-plus";
import { getUrlParams } from "@/utils/pop";
const global = useGlobelProperties()
const { t } = useI18n();

const store = useStore();
const router = useRouter();
const projectid = getUrlParams("project_id");
const userAddr = store.state.userInfo.addr;

const loading = ref(true)
const disks = ref<any[]>([]);

onMounted(async () => {
    getList()
});

const getList = async () => {
    const list = await $getQueryApi().disks(userAddr, null, 1000)
    disks.value = list
    loading.value = false
};

const add = async () => {
    global.$AddDisk(router, store, () => {
        getList()
    })
}

const show = (item: any) => {
    console.log(item)
}

const del = async (item: any) => {
    await $getTxProvider(async (chain, builder): Promise<void> => {
        const signer = store.state.userInfo.addr;
        const dry = await builder.deleteDisk(
            item.id
        )
        const tx = await chain.buildCall(dry, signer)
        await chain.proxysignAndSend(tx, projectid!, signer, () => {
            ElNotification({
                title: t('common.notice'),
                message: t('disk.deleteSuccess'),
                type: 'success',
            })
            getList()
        }, () => {
        })
    });
}
</script>

<style lang="scss" scoped>
.home {
    :deep(.el-loading-mask) {
        background-color: rgba(0, 0, 0, 0.2)
    }

    .table {
        background: transparent;

        :deep(tr) {
            background: transparent;
        }

        :deep(th.el-table__cell) {
            background: transparent;
        }

        .size {
            // font-size: 12px;
            // font-weight: bold;
            color: $primary-text;
        }

        .action {
            background: rgba($primary-text-rgb, 0.2);
            font-weight: bold;
            cursor: pointer;
            padding: 1px 4px;
        }
    }

    .btns {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        // margin-bottom: 5px;
    }
}
</style>

<style lang="scss">
.light .projectItem {
    border: 1Px solid rgba($secondary-text-rgb, 0.09) !important;
}
</style>