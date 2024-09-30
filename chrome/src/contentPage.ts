import * as $ from 'jquery';
import * as toastr from 'toastr';
import {getIcon} from './utils/ZohoIcon';
chrome.runtime.onMessage.addListener(async (request, sender, respond) => {

    if (request.action === 'get_status') {
        await handleCandidateStatus(request.res);
    }
    if (request.action === 'add_candidate') {
        await handleAddCandidateResp(request.res);
    }
    return true;
});
setTimeout(() => {
    getUserStatus()
}, 200);

async function handleCandidateStatus(data) {
    if (data && data.candidate) {
        markUserAsRegistered(data.candidate);
    } else {
        addBtn()
    }
}

async function handleAddCandidateResp(resp) {
    $('#add-zoho-candidate').remove();
    if(resp.error && resp.error.code){
        toastr.error(resp.error.code, 'Something went wrong!')
    }
    if(resp.candidate){
        toastr.success('Candidate was successfully imported!', 'Success!')
    }
    getUserStatus();
}

function markUserAsRegistered(candidate: any) {
    $('user-picture').parent().siblings('p').first().prepend(`<h5 style="color: black; font-weight: bold;"><a target="_blank" href="https://recruit.zoho.eu/recruit/org20065965611/EntityInfo.do?module=Candidates&id=${candidate.id}">${getIcon()}</a> ${candidate['Candidate Status']}</h5>`)
}

function addBtn() {
    $('user-picture').parent().siblings('p').first().prepend('<h5><button type="button" id="add-zoho-candidate" class="btn btn-success" ><span id="add-loader" style="display: none;" class="spinner-border spinner-border-sm" role="status" ></span>Додати в Zoho</button></h5>')
    $('#add-zoho-candidate').on("click", function () {
        const userObject: any = {
            Email: getEmail()
        };
        $('#add-zoho-candidate').attr('disabled', 'disabled');
        $('#add-loader').css('display', 'inherit');
        const containerRef = $('a[href^="mailto:"]');
        const items = containerRef.first().parent().text().trim().split('\n');
        items.forEach((profileField) => {
            profileField = profileField.trim();
            if (profileField.startsWith('Skype:')) {
                userObject['Skype_ID'] = profileField.replace('Skype:', '').trim()
            }
            if (profileField.startsWith('Телефон:')) {
                userObject.Mobile = profileField.replace('Телефон:', '').trim()
            }
            if (profileField.startsWith('Telegram:')) {
                userObject.Telegram = profileField.replace('Telegram:', '').trim()
            }
        });
        userObject.cvLink = containerRef.first().parent().find('a').eq(1).attr('href');
        const name = $('user-picture').parent().siblings('h5').first().find('a').eq(0).text().trim();
        userObject.First_Name = name.split(' ')[0];
        userObject.Last_Name = name.split(' ')[1];
        userObject.Current_Position = 'Candidate';
        userObject.Candidate_Status = 'New';
        userObject.Source = 'Djinni';
        userObject.Salary = getSalary();
        userObject.Commission = getCommission();
        userObject.Linkedin_URL = getLinkedin();
        userObject.Djinni_URL = userObject.cvLink;

        if (!userObject.First_Name) {
            userObject.First_Name = ' ';
        }
        if (!userObject.Last_Name) {
            userObject.Last_Name = ' ';
        }
        userObject.profileLink = 'https://djinni.co' + containerRef.first().parent().find('a').eq(0).attr('href');
        sendAddCandidateToZohoRequest(userObject);
    });
}

function getEmail() {
    return $('a[href^="mailto:"]').first().text();
}

function getSalary() {
    const text = $('.page-header h3').text().split(',');
    let salary = '';
    text.forEach((str) => {
        if (str.indexOf('$') !== -1) {
            salary = str.substr(str.indexOf('$'));
        }
    });
    return salary
}

function getCommission() {
    let text = $('[xclass="text-muted"] strong').text();
    if (text && text.indexOf('$') !== -1) {
        return  parseInt(text.replace('$', ''), 10);
    }
    return undefined
}

function getLinkedin() {
    return $("a:contains('LinkedIn')").attr('href')
}

function sendAddCandidateToZohoRequest(userProfile: any) {
    chrome.runtime.sendMessage({
        action: 'add_candidate',
        candidate: userProfile
    });
}

function getUserStatus() {
    let email = $('a[href^="mailto:"]').first().text();
    if (email === 'magic@djinni.co') {
        return;
    }
    chrome.runtime.sendMessage({
        action: 'get_status',
        email: email
    });
}

window.onerror = function (msg, url, lineNo, columnNo, error) {
    chrome.runtime.sendMessage({
        action: 'error_notification',
        error: error.toString()
    })
};