<template>
    <div class="home">
        <div class="logo"><img src="https://wetee.app/imgs/vStaking/undefined.svg" /></div>
        <div class="name">{{ hexToString(app.name) }}</div>
        <div class="sktaing">Staking:&nbsp;{{ appStaking }} <div class="token_unit">wAPP</div>
        </div>
        <div class="actions flex ">
            <div class="action" @click="add">New Version</div>
            <div class="action outline" @click="stop()">Stop</div>
        </div>
        <div class="projectItem" :key="item.block" v-for="(item, index) in versions">
            <div class="dataImg">
                v{{ item.version }}
            </div>

            <div class="dataText">
                <div class="images" v-if="item.value">
                    <div class="image" v-for="image in item.value">{{ image.i }}</div>
                </div>
            </div>

            <!-- <div class="btn btn__primary" @click="deploy()">
                Deploy
            </div> -->
        </div>
    </div>
</template>

<script lang="ts" setup>
import useGlobelProperties from "@/plugins/globel";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { getNumstrfromChain } from "@/utils/substrate";
import { $getTxProvider, $getQueryApi } from "@/plugins/chain";
import { hexToString } from "@polkadot/util";
import { ElMessageBox, ElNotification } from "element-plus";
const global = useGlobelProperties()

const store = useStore();
const router = useRouter();
const route = useRoute();
const id = route.params.id.toString();
const app = ref<any>({});
const versions = ref<any>([]);
const appStaking = ref<number>(1);

const add = () => {
    global.$Build(router, store, {
        mod: id
    }, () => {
        getInfo()
    })
};

const deploy = () => {
    global.$Build(router, store, {}, () => {

    })
};

const stop = async () => {
    ElMessageBox.confirm('Are you sure to stop this app?', {})
        .then(async () => {
            await $getTxProvider(async (chain): Promise<void> => {
                if (!chain.client) {
                    return;
                }
                const client = chain.client;

                const signer = store.state.userInfo.addr;
                try {
                    const tx = client.tx.store.unregisterApp(
                        parseInt(id)
                    )

                    await chain.signAndSend(tx, signer, () => {

                    }, () => { })
                } catch (e: any) {
                    ElNotification({
                        title: 'Error',
                        message: "" + e.toString(),
                        type: 'error',
                    })
                }
            })
        })
        .catch(() => {
            // catch error
        })
};

onMounted(async () => {
    getInfo()
});

const getInfo = async () => {
    // app.value = await $getQueryApi().query("store", "apps", [id])

    // const appsVersion = await $getQueryApi().entries("store", "versionLists", [id])
    // versions.value = appsVersion.map((version: any) => {
    //     let v = version.value
    //     return {
    //         version: version.keys[1],
    //         block: getNumstrfromChain(v[1]),
    //         value: v[0],
    //     };
    // }).reverse()

    // appStaking.value = await $getQueryApi().query("store", "appStakings", [id])
}
</script>

<style lang="scss" scoped>
.logo {
    width: 90px;
    height: 90px;
    margin: 10px auto;
}

.name {
    font-size: 30px;
    text-align: center;
    margin-bottom: 5px;
    color: rgba($secondary-text-rgb, 1);
}

.sktaing {
    font-size: 17px;
    text-align: center;
    margin-bottom: 20px;
    color: rgba($secondary-text-rgb, 0.5);
}

.actions {
    justify-content: center;
    margin-bottom: 30px;

    .action {
        padding: 12px 18px;
        background-color: rgba($primary-text-rgb, 0.5);
        color: rgba($primary-bg-rgb, 1);
        margin: 0 5px;
        font-size: 14px;
        width: 88px;
        text-align: center;
        font-weight: bold;
        cursor: pointer;
    }

    .outline {
        background-color: rgba($primary-bg-rgb, 0.5);
        color: rgba($secondary-text-rgb, 1);
        border: 1px solid rgba($primary-text-rgb, 0.4);
    }
}

.token_unit {
    color: #ffffff;
    font-size: 12px;
    line-height: 1;
    font-weight: bold;
    padding: 3px 4px;
    background-color: #5b4600;
    border-radius: 2px;
    display: inline-block;
}

.projectItem {
    background-color: rgba($primary-bg-rgb, 1);
    border: 1Px solid rgba($secondary-text-rgb, 0.09);
    display: flex;
    align-items: center;
    padding: 0px 15px;
    cursor: pointer;
    margin-bottom: 20px;
    position: relative;

    .dataImg {
        width: 40px;
        height: 40px;
        padding: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 5%;
        word-break: break-all;
        text-align: center;
        overflow: hidden;
        border: 3px dotted rgba($secondary-text-rgb, 0.25);
        font-weight: bold;
        color: rgba($secondary-text-rgb, 0.5);
        margin: 15px 0;
    }

    .identicon {
        opacity: 0.8;
    }

    .gray-icon {
        font-size: 60px;

        .icon {
            font-size: 35px;
            font-weight: bold;
            color: $secondary-text;
        }
    }

    .dataText {
        margin-left: 20px;
        flex: 1;
        overflow: hidden;
        position: relative;
        z-index: 10;

        p:first-of-type {
            color: $secondary-text;
            font-size: 16px;
            font-weight: bold;
            line-height: 1.3;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;

            &::first-letter {
                text-transform: uppercase;
            }
        }

        p:last-of-type {
            color: $block;
            font-weight: bolder;
            color: $secondary-text;
            opacity: 0.6;
            line-height: 1.3;
            font-size: 13px;
            word-break: break-all;
        }
    }

    .images {
        .image {
            display: inline-block;
            border-radius: 3px;
            font-size: 14px;
            font-weight: 600;
            color: rgba($secondary-text-rgb, 0.5);
        }
    }
}

@media screen and (max-width: 570px) {
    .data {
        justify-content: center;
    }
}

@media screen and (max-width: 1010px) {
    .data {
        flex-wrap: wrap;
    }
}
</style>

<style lang="scss">
.light .projectItem {
    border: 2px solid rgba($secondary-text-rgb, 0.05) !important;
}
</style>