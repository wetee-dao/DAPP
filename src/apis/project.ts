import { getChainClient } from "@/plugins/chain";
import { deepCopy } from "@/utils/object";
import { ChainHexToString } from "@/utils/strings";

const defaultProject = {
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

    for (let i = 0; i < 20; i++) {
        if (getChainClient() == null) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    const pList = await getChainClient()!.query.weTEEProject.proxyProjects.entries(user);
    let datas = [
        {
            ...deepCopy(defaultProject),
            addr: user,
        }
    ]

    pList.forEach((d: any) => {
        const [key, exposure] = d;
        const item = exposure.toHuman();
        datas.push({
            id: key.toHuman()[1],
            name: ChainHexToString(item.name),
            desc: ChainHexToString(item.description),
            addr: item.daoAccountId,
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