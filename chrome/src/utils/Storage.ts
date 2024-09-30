export class Storage {

    public setDeviceCode(deviceCode: string){
        localStorage.setItem('device_code', deviceCode);
    }

    public getDeviceCode(){
        return localStorage.getItem('device_code');
    }

    public getAuthStatus(){
        return localStorage.getItem('auth_status');
    }

    public setAuthStatus(authStatus: string){
        localStorage.setItem('auth_status', authStatus);
    }

    public getAccessToken(){
        return localStorage.getItem('access_token');
    }

    public setAccessToken(token: string){
        localStorage.setItem('access_token', token);
    }

    public clearAll(){
        this.setAccessToken(null);
        this.setAuthStatus(null);
        this.setDeviceCode(null);
    }
}