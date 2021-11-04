const defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

export class IRequest {
    constructor({url = "https://localhost:8000/", endpoint, method}) {
        this.url = url + endpoint;
        this.method = method;
    }

    async call() {
        return await fetch('');
    }

    async getJson(params = {}) {
        const rawResponse = await this.call(params);
        const response = await rawResponse;
        const jsonResponse = await response.json();

        return { status: response.status, data: jsonResponse };
    }
}

export class GetRequest extends IRequest {
    constructor({url, endpoint, method = "GET"}) {
        super({url, endpoint, method});
    }

    async call({params = "", token}){
        if(token){
            this.url += `${token}/`;
        }

        return await fetch(this.url + params, {
            method: this.method
        });
    }
}

export class PostRequest extends IRequest {
    constructor({url, endpoint, method = "POST"}) {
        super({url, endpoint, method});
    }

    async call({headers = defaultHeaders, body = {}, token}) {
        if(token){
            this.url += `${token}/`;
        }

        return await fetch(this.url, {
            method: this.method,
            headers,
            body
        });
    }
}