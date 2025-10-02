<template>
    <div class="home">
        <div class="btns">
            <el-button size="large" plain @click="add()">
                <el-icon class="el-icon--left">
                    <Plus />
                </el-icon>Create New
            </el-button>
        </div>
        <el-table v-loading="loading" :element-loading-svg="svgLoading" class="table"
            element-loading-svg-view-box="-10, -10, 50, 50" :data="secrets" style="width: 100%">
            <el-table-column prop="id" label="ID" width="100" >
                <template #default="scope">
                    # {{ scope.row.id }}
                </template>
            </el-table-column>
            <el-table-column prop="key" label="Secret Name" width="180" />
            <el-table-column prop="hash" label="Hash" />
            <el-table-column fixed="right" label="Operations" width="109">
                <template #default="item">
                    <el-button link type="primary" size="small" @click="show(item.row)">
                        Show
                    </el-button>
                    <!-- <el-button link type="primary" size="small" @click="edit(item.row)">Edit</el-button> -->
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
import { svgLoading } from "@/utils/loading";
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
const secrets = ref<any[]>([]);

onMounted(async () => {
    getList()
});

const getList = async () => {
    const list = await $getQueryApi().secrets(userAddr, null, 1000)
    secrets.value = list
    loading.value = false
};

const add = async () => {
    global.$AddSecret(router, store, () => {
        getList().then((datas: any) => {

        })
    })
}

const edit = async (item: any) => {
    global.$AddSecret(router, store, () => {
        getList().then((datas: any) => {

        })
    })
}

const show = (item: any) => {
    console.log(item)
}

const del = async (item: any) => {
    await $getTxProvider(async (chain, builder): Promise<void> => {
        console.log(item.id)
        const signer = store.state.userInfo.addr;
        const dry = await builder.deleteSecret(
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

    :deep(.el-loading-mask){
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
    }

    .btns {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        margin-bottom: 5px;
    }
}
</style>

<style lang="scss">
.light .projectItem {
    border: 1Px solid rgba($secondary-text-rgb, 0.09) !important;
}
</style>