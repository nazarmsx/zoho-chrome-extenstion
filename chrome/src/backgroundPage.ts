import to from 'await-to-js'
import {SignInHandler} from './signInHandler';
import {Storage} from './utils/Storage'

console.log('background script loaded');
const apiUrl = 'http://localhost:4000';

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action === 'get_status') {
            const storage = new Storage();
            if(storage.getAuthStatus() !== 'completed'){
                return;
            }
            getCandidateStatus(request.email).then((res) => {
                sendResponse(res);
                chrome.tabs.sendMessage(sender.tab.id, {action: request.action, res: res});
            });
        }
        if (request.action === 'add_candidate') {
            const storage = new Storage();
            if(storage.getAuthStatus() !== 'completed'){
                return;
            }
            addCandidate(request.candidate).then((res) => {
                chrome.tabs.sendMessage(sender.tab.id, {action: request.action, res: res});
            })
        }
        if (request.action === 'sign_in') {
            const handler = new SignInHandler(apiUrl);
            handler.sendSignInRequest().then((res) => {
                const storage = new Storage();
                if (res && res.device_code) {
                    storage.setDeviceCode(res.device_code);
                    storage.setAuthStatus('pending');
                    handler.poleAuthStatus(res.device_code).then((data) => {
                        if (data && data.authStatus === 'completed') {
                            storage.setAuthStatus('completed');
                            storage.setAccessToken(data.token);
                            chrome.runtime.sendMessage({action: 'sign_in_completed', data: {}});
                        }
                    }).catch((err) => {
                        console.error(err);
                        storage.clearAll();
                        chrome.runtime.sendMessage({action: 'sign_in_failed', data: {}});
                    })

                } else {
                    storage.setDeviceCode(null);
                    storage.setAuthStatus(null)
                }
                chrome.runtime.sendMessage({action: 'sign_in', data: res});

            })
        }
        if (request.action === 'sign_out') {
            const storage = new Storage();
            storage.clearAll();
            chrome.runtime.sendMessage({action: 'sign_in_failed', data: {}});
        }
        if (request.action === 'error_notification') {
            showErrorNotification(request.error)
        }
        return true;
    });

async function getCandidateStatus(email: string, options?: any): Promise<any> {
     // email = '9w56iymarshalofficial@gmail.com';
    const storage = new Storage();
    const [err, res] = await to(fetch(`${apiUrl}/api/v2/candidates/${email}`, {
        headers: {
            'x-access-token': storage.getAccessToken()
        } as any
    }));
    if (res.status === 401 && !(options && !options.token_refreshed)) {
        await refreshToken();
        return getCandidateStatus(email, {token_refreshed: true})
    }
    if (err) {
        showErrorNotification(err);
        console.error(err);
        return null;
    }
    return res.json();
}

async function addCandidate(candidate: any): Promise<any> {
    // candidate.Email = makeid(5) + candidate.Email;
    const storage = new Storage();
    const [err, res] = await to(fetch(`${apiUrl}/api/candidates`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': storage.getAccessToken()
        } as any,
        body: JSON.stringify(candidate)
    }));
    if (err) {
        console.error(err);
        return null;
    }
    return res.json();
}

async function refreshToken(): Promise<any> {
    const storage = new Storage();
    const [err, res] = await to(fetch(`${apiUrl}/api/v2/users/tokens`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': storage.getAccessToken()
        } as any,
    }));
    if (err) {
        console.error(err);
        showErrorNotification(err);
        return null;
    }
    if (res && res.status === 200) {
        const body = await res.json();
        storage.setAccessToken(body.access_token);
    }
    return
}

function checkAuthStatus() {
    const storage = new Storage();
    if(storage.getAuthStatus() === 'pending'){
        storage.clearAll();
    }
}


window.onerror = function (msg, url, lineNo, columnNo, error) {
    showErrorNotification(error.toString());
    return false;
};

function showErrorNotification(error) {
    chrome.notifications.create('', {
        title: 'Something went wrong',
        message: error,
        iconUrl: '/assets/warning.png',
        type: 'basic'
    });
}

function makeid(length: number) {
    let result           = [];
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result.push(characters.charAt(Math.floor(Math.random() *
            charactersLength)));
    }
    return result.join('');
}


checkAuthStatus();
