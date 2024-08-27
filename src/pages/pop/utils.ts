import { ElNotification } from "element-plus";

export function isValidDiskPath(path: string) {
    // 正则表达式用于匹配Windows和Linux路径格式
    var diskPathRegex = /^([a-zA-Z]:\\|\/[a-zA-Z0-9_-]+)+$/;

    // 使用正则表达式进行匹配
    return diskPathRegex.test(path);
}

export function isValidDiskPathDirectory(path: string) {
    // 正则表达式用于匹配Windows和Linux路径目录格式
    var diskPathDirectoryRegex = /^([a-zA-Z]:\\|\/[a-zA-Z0-9_-]+)+$/;

    // 使用正则表达式进行匹配
    return diskPathDirectoryRegex.test(path);
}

export function isNumeric(input: string) {
    var numericRegex = /^[0-9.]+$/;
    return numericRegex.test(input);
}

function hasNoSpace(input: string) {
    var noSpaceRegex = /^\S*$/; // 匹配不包含空格的字符串
    return noSpaceRegex.test(input);
}

export function validFormArray(client: any, form: any, index: number): any {
    if (!hasNoSpace(form.image) || form.image.length == 0) {
        ElNotification({
            title: 'Error',
            message: "Image cannot contain spaces or  can not be empty",
            type: 'error',
        })
        return { ok: false };
    }

    let command = null;
    if (form.command.length > 0) {
        let kv: any = {}
        kv[form.commandPrefix] = form.command;
        console.log(kv)
        command = client.createType('Command', kv);
    } else {
        command = client.createType('Command', { "NONE": null });
    }

    let env = [];
    if (form.env.length > 0) {
        for (let i = 0; i < form.env.length; i++) {
            const val: any = form.env[i];
            if (val.prefix == "Env") {
                if (!hasNoSpace(val.key) || val.key.length == 0) {
                    ElNotification({
                        title: 'Error',
                        message: "Env key cannot contain spaces or can not be empty",
                        type: 'error',
                    })
                    return { ok: false };
                }
            } else if (val.prefix == "File") {
                if (!isValidDiskPath(val.key) || val.key.length == 0) {
                    ElNotification({
                        title: 'Error',
                        message: "File path is not validable",
                        type: 'error',
                    })
                    return { ok: false };
                }
            }

            let kv: any = {}
            kv[val.prefix] = val.key;
            const key = client.createType('EnvKey', kv);
            env.push({
                index: index,
                k: key,
                v: val.value
            });
        }
    }

    let port = [];
    if (form.port.length > 0) {
        for (let i = 0; i < form.port.length; i++) {
            const val = form.port[i];
            if (!isNumeric(val.value)) {
                ElNotification({
                    title: 'Error',
                    message: "Port must be int",
                    type: 'error',
                })
                return { ok: false };
            }

            let kv: any = {}
            kv[val.prefix] = val.value;
            const p = client.createType('Service', kv);
            port.push(p);
        }
    }


    let disk = [];
    if (form.disk.length > 0) {
        for (let i = 0; i < form.disk.length; i++) {
            const val = form.disk[i];
            if (!isValidDiskPathDirectory(val.key) || val.key.length == 0) {
                ElNotification({
                    title: 'Error',
                    message: val.key + " is not a valid mount path",
                    type: 'error',
                })
                return { ok: false };
            }
            if (!isNumeric(val.value)) {
                ElNotification({
                    title: 'Error',
                    message: "Mount size must be int",
                    type: 'error',
                })
                return { ok: false };
            }

            const path = client.createType('DiskClass', { 'SSD': val.key });
            disk.push({
                path,
                size: parseInt(val.value) * 1024,
            });
        }
    }

    return {
        ok: true,
        data: {
            image: form.image,
            cpu: form.cpu,
            memory: form.memory,
            command,
            disk,
            env,
            port,
        }
    }
}
