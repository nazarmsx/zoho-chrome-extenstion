import {Component, Inject, OnInit} from '@angular/core';
import {bindCallback} from 'rxjs';
import {map} from 'rxjs/operators';
import {TAB_ID} from '../../../../providers/tab-id.provider';
import {ChangeDetectorRef, NgZone} from '@angular/core';

@Component({
    selector: 'app-popup',
    templateUrl: 'popup.component.html',
    styleUrls: ['popup.component.scss']
})
export class PopupComponent implements OnInit {
    message: string;
    public loading: boolean;
    public status: string;

    constructor(@Inject(TAB_ID) readonly tabId: number, private ref: ChangeDetectorRef, public zone: NgZone) {
    }

    ngOnInit(): void {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.zone.run(() => {
                if (message.action === 'sign_in' && message.data.verification_uri_complete) {
                    chrome.tabs.create({url: message.data.verification_uri_complete})
                }
                this.loading = false;
                this.status = localStorage.getItem('auth_status');
                if (message.action === 'sign_in_completed') {
                    this.status = localStorage.getItem('auth_status');
                    this.loading = false;
                }
                if (message.action === 'sign_in_failed') {
                    this.status = localStorage.getItem('auth_status');
                    this.loading = false;
                }
                this.ref.markForCheck();
            });
        });
        this.status = localStorage.getItem('auth_status');
        if (this.status === 'pending') {
            this.loading = true;
        }
    }

    async onClick(): Promise<void> {
        this.message = await bindCallback<string>(chrome.tabs.sendMessage.bind(this, this.tabId, 'request'))()
            .pipe(
                map(msg =>
                    chrome.runtime.lastError
                        ? 'The current page is protected by the browser, goto: https://www.google.nl and try again.'
                        : msg
                )
            )
            .toPromise();
    }

    signIn() {
        this.loading = true;
        chrome.runtime.sendMessage({
            action: 'sign_in'
        })
    }

    signOut() {
        this.loading = true;
        chrome.runtime.sendMessage({
            action: 'sign_out'
        })
    }
}
