import { getHttpApi } from "@/plugins/chain";
import { deepCopy } from "@/utils/object";
import { ChainHexToString } from "@/utils/strings";

export const defaultProject = {
    id: "-1",
    name: "Default project",
    desc: "Default project, cannot be deleted.",
    addr: "",
};

let projectList: any[] | undefined = undefined;

export const getProjectList = async (user: string, refresh: boolean = false) => {
    if (projectList && !refresh && projectList[0].addr == user) {
        return projectList!;
    }

    const pList = await getHttpApi().entries("project","proxyProjects",[user])
    let datas = [
        {
            ...deepCopy(defaultProject),
            addr: user,
        }
    ]

    pList.forEach(({ keys, value }: any) => {
        datas.push({
            id: keys[1],
            name: ChainHexToString(value.name),
            desc: ChainHexToString(value.description),
            addr: value.daoAccountId,
        })
    });

    projectList = datas;
    return datas;
}

export const getProject = async (user: string, addr: string) => {
    const plist = await getProjectList(user);
    return plist.find((p: any) => p.addr == addr);
}

export const getProjectByID = async (user: string, id: string) => {
    const plist = await getProjectList(user);
    return plist.find((p: any) => p.id == id);
}