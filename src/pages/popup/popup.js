import utils from '../../pages/lib/utils.js'
import mastodon from '../lib/mastodon.js'
import lemmy from '../../pages/lib/lemmy.js'

let options
(async () => {
    options = await utils.getOptions()
    browser.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        let url = new URL(tabs[0].url);

        if (await lemmy.isLemmy(url)) {
            const can_lemmy_to_lemmy = lemmy.can_lemmy_to_lemmy(url, options)
            if (can_lemmy_to_lemmy) {
                document.getElementById("redirect_to_lemmy_div").style.display = ''
                if (can_lemmy_to_lemmy == 'credentials') {
                    document.getElementById("redirect_to_lemmy").disabled = true
                    document.getElementById("redirect_to_lemmy").title = 'Requires Credentials'
                } else {
                    document.getElementById("redirect_to_lemmy").addEventListener("click", async () => {
                        const newUrl = await lemmy.lemmy_to_lemmy(url, options)
                        if (newUrl) browser.tabs.update({ url: newUrl })
                    })
                }
            }
            const can_lemmy_to_mastodon = lemmy.can_lemmy_to_mastodon(url, options)
            if (can_lemmy_to_mastodon) {
                document.getElementById("redirect_to_mastodon_div").style.display = ''
                if (can_lemmy_to_mastodon == 'credentials') {
                    document.getElementById("redirect_to_mastodon").disabled = true
                    document.getElementById("redirect_to_mastodon").title = 'Requires Credentials'
                } else {
                    document.getElementById("redirect_to_mastodon").addEventListener("click", async () => {
                        const newUrl = await lemmy.lemmy_to_mastodon(url, options)
                        if (newUrl) browser.tabs.update({ url: newUrl })
                    })
                }
            }
            return
        }

        if (await mastodon.isMastodon(url)) {
            const can_mastodon_to_lemmy = mastodon.can_mastodon_to_lemmy(url, options)
            if (can_mastodon_to_lemmy) {
                document.getElementById("redirect_to_lemmy_div").style.display = ''
                if (can_mastodon_to_lemmy == 'credentials') {
                    document.getElementById("redirect_to_lemmy").disabled = true
                    document.getElementById("redirect_to_lemmy").title = 'Requires Credentials'
                } else {
                    document.getElementById("redirect_to_lemmy").addEventListener("click", async () => {
                        const newUrl = await mastodon.mastodon_to_lemmy(url, options)
                        if (newUrl) browser.tabs.update({ url: newUrl })
                    })
                }
            }

            const can_mastodon_to_mastodon = mastodon.can_mastodon_to_mastodon(url, options)
            if (can_mastodon_to_mastodon) {
                document.getElementById("redirect_to_mastodon_div").style.display = ''
                if (can_mastodon_to_mastodon == 'credentials') {
                    document.getElementById("redirect_to_mastodon").disabled = true
                    document.getElementById("redirect_to_mastodon").title = 'Requires Credentials'
                } else {
                    document.getElementById("redirect_to_mastodon").addEventListener("click", async () => {
                        const newUrl = await mastodon.mastodon_to_mastodon(url, options)
                        if (newUrl) browser.tabs.update({ url: newUrl })
                    })
                }
            }
            return
        }
    })
})()

document.getElementById("more-options").addEventListener("click", () => browser.runtime.openOptionsPage())