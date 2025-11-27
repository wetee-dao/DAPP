export type ChainInterface = {
    /// secret
    createSecret: (key: string, hash: string) => Promise<any>
    secrets: (addr: string, start: null | number, size: number) => Promise<any>
    deleteSecret: (id: string) => Promise<any>

    /// disk
    createDisk: (key: string, size: number) => Promise<any>
    disks: (addr: string, start: null | number, size: number) => Promise<any>
    deleteDisk: (id: string) => Promise<any>

    /// pod
    pods: (start: null | number, size: number) => Promise<any>
    podInfo: (podId: string) => Promise<any>
    podExtInfo: (podId: string) => Promise<any>
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
    podReport: (podId: string) => Promise<any>

    /// pod container
    createContainer: (podId: string, c: any) => Promise<any>
    editContainer: (podId: string, cid: string, c: any) => Promise<any>
    delContainer: (podId: string, cid: string) => Promise<any>
}
