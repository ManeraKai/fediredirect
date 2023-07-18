import utils from '/pages/lib/utils.js'

const form = document.getElementById('peertube_form')
const instance = form.getElementsByClassName('instance')[0]

let options
(async () => {
    options = await utils.getOptions()
    if (options.peertube) {
        instance.value = options.peertube.instance
    }
    let peertube = options.peertube ?? {}
    form.addEventListener("submit", async e => {
        e.preventDefault()
        let url
        try { url = new URL(instance.value) }
        catch { return }
        peertube.instance = `${url.protocol}//${url.hostname}`
        browser.storage.local.set({ peertube }, () => location.reload())
    })
})()