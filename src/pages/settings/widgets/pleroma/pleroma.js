import utils from '/pages/lib/utils.js'

const form = document.getElementById('pleroma_form')
const instance = form.getElementsByClassName('instance')[0]

let options
(async () => {
    options = await utils.getOptions()
    if (options.pleroma) {
        instance.value = options.pleroma.instance
    }

    let pleroma = options.pleroma ?? {}
    form.addEventListener("submit", async e => {
        e.preventDefault()
        let url
        try { url = new URL(instance.value) }
        catch { return }
        pleroma.instance = `${url.protocol}//${url.hostname}`
        browser.storage.local.set({ pleroma }, () => {
            location.reload()
        })
    })
})()