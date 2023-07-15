import utils from '/pages/lib/utils.js'

const form = document.getElementById('calckey_form')
const instance = form.getElementsByClassName('instance')[0]

let options
(async () => {
    options = await utils.getOptions()
    if (options.calckey) {
        instance.value = options.calckey.instance
    }

    let calckey = options.calckey ?? {}
    form.addEventListener("submit", async e => {
        e.preventDefault()
        let url
        try { url = new URL(instance.value) }
        catch { return }
        calckey.instance = `${url.protocol}//${url.hostname}`

        if (calckey.instance != '') {
            const url = new URL(calckey.instance)
            const req = new XMLHttpRequest()
            req.open("POST", `${url.protocol}//${url.hostname}/api/app/create`)
            const formJSON = {
                name: "FediRedirect",
                description: "A browser extension that redirects you from a fediverse instance to your favorite instance",
                permission: ["read:search"]
            }
            req.onreadystatechange = () => {
                if (req.readyState == 4 && req.status == 200) {
                    const app = JSON.parse(req.responseText)
                    calckey.app = app
                    browser.storage.local.set({ calckey }, () => {
                        const req = new XMLHttpRequest()
                        const formJSON = {
                            appSecret: app.secret
                        }
                        req.open("POST", `${url.protocol}//${url.hostname}/api/auth/session/generate`)
                        req.onreadystatechange = () => {
                            if (req.readyState == 4 && req.status == 200) {
                                const session = JSON.parse(req.responseText)
                                calckey.session = session
                                browser.storage.local.set({ calckey }, () => {
                                    browser.tabs.create({ url: session.url }, (tab) => {
                                        browser.tabs.onRemoved.addListener((tabId) => {
                                            if (tabId == tab.id) {
                                                const req = new XMLHttpRequest()
                                                const formJSON = {
                                                    appSecret: calckey.app.secret,
                                                    token: calckey.session.token
                                                }
                                                req.open("POST", `${url.protocol}//${url.hostname}/api/auth/session/userkey`)
                                                req.onreadystatechange = () => {
                                                    if (req.readyState == 4 && req.status == 200) {
                                                        const data = JSON.parse(req.responseText)
                                                        calckey.access_token = data.accessToken
                                                        browser.storage.local.set({ calckey }, () => {
                                                            location.reload()
                                                        })
                                                    }
                                                }
                                                req.send(JSON.stringify(formJSON))
                                            }
                                        })
                                    })
                                })
                            }
                        }
                        req.send(JSON.stringify(formJSON))
                    })
                }
            }
            req.send(JSON.stringify(formJSON))
        }
    })
})()