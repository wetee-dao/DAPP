<template>
    <div class="home">
        <div class="btns">
            <el-button size="large" plain @click="add()">
                <el-icon class="el-icon--left">
                    <Plus />
                </el-icon>Create New
            </el-button>
        </div>
        <el-table v-loading="loading" :element-loading-svg="svg" class="table"
            element-loading-svg-view-box="-10, -10, 50, 50" :data="disks" style="width: 100%">
            <el-table-column prop="id" label="ID" width="100">
                <template #default="scope">
                    # {{ scope.row.id }}
                </template>
            </el-table-column>
            <el-table-column prop="data.SecretSSD[0]" label="Key Name" width="180" />
            <el-table-column prop="data.SecretSSD[2]" label="Size" width="180" />
            <el-table-column prop="data.SecretSSD[1]" label="Hash" />
            <el-table-column fixed="right" label="Operations" width="150">
                <template #default="item">
                    <el-button link type="primary" size="small" @click="show(item.row)">
                        Show
                    </el-button>
                    <el-button link type="primary" size="small">Edit</el-button>
                    <el-button link type="primary" size="small" @click="del(item.row)">Del</el-button>
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
import { Plus } from '@element-plus/icons-vue'
import { stringToHex } from "@polkadot/util";
import { getSS5842, ss58toHex } from "@/utils/chain";
import { getProjectList } from "@/apis/project";
import { $getQueryApi, $getTxProvider } from "@/plugins/chain";
import { ElNotification } from "element-plus";
import { getUrlParams } from "@/utils/pop";
const global = useGlobelProperties()

const store = useStore();
const router = useRouter();
const projectid = getUrlParams("project_id");
const userAddr = store.state.userInfo.addr;
const theme = ref(document.documentElement.getAttribute("class"));

const loading = ref(true)
const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `
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
        getList().then((datas: any) => {

        })
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
        const tx = await chain.buildCall(dry)
        await chain.proxysignAndSend(tx, projectid!, signer, () => {
            ElNotification({
                title: 'Notice',
                message: "Disk delete successfully",
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
    box-sizing: border-box;
    width: 100%;
    padding: 80px 20px 0;

    :deep(.el-loading-mask) {
        background-color: rgba(0, 0, 0, 0.2)
    }

    .table {
        margin-top: 5px;
        background: transparent;

        :deep(tr) {
            background: transparent;
        }

        :deep(th.el-table__cell) {
            background: transparent;
        }
    }

    .btns {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
    }
}
</style>

<style lang="scss">
.light .projectItem {
    border: 1Px solid rgba($secondary-text-rgb, 0.09) !important;
}
</style>