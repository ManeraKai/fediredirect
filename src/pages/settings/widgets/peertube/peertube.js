import utils from '/pages/lib/utils.js'

const form = document.getElementById('peertube_form')
const instance = form.getElementsByClassName('instance')[0]
const username = form.getElementsByClassName('username')[0]
const password = form.getElementsByClassName('password')[0]
const access_token = form.getElementsByClassName('access_token')[0]

let options
(async () => {
    options = await utils.getOptions()
    if (options.peertube) {
        instance.value = options.peertube.instance
        access_token.value = options.peertube.access_token
    } else {
        options.peertube = {}
    }
    checkInstance()
    checkAccess_token()
})()

form.addEventListener("submit", async e => {
    e.preventDefault()
    let url
    try { url = new URL(instance.value) }
    catch { return }
    if (instance.value != '' && username.value != '' && password.value != '' && access_token.value == '') {
        options.peertube.instance = instance.value
        const req = new XMLHttpRequest()
        req.open("GET", `${url.protocol}//${url.hostname}/api/v1/oauth-clients/local`);
        req.onload = () => {
            if (req.status == 200) {
                const data = JSON.parse(req.responseText)
                options.peertube.client_id = data.client_id
                options.peertube.client_secret = data.client_secret
                const req2 = new XMLHttpRequest()
                req2.open("POST", `${url.protocol}//${url.hostname}/api/v1/users/token`)
                req2.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
                let formData = {
                    "client_id": options.peertube.client_id,
                    "client_secret": options.peertube.client_secret,
                    "grant_type": "password",
                    "username": username.value,
                    "password": password.value
                }
                formData = new URLSearchParams(Object.entries(formData)).toString();
                req2.onload = () => {
                    console.log(req2.responseText)
                    if (req2.status == 200) {
                        const data = JSON.parse(req2.responseText)
                        console.log(data)
                        options.peertube.access_token = data.access_token
                        browser.storage.local.set({ peertube: options.peertube }, () => {
                            location.reload()
                        })
                    }
                }
                req2.send(formData)
            }
        }
        req.send()
    }
})


function checkInstance() {
    try {
        new URL(instance.value)
        username.disabled = false
        password.disabled = false
        access_token.disabled = false
    }
    catch {
        username.disabled = true
        password.disabled = true
        access_token.disabled = true
    }
}

instance.addEventListener("change", checkInstance)

function checkAccess_token() {
    if (access_token.value != '') {
        username.disabled = true
        password.disabled = true
    }
    else {
        username.disabled = false
        password.disabled = false
    }
}

access_token.addEventListener("change", checkAccess_token)