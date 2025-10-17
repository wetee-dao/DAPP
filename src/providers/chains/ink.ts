import axios from "axios";
import { Abi } from "@polkadot/api-contract";
import { u8aToHex, BN, hexToU8a, u8aConcat } from '@polkadot/util';
import { Bytes } from '@polkadot/types';
import { AnyJson, Registry, TypeDef } from "@polkadot/types/types";
import { ElNotification } from "element-plus";
import { ApiPromise, HttpProvider, Keyring } from "@polkadot/api";
import { toH160Address, transformUserInput } from "@/utils/ink";

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
        let pods = await this.ink_query(this.cloudContract, "userPods", {
            start: start,
            size: size
        })
        return pods
    }

    async podExtInfo(id: string){
        let pod = await this.ink_query(this.cloudContract, "podExtInfo",{
            podId: id,
        })

        return pod
    }

    // list secrets
    async secrets(addr: string, start: null | number, size: number) {
        const keyring = new Keyring();
        const ethAddr = toH160Address(keyring.decodeAddress(addr))
        const list = await this.ink_query(this.cloudContract, "userSecrets", {
            user: ethAddr,
            start: start,
            size: size
        })

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
        const list = await this.ink_query(this.cloudContract, "userDisks", {
            user: ethAddr,
            start: start,
            size: size
        })

        return list.map((item: any) => {
            return {
                id: item[0],
                data: item[1],
            }
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
            ElNotification({
                title: 'Error',
                message: "Ink contract method not found: " + method,
                type: 'error',
                duration: 15000,
            })
            throw new Error("method not found")
        }

        const userInfo = this.getCallerInfo()
        const params = transformUserInput(abi!.registry, methodAbi.args, args)

        // const inputData = methodAbi.toU8a(transformUserInput(abi!.registry, methodAbi.args, args));
        // const response = await axios.get(this.queryUrl + "contracts/ink/" + contract + "/dry-run", {
        //     params: { caller: userInfo.addr, inputData: u8aToHex(inputData), payValue: payValue },
        //     paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'brackets' }),
        // })

        let inputData = null
        // if (method == "delDisk") {
        //     inputData = methodAbi.toU8a(transformUserInput(abi!.registry, methodAbi.args, args));
        // } else {
            const paramsU8a = methodAbi.args.map(({ type: { lookupName, type } }, index) => {
                const p = abi.registry.createType(lookupName || type, params[index]).toU8a()
                if (type == "Address") {
                    return p.slice(1)
                }
                return p
            })
            inputData = u8aConcat(abi.registry.createType('ContractSelector', methodAbi.selector).toU8a(), ...paramsU8a)
        // }

        console.log("ink_builder contract", contract)
        console.log("            abi args", methodAbi.args)
        console.log("                args", transformUserInput(abi!.registry, methodAbi.args, args))
        console.log("            hex args", u8aToHex(inputData))

        const response = await this.tryRun(contract, userInfo.addr, u8aToHex(inputData), payValue)

        const resp = response.result
        let data = decodeReturnValue(methodAbi.returnType, resp.Ok.data, abi!.registry) as any
        if (resp.Ok.flags.bits == "1") {
            ElNotification({
                title: 'Error',
                message: "Ink contract call failed with contract error: " + data.Err,
                type: 'error',
                duration: 15000,
            })
            throw new Error("Ink contract call failed with contract error: " + data.Err)
        }

        if (response.result.Err) {
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
                inputData: u8aToHex(inputData),
                payValue: payValue.toString(),
            },
            gasConsumed: response.gasConsumed,
            gasRequired: response.gasRequired,
            storageDeposit: response.storageDeposit,
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

    async tryRun(address: string, caller: string, inputData: any, payValue: string) {
        const api = await ApiPromise.create({
            provider: new HttpProvider("https://xiaobai.asyou.me:30001/ws"),
        });

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
    subnetContract: "0x8cae9e8b063357d407760c78182ea24c37d9d26d",
    subnetAbiUrl: "contract/subnet.json",
    cloudContract: "0xd9602d94b92f5af709cb95ab159193930d4355f5",
    cloudAbiUrl: "contract/cloud.json",
})

