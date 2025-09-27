export type ChainInterface = {
    pods: (start: null | number, size: number) => Promise<any>

    createSecret: (key: string, value: string) => Promise<any>
    secrets: (addr: string, start: null | number, size: number) => Promise<any>
    deleteSecret: (id: string) => Promise<any>

    createDisk: (key: string, size: number) => Promise<any>
    disks: (addr: string, start: null | number, size: number) => Promise<any>
    deleteDisk: (id: string) => Promise<any>

    createPod: (
        name: string,
        pod_type: string,
        tee_type: string,
        containers: any[],
        region_id: number,
        level: number,
        worker_id: bigint,
    ) => Promise<any>
    stopPod: (podId: string) => Promise<any>
    restartPod: (podId: string) => Promise<any>
}
