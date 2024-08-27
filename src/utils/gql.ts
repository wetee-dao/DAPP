export class GraphqlClient {
    baseUrl: string = "";
    constructor(url: string) {
        this.baseUrl = url
    };
    async query(req: any) {
        let response = await fetch(this.baseUrl, {
            method: 'POST',
            body: JSON.stringify(req),
            headers: {
                'Content-Type': 'application/json',
                'authorization': localStorage.getItem('token') ?? "",
            },
        })
        let data = await response.json()
        return data.data
    };
    async mut(req: any) {
        let response = await fetch(this.baseUrl, {
            method: 'POST',
            body: JSON.stringify(req),
            headers: {
                'Content-Type': 'application/json',
                'authorization': localStorage.getItem('token') ?? "",
            },
        })
        let data = await response.json()
        return data.data
    };
}

