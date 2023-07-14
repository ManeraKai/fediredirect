import utils from '../../pages/lib/utils.js'
import mastodon from '../lib/mastodon.js'
import lemmy from '../../pages/lib/lemmy.js'

let options
(async () => {
    options = await utils.getOptions()
    browser.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        let url = new URL(tabs[0].url);
        if (await lemmy.isLemmy(url)) {
            switch (lemmy.can_lemmy_to_lemmy(url, options)) {
                case true:
                    document.getElementById("redirect_to_lemmy").disabled = false
                    document.getElementById("redirect_to_lemmy").addEventListener("click", async () => {
                        const newUrl = await lemmy.lemmy_to_lemmy(url, options)
                        if (newUrl) browser.tabs.update({ url: newUrl })
                    })
                    break
                case 'credentials':
                    document.getElementById("redirect_to_lemmy_div").title = 'Requires a Favorite Instance & Credentials'
                    break
                case 'instance':
                    document.getElementById("redirect_to_lemmy_div").title = 'Requires a Favorite Instance'
                    break
                default:
                    document.getElementById("redirect_to_lemmy_div").title = 'URL not supported'
            }
            switch (lemmy.can_lemmy_to_mastodon(url, options)) {
                case true:
                    document.getElementById("redirect_to_mastodon").disabled = false
                    document.getElementById("redirect_to_mastodon").addEventListener("click", async () => {
                        const newUrl = await lemmy.lemmy_to_mastodon(url, options)
                        if (newUrl) browser.tabs.update({ url: newUrl })
                    })
                    break
                case 'credentials':
                    document.getElementById("redirect_to_mastodon_div").title = 'Requires a Favorite Instance & Credentials'
                    break
                case 'instance':
                    document.getElementById("redirect_to_mastodon_div").title = 'Requires a Favorite Instance'
                    break
                default:
                    document.getElementById("redirect_to_mastodon_div").title = 'Url not supported'
            }
            return
        }
        if (await mastodon.isMastodon(url)) {
            switch (mastodon.can_mastodon_to_lemmy(url, options)) {
                case true:
                    document.getElementById("redirect_to_lemmy").disabled = false
                    document.getElementById("redirect_to_lemmy").addEventListener("click", async () => {
                        const newUrl = await mastodon.mastodon_to_lemmy(url, options)
                        if (newUrl) browser.tabs.update({ url: newUrl })
                    })
                    break
                case 'credentials':
                    document.getElementById("redirect_to_lemmy").title = 'Requires a Favorite Instance & Credentials'
                    break
                case 'instance':
                    document.getElementById("redirect_to_mastodon_div").title = 'Requires a Favorite Instance'
                    break
                default:
                    document.getElementById("redirect_to_mastodon_div").title = 'Url not supported'
            }
            switch (mastodon.can_mastodon_to_mastodon(url, options)) {
                case true:
                    document.getElementById("redirect_to_mastodon").disabled = false
                    document.getElementById("redirect_to_mastodon").addEventListener("click", async () => {
                        const newUrl = await mastodon.mastodon_to_mastodon(url, options)
                        if (newUrl) browser.tabs.update({ url: newUrl })
                    })
                    break
                case 'credentials':
                    document.getElementById("redirect_to_mastodon").title = 'Requires a Favorite Instance & Credentials'
                    break
                case 'instance':
                    document.getElementById("redirect_to_mastodon").title = 'Requires a Favorite Instance'
                    break
                default:
                    document.getElementById("redirect_to_mastodon").title = 'Url not supported'
            }
            return
        }
    })
})()

document.getElementById("more-options").addEventListener("click", () => browser.runtime.openOptionsPage())