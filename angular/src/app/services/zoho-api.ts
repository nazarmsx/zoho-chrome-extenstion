import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {ZohoApiResponse} from '../models/zoho-api'
@Injectable({
    providedIn: 'root'
})
export class AnalyticQueriesService {
    private readonly baseUrl = 'https://accounts.zoho.eu';

    constructor(private http: HttpClient) {
    }

    requestSignIn() {
        const url = `${this.baseUrl}/oauth/v3/device/code?client_id=${environment.zohoClientId}&scope=AaaServer.profile.READ&grant_type=device_request`;
        this.http.get(url)
    }

}