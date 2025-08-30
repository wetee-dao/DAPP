import axios from "axios";
//@ts-ignore
import qs from "qs";
import { Abi } from "@polkadot/api-contract";
import { u8aToHex, hexToU8a, u8aWrapBytes, BN } from '@polkadot/util';
import { Bytes, createType } from '@polkadot/types';
import { AnyJson, Registry, TypeDef } from "@polkadot/types/types";
import { format } from "path";
import { ApiPromise, HttpProvider } from "@polkadot/api";
import { chainJson } from "@/utils/chain";

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
        // this.api = await ApiPromise.create({
        //     provider: new HttpProvider(chainUrl.replace("wss://", "https://").replace("ws://", "http://")),
        //     types: chainJson,
        // });
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
        payValue: string,
    ) {
        return await this.ink_builder(this.cloudContract, "createPod", {
            name: name,
            pod_type: pod_type,
            tee_type: tee_type,
            containers: containers,
            region_id: region_id,
            level: level,
            worker_id: worker_id,
        }, payValue)
    }

    // query ink
    async ink_query(contract: string, method: string, args: Record<string, unknown>) {
        let abi = await this.initContract(contract)
        const methodAbi = abi.messages.find(item => item.method === method)
        if (!methodAbi) {
            throw new Error("method not found")
        }

        let userInfo = this.getCallerInfo()
        let inputData = methodAbi.toU8a(transformUserInput(abi.registry, methodAbi.args, args));
        inputData = formatInputData(inputData)
        const response = await axios.get(this.queryUrl + "contracts/ink/" + contract + "/dry-run", {
            params: { caller: userInfo.addr, inputData: u8aToHex(inputData), payValue: "0" },
            paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'brackets' }),
        })

        let resp = response.data.result
        if (!resp || resp["Err"]) {
            throw new Error("Chain error")
        }

        if (resp.Ok.flags.bits == "1") {
            throw new Error("Contract reverted")
        }

        let data = decodeReturnValue(methodAbi.returnType, resp.Ok.data, abi!.registry) as any
        if (!data || data["Err"]) {
            throw new Error("Contract reverted")
        }

        if (data["Ok"]) {
            data = data.Ok
        }

        return data
    }

    // build inkcall params
    async ink_builder(contract: string, method: string, args: Record<string, unknown>, payValue: string) {
        let abi = await this.initContract(contract)
        const methodAbi = abi.messages.find(item => item.method === method)
        if (!methodAbi) {
            throw new Error("method not found")
        }

        let userInfo = this.getCallerInfo()
        let inputData = methodAbi.toU8a(transformUserInput(abi!.registry, methodAbi.args, args));
        inputData = formatInputData(inputData)
        const response = await axios.get(this.queryUrl + "contracts/ink/" + contract + "/dry-run", {
            params: { caller: userInfo.addr, inputData: u8aToHex(inputData), payValue: payValue },
            paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'brackets' }),
        })

        let resp = response.data.result
        if (resp.Ok.flags.bits == "1") {
            throw new Error("Contract reverted")
        }

        let data = decodeReturnValue(methodAbi.returnType, resp.Ok.data, abi!.registry) as any
        if (!data || data["Err"]) {
            throw new Error("Contract dry run reverted")
        }

        if (data["Ok"]) {
            data = data.Ok
        }

        return {
            dry: data,
            params: {
                contract: contract,
                inputData: u8aToHex(inputData),
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

function transformUserInput(
    registry: Registry,
    messageArgs: any[],
    values?: Record<string, unknown>,
): unknown[] {
    return messageArgs.map(({ name, type: { type } }) => {
        const value = values ? values[name] : null;
        if (type === 'Balance') {
            return registry.createType('Balance', value);
        }
        if (type === 'U256') {
            return registry.createType('U256', value);
        }
        return value;
    });
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
    cloudContract: "0x72381a1a0c2858fa134b89b72b054bcb51f80a6a",
    cloudAbiUrl: "contract/cloud.json",
    subnetContract: "0xb506e4c44ebbddc38440368f9b86d33b75a0784f",
    subnetAbiUrl: "contract/subnet.json",
})

