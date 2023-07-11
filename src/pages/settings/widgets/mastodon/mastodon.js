import utils from '/pages/lib/utils.js'

const form = document.getElementById('mastodon_form')
const instance = form.getElementsByClassName('instance')[0]


let options
(async () => {
    options = await utils.getOptions()
    if (options.mastodon) {
        instance.value = options.mastodon.instance
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
    browser.storage.local.set(
        { mastodon: { instance: `${url.protocol}//${url.hostname}`, } },
        () => location.reload()
    )
})
