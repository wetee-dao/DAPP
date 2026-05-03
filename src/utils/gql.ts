import axios from "axios";

export class GraphqlClient {
    baseUrl: string = "";
    constructor(url: string) {
        this.baseUrl = url
    };
    async query<T = any>(req: any): Promise<T> {
        let headers:any = {
            'Content-Type': 'application/json',
        }
        if (localStorage.getItem('token')) {
            headers['authorization'] = localStorage.getItem('token') ?? ""
        }
        let response = await axios.request({
            method: 'POST',
            data: req,
            headers: headers,
            url: this.baseUrl,
        })
        const body = response.data as { errors?: { message: string }[]; data?: unknown }
        if (body.errors?.length) {
            throw new Error(body.errors[0].message)
        }
        return body.data as T
    };
    async mut<T = any>(req: any): Promise<T> {
        return this.query<T>(req)
    };
}

