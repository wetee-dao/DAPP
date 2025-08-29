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

class SubstrateQueryApi {
    // api: ApiPromise | undefined
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
    async pods(args: Record<string, unknown>) {
        return await this.ink_query(this.cloudContract, "pods", args)
    }

    // query ink
    async ink_query(contanct: string, method: string, args: Record<string, unknown>) {
        let abi: Abi | undefined = undefined;
        if (contanct == this.cloudContract) {
            if (!this.cloudAbi) {
                this.cloudAbi = await this.getAbi(this.cloudAbiUrl)
            }
            abi = this.cloudAbi
        }

        if (contanct == this.subnetContract) {
            if (!this.subnetAbi) {
                this.subnetAbi = await this.getAbi(this.subnetAbiUrl)
            }
            abi = this.subnetAbi
        }

        const methodAbi = abi!.messages.find(item => item.method === method)
        if (!methodAbi) {
            throw new Error("method not found")
        }

        let inputData = methodAbi.toU8a(transformUserInput(abi!.registry, methodAbi.args, args));
        inputData = formatInputData(inputData)
        const response = await axios.get(this.queryUrl + "contracts/ink/" + contanct + "/runtime-query", {
            params: { caller: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", input_data: u8aToHex(inputData) },
            paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'brackets' }),
        })

        let resp = response.data.result
        if (resp.Ok.flags.bits == "1") {
            throw new Error("Contract reverted")
        }

        let data = decodeReturnValue(methodAbi.returnType, resp.Ok.data, abi!.registry) as any
        if (!data||data["Err"]){
            throw new Error("Contract reverted")
        }

        if (data["Ok"]) {
            data = data.Ok
        }

        return data
    }

    // query lastblock
    async lastBlock() {
        const response = await axios.get(this.queryUrl + "blocks/head/header?finalized=false")
        return response.data
    }

    // read contract abi
    async getAbi(url: string): Promise<Abi> {
        const response = await axios.get(url)
        return new Abi(response.data)
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

export const SubstrateQuery = new SubstrateQueryApi({
    cloudContract: "0x72381a1a0c2858fa134b89b72b054bcb51f80a6a",
    cloudAbiUrl: "contract/cloud.json",
    subnetContract: "0xb506e4c44ebbddc38440368f9b86d33b75a0784f",
    subnetAbiUrl: "contract/subnet.json",
})

