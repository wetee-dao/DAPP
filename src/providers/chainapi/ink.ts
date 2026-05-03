import axios from "axios";
import { Abi } from "@polkadot/api-contract";
import { u8aToHex, BN, u8aConcat } from '@polkadot/util';
import { Bytes } from '@polkadot/types';
import { AnyJson, Registry, TypeDef } from "@polkadot/types/types";
import { ElNotification } from "element-plus";
import { ApiPromise, HttpProvider, Keyring } from "@polkadot/api";
import { toH160Address, transformUserInput } from "@/utils/substrate_ink";
import { getBnFromChain, showToken } from "@/utils/substrate";
import { getMainChainCloudContract, getMainChainSubnetContract } from "@/config";
import type { PodPrepayEstimateInput } from "@/utils/podContractPrepay";
import {
    assetPriceFromInkHuman,
    mintIntervalFromInkHuman,
    perMintResourceAbstractU64,
    runPriceFromInkHuman,
    totalPrepayPlanckFromContract,
} from "@/utils/podContractPrepay";

class InkApi {
    cloudAbi: Abi | undefined
    subnetAbi: Abi | undefined
    cloudContract: string
    cloudAbiUrl: string
    subnetContract: string
    subnetAbiUrl: string
    chainUrl: string
    /** 与 `chainUrl` 对应的 HTTP(S) RPC，用于复用 `ApiPromise`，避免每次请求重复拉 metadata */
    private httpApi: ApiPromise | null = null
    private httpApiRpcUrl = ''

    constructor(ps: any) {
        this.cloudContract = ps.cloudContract
        this.cloudAbiUrl = ps.cloudAbiUrl
        this.subnetContract = ps.subnetContract
        this.subnetAbiUrl = ps.subnetAbiUrl
        this.chainUrl = ""
    }

    init(chainUrl: string) {
        this.chainUrl = chainUrl
    }

    private httpRpcEndpoint(): string {
        return this.chainUrl.replace(/^ws/, 'http')
    }

    /** 同一 RPC URL 复用单个 ApiPromise；URL 变化时断开旧实例再建新的 */
    private async getHttpApi(): Promise<ApiPromise> {
        const url = this.httpRpcEndpoint().trim()
        if (!url) {
            throw new Error('Ink chainUrl is empty')
        }
        if (this.httpApi && this.httpApiRpcUrl === url) {
            return this.httpApi
        }
        if (this.httpApi) {
            await this.httpApi.disconnect().catch(() => undefined)
            this.httpApi = null
            this.httpApiRpcUrl = ''
        }
        const api = await ApiPromise.create({
            provider: new HttpProvider(url),
        })
        this.httpApi = api
        this.httpApiRpcUrl = url
        return api
    }

    async nativeBalance(addr: string) {
        const api = await this.getHttpApi()

        const account = await api.query.system.account(addr)
        const data = account.toHuman() as any

        return {
            name: api.registry.chainTokens[0],
            value: showToken(getBnFromChain(data.data.free), api.registry.chainDecimals[0])
        }
    }

    async contactInfo(h160Addr: string) {
        const api = await this.getHttpApi()

        const account = await api.call.reviveApi.accountId(h160Addr)
        const balance = await this.nativeBalance(account.toHuman() as string)

        return {
            ss58: account.toHuman(),
            balance: balance,
        }
    }

    // list pods
    async pods(start: null | number, size: number) {
        let pods = await this.ink_query(this.cloudContract, "userPods", {
            start: start,
            size: size
        })
        return pods
    }

    async podInfo(podId: string) {
        let pods = await this.ink_query(this.cloudContract, "podsByIds", {
            podIds: [podId]
        })
        if (pods.length == 0) {
            throw Error("pod not found")
        }
        return pods[0]
    }

    async podExtInfo(id: string) {
        let pod = await this.ink_query(this.cloudContract, "podExtInfo", {
            podId: id,
        })

        return pod
    }

    async podReport(id: string) {
        let pod = await this.ink_query(this.cloudContract, "podReport", {
            podId: id,
        })

        return pod
    }

    // list secrets
    async secrets(addr: string, start: null | number, size: number) {
        const keyring = new Keyring();
        const ethAddr = toH160Address(keyring.decodeAddress(addr))
        let list = await this.ink_query(this.cloudContract, "userSecrets", {
            user: ethAddr,
            start: start,
            size: size
        })

        if (!list) {
            return []
        }

        return list.map((item: any) => {
            return {
                id: item[0],
                key: item[1].k,
                hash: item[1].hash_,
                minted: item[1].minted,
            }
        })
    }

    // list disks
    async disks(addr: string, start: null | number, size: number) {
        const keyring = new Keyring();
        const ethAddr = toH160Address(keyring.decodeAddress(addr))
        let list = await this.ink_query(this.cloudContract, "userDisks", {
            user: ethAddr,
            start: start,
            size: size
        })

        if (!list) {
            return []
        }

        return list.map((item: any) => {
            return {
                id: item[0],
                data: item[1],
            }
        })
    }

    // create pod（pay_value：随调用转入的原生代币最小单位数量，用于预付；pay_asset：计费资产 ID）
    async createPod(
        name: string,
        pod_type: string,
        tee_type: string,
        containers: any[],
        region_id: number,
        level: number,
        pay_asset: number,
        worker_id: bigint,
        duration_blocks: number,
        pay_value: string,
    ) {
        return await this.ink_builder(this.cloudContract, "createPod", {
            name: name,
            podType: pod_type,
            teeType: tee_type,
            containers: containers,
            regionId: region_id,
            level: level,
            payAsset: pay_asset,
            workerId: worker_id,
            durationBlocks: duration_blocks,
        }, pay_value)
    }

    // restart pod
    async restartPod(podId: string) {
        return await this.ink_builder(this.cloudContract, "restartPod", {
            podId: new BN(podId)
        }, "0")
    }

    // stop pod
    async stopPod(podId: string) {
        return await this.ink_builder(this.cloudContract, "stopPod", {
            podId: new BN(podId)
        }, "0")
    }

    async createSecret(key: string, hash: string) {
        return await this.ink_builder(this.cloudContract, "createSecret", {
            key: key,
            hash: hash,
        }, "0")
    }

    async deleteSecret(id: string) {
        return await this.ink_builder(this.cloudContract, "delSecret", {
            index: new BN(id),
        }, "0")
    }

    async createDisk(key: string, size: number) {
        return await this.ink_builder(this.cloudContract, "createDisk", {
            key: key,
            size: size,
        }, "0")
    }

    async deleteDisk(id: string) {
        return await this.ink_builder(this.cloudContract, "delDisk", {
            diskId: new BN(id),
        }, "0")
    }

    // container
    async createContainer(podId: string, c: any) {
        return await this.ink_builder(this.cloudContract, "editContainer", {
            podId: new BN(podId),
            containers: [{
                etype: { INSERT: null },
                container: c,
            }]
        }, "0")
    }
    async editContainer(podId: string, cid: string, c: any) {
        return await this.ink_builder(this.cloudContract, "editContainer", {
            podId: new BN(podId),
            containers: [{
                etype: { UPDATE: new BN(cid) },
                container: c,
            }]
        }, "0")
    }
    async delContainer(podId: string, cid: string) {
        return await this.ink_builder(this.cloudContract, "editContainer", {
            podId: new BN(podId),
            containers: [{
                etype: { REMOVE: new BN(cid) },
                container: {},
            }]
        }, "0")
    }

    /**
     * 按 Subnet（level_price、asset）与 Cloud（mint_interval）估算 create_pod 预付（Planck），与 mint_pod 计费口径一致。
     */
    async estimatePodPrepay(input: PodPrepayEstimateInput): Promise<string | null> {
        const mintDry = await this.ink_query(this.cloudContract, "mintInterval", {}, true)
        if (mintDry == null) {
            return null
        }
        const mintInterval = mintIntervalFromInkHuman(mintDry)
        if (!mintInterval) {
            return null
        }

        const lpDry = await this.ink_query(this.subnetContract, "levelPrice", { level: input.level }, true)
        if (lpDry == null) {
            return null
        }
        const lp = runPriceFromInkHuman(lpDry)
        if (!lp) {
            return null
        }

        const assetDry = await this.ink_query(this.subnetContract, "asset", { id: input.payAsset }, true)
        if (assetDry == null) {
            return null
        }
        const price = assetPriceFromInkHuman(assetDry)
        if (!price) {
            return null
        }

        const abstract = perMintResourceAbstractU64(input.teeType, input.containers, lp, input.diskGb)
        const total = totalPrepayPlanckFromContract(abstract, price, input.durationBlocks, mintInterval)
        return total > 0n ? total.toString() : null
    }

    // query ink
    async ink_query(contract: string, method: string, args: Record<string, unknown>, silent = false) {
        const data = await this.ink_builder(contract, method, args, "0", { silent })
        if (data.dry == 'Decoding error') {
            return null
        }
        return data.dry
    }

    // build inkcall params
    async ink_builder(
        contract: string,
        method: string,
        args: Record<string, unknown>,
        payValue: string,
        options?: { silent?: boolean },
    ) {
        const silent = options?.silent === true
        const notifyErr = (message: string) => {
            if (!silent) {
                ElNotification({
                    title: 'Error',
                    message,
                    type: 'error',
                    duration: 15000,
                })
            }
        }

        const abi = await this.initContract(contract)
        const methodAbi = abi.messages.find(item => item.method === method)
        if (!methodAbi) {
            notifyErr("Ink contract method not found: " + method)
            throw new Error("method not found")
        }

        const userInfo = this.getCallerInfo()
        const params = transformUserInput(abi!.registry, methodAbi.args, args)

        let inputData = null
        const paramsU8a = methodAbi.args.map(({ type: { lookupName, type } }, index) => {
            const p = abi.registry.createType(lookupName || type, params[index]).toU8a()
            if (type == "Address") {
                return p.slice(1)
            }
            return p
        })
        inputData = u8aConcat(abi.registry.createType('ContractSelector', methodAbi.selector).toU8a(), ...paramsU8a)

        console.log("ink_builder contract", contract)
        console.log("              method", methodAbi.method)
        console.log("                args", args)
        console.log("                args", transformUserInput(abi!.registry, methodAbi.args, args))
        console.log("            hex args", u8aToHex(inputData))

        const response = await this.tryRun(contract, userInfo.addr, u8aToHex(inputData), payValue)
        const resp = response.result

        if (resp.Err) {
            notifyErr(String(resp.Err))
            throw new Error(resp.Err)
        }

        let retutnData = decodeReturnValue(methodAbi.returnType, resp.Ok.data, abi!.registry) as any
        if (resp.Ok.flags.bits == "1") {
            notifyErr("Ink contract call failed with contract error: " + (retutnData.Err || retutnData.Ok.Err))
            throw new Error("Ink contract call failed with contract error: " + (retutnData.Err || retutnData.Ok.Err))
        }

        if (!retutnData || retutnData["Err"]) {
            notifyErr("Ink contract dry run reverted: " + retutnData["Err"])
            throw new Error("Ink contract dry run reverted: " + retutnData["Err"])
        }

        return {
            dry: retutnData,
            params: {
                contract: contract,
                inputData: u8aToHex(inputData),
                payValue: payValue.toString(),
            },
            gasConsumed: response.weightConsumed,
            gasRequired: response.weightRequired,
            storageDeposit: response.storageDeposit,
        }
    }

    // init contract
    async initContract(contract: string) {
        let abi: Abi | undefined = undefined;
        if (contract == this.cloudContract) {
            if (!this.cloudAbi) {
                this.cloudAbi = await this.getAbi(this.cloudAbiUrl)
            }
            abi = this.cloudAbi
        }

        if (contract == this.subnetContract) {
            if (!this.subnetAbi) {
                this.subnetAbi = await this.getAbi(this.subnetAbiUrl)
            }
            abi = this.subnetAbi
        }

        if (!abi) {
            throw new Error("abi not found")
        }

        return abi!
    }

    // read contract abi
    async getAbi(url: string): Promise<Abi> {
        const response = await axios.get(url)
        return new Abi(response.data)
    }

    // get caller info
    getCallerInfo() {
        let userInfo = null
        if (window.localStorage.getItem("userInfo")) {
            userInfo = JSON.parse(window.localStorage.getItem("userInfo") || "{}")
        }

        return userInfo
    }

    // try run
    async tryRun(address: string, caller: string, inputData: any, payValue: string) {
        const api = await this.getHttpApi()

        const dryRunResult: any = await api.call.reviveApi.call(
            caller,
            address,
            api.registry.createType('Balance', BigInt(payValue)),
            null,
            null,
            inputData ? inputData : '',
        )

        let dryRunResultJson = dryRunResult.toHuman();
        const result = dryRunResult.result;
        if (result.isErr && result.asErr.isModule) {
            const moduleError = api.registry.findMetaError(result.asErr.asModule)
            dryRunResultJson.result = {
                "Err": moduleError.section + " pallet error " + moduleError.name + ", " + moduleError.docs.join("  ")
            }
        }

        return dryRunResultJson
    }
}

function decodeReturnValue(
    returnType: TypeDef | null | undefined,
    data: Bytes,
    registry: Registry,
): AnyJson {
    let returnTypeName = getReturnTypeName(returnType);
    const resultInkErrSuffix = ', InkPrimitivesLangError>';
    if (
        returnTypeName.startsWith('Result<') &&
        returnTypeName.endsWith(resultInkErrSuffix)
    ) {
        returnTypeName = returnTypeName.slice(
            'Result<'.length,
            returnTypeName.length - resultInkErrSuffix.length,
        );
    }
    console.log("returnTypeName", returnTypeName)

    let r: AnyJson = 'Decoding error';
    try {
        r = returnType ? registry.createTypeUnsafe(returnTypeName, [data]).toHuman() : '()';
    } catch (exception) {
        console.error(exception);
        throw new Error("Decoding error: " + exception);
    }
    return r;
}

function getReturnTypeName(type: TypeDef | null | undefined) {
    return type?.lookupName || type?.type || '';
}

function formatInputData(arr: Uint8Array): Uint8Array {
    if (arr.length === 0) {
        return arr;
    }
    const newArr = new Uint8Array(arr.length - 1);
    newArr.set(arr.subarray(1));
    return newArr;
}

export const Ink = new InkApi({
    subnetContract: getMainChainSubnetContract(),
    subnetAbiUrl: "contract/subnet.json",
    cloudContract: getMainChainCloudContract(),
    cloudAbiUrl: "contract/cloud.json",
})
