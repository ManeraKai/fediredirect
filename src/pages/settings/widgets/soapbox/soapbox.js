import utils from '/pages/lib/utils.js'

const form = document.getElementById('soapbox_form')
const instance = form.getElementsByClassName('instance')[0]
const code = form.getElementsByClassName('code')[0]

let options
(async () => {
    options = await utils.getOptions()
    if (options.soapbox) {
        instance.value = options.soapbox.instance
        code.value = options.soapbox.code
    }
    checkInstance()

    let soapbox = options.soapbox ?? {}
    form.addEventListener("submit", async e => {
        e.preventDefault()
        let url
        try { url = new URL(instance.value) }
        catch { return }
        soapbox.instance = `${url.protocol}//${url.hostname}`
        soapbox.code = code.value

        if (soapbox.instance != '' && soapbox.code == '') {
            const url = new URL(soapbox.instance)
            const req = new XMLHttpRequest()
            req.open("POST", `${url.protocol}//${url.hostname}/api/v1/apps`)
            const formData = new FormData()
            formData.append("client_name", "FediRedirect")
            formData.append("redirect_uris", "urn:ietf:wg:oauth:2.0:oob")
            formData.append("scopes", "read:search")
            formData.append("website", "https://github.com/ManeraKai/fediredirect")
            req.onreadystatechange = () => {
                if (req.readyState == 4 && req.status == 200) {
                    const app = JSON.parse(req.responseText)
                    soapbox.app = app
                    browser.storage.local.set({ soapbox }, () => {
                        browser.tabs.create({
                            url: `${url.protocol}//${url.hostname}/oauth/authorize?client_id=${app.client_id}&scope=read%3Asearch&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code`
                        })
                    })
                }
            }
            req.send(formData)
        } else if (soapbox.instance != '' && soapbox.code != '') {
            const req = new XMLHttpRequest()
            req.open("POST", `${url.protocol}//${url.hostname}/oauth/token`)
            const formData = new FormData()
            formData.append("client_id", soapbox.app.client_id)
            formData.append("client_secret", soapbox.app.client_secret)
            formData.append("code", soapbox.code)
            formData.append("redirect_uri", 'urn:ietf:wg:oauth:2.0:oob')
            formData.append("grant_type", 'authorization_code')
            formData.append("scope", 'read:search')
            req.onreadystatechange = () => {
                if (req.readyState == 4 && req.status == 200) {
                    const oauth = JSON.parse(req.responseText)
                    soapbox.access_token = oauth.access_token
                    browser.storage.local.set({ soapbox })
                    location.reload()
                }
            }
            req.send(formData)
        }
    })
})()

function checkInstance() {
    try {
        new URL(instance.value)
        code.disabled = false
    }
    catch {
        code.disabled = true
    }
}

instance.addEventListener("change", checkInstance)
