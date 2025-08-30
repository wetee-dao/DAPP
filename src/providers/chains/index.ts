export type ChainInterface = {
    pods: (start: null | number, size: number) => Promise<any>

    createPod:  (
        name: string,
        pod_type: string,
        tee_type: string,
        containers: any[],
        region_id: number,
        level: number,
        worker_id: bigint,
        payValue: string,
    ) => Promise<any>
}
