import utils from '/pages/lib/utils.js'

const form = document.getElementById('mastodon_form')
const instance = form.getElementsByClassName('instance')[0]
const code = form.getElementsByClassName('code')[0]


let options
(async () => {
    options = await utils.getOptions()
    if (options.mastodon) {
        instance.value = options.mastodon.instance
        code.value = options.mastodon.code
    }
})()

form.addEventListener("submit", async e => {
    e.preventDefault()
    let url
    try {
        url = new URL(instance.value)
    } catch {
        return
    }

    browser.storage.local.get('mastodon', mastodon => {
        mastodon = mastodon.mastodon
        mastodon.instance = `${url.protocol}//${url.hostname}`
        mastodon.code = code.value

        if (instance.value != '' && code.value != '') {
            const req = new XMLHttpRequest()
            req.open("POST", `${url.protocol}//${url.hostname}/oauth/token`)
            const formData = new FormData();
            formData.append("client_id", mastodon.app.client_id)
            formData.append("client_secret", mastodon.app.client_secret)
            formData.append("code", mastodon.code)
            formData.append("redirect_uri", 'urn:ietf:wg:oauth:2.0:oob')
            formData.append("grant_type", 'authorization_code')
            formData.append("scope", 'read:search')
            req.onreadystatechange = () => {
                console.log(req)
                if (req.readyState == 4 && req.status == 200) {
                    const oauth = JSON.parse(req.responseText)
                    mastodon.access_token = oauth.access_token
                    browser.storage.local.set({ mastodon })
                    location.reload()
                }
            }
            req.send(formData)
        }
    })

    document.getElementById('mastodon_sign_in').addEventListener('click', () => {
        const url = new URL(options.mastodon.instance)
        const req = new XMLHttpRequest()
        req.open("POST", `${url.protocol}//${url.hostname}/api/v1/apps`)
        const formData = new FormData();
        formData.append("client_name", "FediRedirect")
        formData.append("redirect_uris", "urn:ietf:wg:oauth:2.0:oob")
        formData.append("scopes", "read:search")
        formData.append("website", "https://github.com/ManeraKai/fediredirect")
        req.onreadystatechange = () => {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    const app = JSON.parse(req.responseText)
                    browser.storage.local.get('mastodon', mastodon => {
                        mastodon = mastodon.mastodon
                        mastodon.app = app
                        console.log(mastodon)
                        browser.storage.local.set({ mastodon }, () => {
                            console.log('sat')
                            browser.tabs.create({
                                url: `${url.protocol}//${url.hostname}/oauth/authorize?client_id=${app.client_id}&scope=read%3Asearch&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code`
                            })
                        })
                    })
                }
            }
        }
        req.send(formData)

    })
})