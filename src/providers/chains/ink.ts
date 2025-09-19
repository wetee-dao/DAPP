import axios from "axios";
//@ts-ignore
import qs from "qs";
import { Abi } from "@polkadot/api-contract";
import { u8aToHex, BN } from '@polkadot/util';
import { Bytes } from '@polkadot/types';
import { AnyJson, Registry, TypeDef } from "@polkadot/types/types";
import { ElNotification } from "element-plus";
import { transformUserInput } from "@/utils/ink";

class InkApi {
    cloudAbi: Abi | undefined
    subnetAbi: Abi | undefined
    cloudContract: string
    cloudAbiUrl: string
    subnetContract: string
    subnetAbiUrl: string
    queryUrl: string

    constructor(ps: any) {
        this.cloudContract = ps.cloudContract
        this.cloudAbiUrl = ps.cloudAbiUrl
        this.subnetContract = ps.subnetContract
        this.subnetAbiUrl = ps.subnetAbiUrl
        this.queryUrl = ""
    }

    init(queryUrl: string, chainUrl: string) {
        this.queryUrl = queryUrl
    }

    // list pods
    async pods(start: null | number, size: number) {
        return await this.ink_query(this.cloudContract, "userPods", {
            start: start,
            size: size
        })
    }

    // create pod
    async createPod(
        name: string,
        pod_type: string,
        tee_type: string,
        containers: any[],
        region_id: number,
        level: number,
        worker_id: bigint,
    ) {
        return await this.ink_builder(this.cloudContract, "createPod", {
            name: name,
            podType: pod_type,
            teeType: tee_type,
            containers: containers,
            regionId: region_id,
            level: level,
            workerId: worker_id,
        }, "0")
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

    // query ink
    async ink_query(contract: string, method: string, args: Record<string, unknown>) {
        // console.log("ink_query", contract, method, args)
        const data = await this.ink_builder(contract, method, args, "0")
        return data.dry
    }

    // build inkcall params
    async ink_builder(contract: string, method: string, args: Record<string, unknown>, payValue: string) {
        const abi = await this.initContract(contract)
        const methodAbi = abi.messages.find(item => item.method === method)
        if (!methodAbi) {
            throw new Error("method not found")
        }

        const userInfo = this.getCallerInfo()
        let inputData = methodAbi.toU8a(transformUserInput(abi!.registry, methodAbi.args, args));
        const response = await axios.get(this.queryUrl + "contracts/ink/" + contract + "/dry-run", {
            params: { caller: userInfo.addr, inputData: u8aToHex(inputData), payValue: payValue },
            paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'brackets' }),
        })
        // const response = await this.tryRun(contract, userInfo.addr, u8aToHex(inputData), payValue)

        const resp = response.data.result
        let data = decodeReturnValue(methodAbi.returnType, resp.Ok.data, abi!.registry) as any
        if (resp.Ok.flags.bits == "1") {
            ElNotification({
                title: 'Error',
                message: "Ink contract call failed with contract error: " + data.Ok.Err,
                type: 'error',
                duration: 15000,
            })
            throw new Error("Ink contract call failed with contract error: " + data.Ok.Err)
        }

        console.log(response.data)
        if (response.data.result.Err) {
            ElNotification({
                title: 'Error',
                message: response.data.result.Err,
                type: 'error',
                duration: 15000,
            })
            throw new Error(response.data.error)
        }

        if (!data || data["Err"]) {
            ElNotification({
                title: 'Error',
                message: "Ink contract dry run reverted: " + data["Err"],
                type: 'error',
                duration: 15000,
            })
            throw new Error("Ink contract dry run reverted: " + data["Err"])
        }
        if (data["Ok"]) {
            data = data.Ok
        }

        return {
            dry: data,
            params: {
                contract: contract,
                inputData: inputData,
                payValue: payValue.toString(),
            },
            gasConsumed: response.data.gasConsumed,
            gasRequired: response.data.gasRequired,
            storageDeposit: response.data.storageDeposit,
        }
    }

    // query lastblock
    async lastBlock() {
        const response = await axios.get(this.queryUrl + "blocks/head/header?finalized=false")
        return response.data
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

    // async tryRun(address: string, caller: string, inputData: any, payValue: string) {
    //     const api = await ApiPromise.create({
    //         provider: new HttpProvider("https://xiaobai.asyou.me:30001/ws"),
    //     });

    //     const dryRunResult: any = await api.call.reviveApi.call(
    //         caller,
    //         address,
    //         api.registry.createType('Balance', BigInt(payValue)),
    //         null,
    //         null,
    //         inputData? hexToU8a(inputData): '',
    //     )

    //     return {
    //         data: dryRunResult.toHuman(),
    //     }
    // }
}

function decodeReturnValue(
    returnType: TypeDef | null | undefined,
    data: Bytes,
    registry: Registry,
): AnyJson {
    const returnTypeName = getReturnTypeName(returnType);
    let r: AnyJson = 'Decoding error';
    try {
        r = returnType ? registry.createTypeUnsafe(returnTypeName, [data]).toHuman() : '()';
    } catch (exception) {
        console.error(exception);
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
    cloudContract: "0x9a9feea1162aa52a6433fa4623d431c2610c0c49",
    cloudAbiUrl: "contract/cloud.json",
    subnetContract: "0x3dc0fb5b561202c45e2caa96fe1a011e6e7520f3",
    subnetAbiUrl: "contract/subnet.json",
})

