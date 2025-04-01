import axios from "axios";

export async function getNetworkLatency(url: string) {
    const startTime = performance.now(); // 记录请求开始时间

    try {
        await axios.get(url,{
            timeout: 2000
        });
        const endTime = performance.now(); // 记录请求结束时间
        const latency = endTime - startTime; // 计算延迟

        return latency;
    } catch (error) {
        // console.error('Error:', error);
    }

    return null;
}