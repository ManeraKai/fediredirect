import utils from '../../pages/lib/utils.js'
import mastodon from '../lib/mastodon.js'
import lemmy from '../../pages/lib/lemmy.js'

let options
(async () => {
    options = await utils.getOptions()
    browser.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        let url = new URL(tabs[0].url);

        if (await lemmy.isLemmy(url)) {
            document.getElementById("redirect_to_lemmy").addEventListener("click", async () => {
                const newUrl = await lemmy.lemmy_to_lemmy(url, options)
                if (newUrl) browser.tabs.update({ url: newUrl })
            })
            document.getElementById("redirect_to_mastodon").addEventListener("click", async () => {
                const newUrl = await lemmy.lemmy_to_mastodon(url, options)
                if (newUrl) browser.tabs.update({ url: newUrl })
            })
            return
        }

        if (await mastodon.isMastodon(url)) {
            document.getElementById("redirect_to_lemmy").addEventListener("click", async () => {
                const newUrl = await mastodon.mastodon_to_lemmy(url, options)
                if (newUrl) browser.tabs.update({ url: newUrl })
            })
            document.getElementById("redirect_to_mastodon").addEventListener("click", async () => {
                const newUrl = await mastodon.mastodon_to_mastodon(url, options)
                if (newUrl) browser.tabs.update({ url: newUrl })
            })
            return
        }
    })
})()

document.getElementById("more-options").addEventListener("click", () => browser.runtime.openOptionsPage())