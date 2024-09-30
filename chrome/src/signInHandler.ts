import {environment} from "../../angular/src/environments/environment";
import to from "await-to-js";

export class SignInHandler {
    constructor(private apiUrl: string) {

    }

    async sendSignInRequest() {
        const url = `${this.apiUrl}/api/v2/sign-in`;
        const [err, res] = await to(fetch(url));
        if (err) {
            throw err;
        }
        return res.json();
    }

    async getUser(deviceCode: string) {
        const url = `${this.apiUrl}/api/v2/users/${deviceCode}`;
        const [err, res] = await to(fetch(url));
        if (err) {
            throw err;
        }
        return res.json();
    }

    async poleAuthStatus(deviceCode): Promise<any> {
        return new Promise((resolve, reject) => {
            const $intervalId = setInterval(async () => {
                const [err, resp] = await to(this.getUser(deviceCode));
                if (err) {
                    clearInterval($intervalId);
                    return reject(err);
                }
                if (resp && resp.user && resp.user.authStatus === 'completed') {
                    resolve(resp.user);
                    clearInterval($intervalId);
                    return;
                }
            }, 2000);
        });
    }
}