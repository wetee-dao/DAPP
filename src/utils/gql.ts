import axios from "axios";

export class GraphqlClient {
    baseUrl: string = "";
    constructor(url: string) {
        this.baseUrl = url
    };
    async query(req: any) {
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
        console.log(response)
        return response.data.data
    };
    async mut(req: any) {
        return this.query(req)
    };
}

