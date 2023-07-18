import utils from '../../pages/lib/utils.js'
import redirector from '../../pages/lib/redirector.js'
import lemmy from '../../pages/lib/lemmy.js'
import mastodon from '../lib/mastodon.js'
import calckey from '../lib/calckey.js'
import soapbox from '../lib/soapbox.js'
import peertube from '../lib/peertube.js'

let options
(async () => {
    options = await utils.getOptions()
    browser.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        let url = new URL(tabs[0].url);
        function custom_switch(can_func, redirect_func, element_name) {
            switch (can_func(url, options)) {
                case true:
                    document.getElementById(element_name).disabled = false
                    document.getElementById(element_name).title = ''
                    document.getElementById(element_name).addEventListener("click", async () => {
                        const newUrl = await redirect_func(url, options)
                        if (newUrl) browser.tabs.update({ url: newUrl }, () => {
                            close()
                        })
                    })
                    break
                case 'credentials':
                    document.getElementById(element_name).title = 'Requires a Favorite Instance & Credentials'
                    break
                case 'instance':
                    document.getElementById(element_name).title = 'Requires a Favorite Instance'
                    break
                default:
                    document.getElementById(element_name).title = 'Url not supported'
            }
        }
        if (await lemmy.isLemmy(url)) {
            console.log('lemmy')
            custom_switch(redirector.can_lemmy_to_lemmy, redirector.lemmy_to_lemmy, 'redirect_to_lemmy')
            custom_switch(redirector.can_lemmy_to_mastodon, redirector.lemmy_to_mastodon, 'redirect_to_mastodon')
            custom_switch(redirector.can_lemmy_to_soapbox, redirector.lemmy_to_soapbox, 'redirect_to_soapbox')
            custom_switch(redirector.can_lemmy_to_calckey, redirector.lemmy_to_calckey, 'redirect_to_calckey')
        }
        if (await mastodon.isMastodon(url)) {
            console.log('mastodon')
            custom_switch(redirector.can_mastodon_to_lemmy, redirector.mastodon_to_lemmy, 'redirect_to_lemmy')
            custom_switch(redirector.can_mastodon_to_mastodon, redirector.mastodon_to_mastodon, 'redirect_to_mastodon')
            custom_switch(redirector.can_mastodon_to_soapbox, redirector.mastodon_to_soapbox, 'redirect_to_soapbox')
            custom_switch(redirector.can_mastodon_to_calckey, redirector.mastodon_to_calckey, 'redirect_to_calckey')
        }
        if (await soapbox.isSoapbox(url)) {
            console.log('soapbox')
            custom_switch(redirector.can_soapbox_to_lemmy, redirector.soapbox_to_lemmy, 'redirect_to_lemmy')
            custom_switch(redirector.can_soapbox_to_mastodon, redirector.soapbox_to_mastodon, 'redirect_to_mastodon')
            custom_switch(redirector.can_soapbox_to_soapbox, redirector.soapbox_to_soapbox, 'redirect_to_soapbox')
            custom_switch(redirector.can_soapbox_to_calckey, redirector.soapbox_to_calckey, 'redirect_to_calckey')
        }
        if (await calckey.isCalckey(url)) {
            console.log('calckey')
            custom_switch(redirector.can_calckey_to_mastodon, redirector.calckey_to_mastodon, 'redirect_to_mastodon')
            custom_switch(redirector.can_calckey_to_soapbox, redirector.calckey_to_soapbox, 'redirect_to_soapbox')
            custom_switch(redirector.can_calckey_to_lemmy, redirector.calckey_to_lemmy, 'redirect_to_lemmy')
            custom_switch(redirector.can_calckey_to_calckey, redirector.calckey_to_calckey, 'redirect_to_calckey')
        }
        if (await peertube.isPeertube(url)) {
            console.log('peertube')
            custom_switch(redirector.can_peertube_to_peertube, redirector.peertube_to_peertube, 'redirect_to_peertube')
            custom_switch(redirector.can_peertube_to_mastodon, redirector.peertube_to_mastodon, 'redirect_to_mastodon')
            custom_switch(redirector.can_peertube_to_soapbox, redirector.peertube_to_soapbox, 'redirect_to_soapbox')
            custom_switch(redirector.can_peertube_to_calckey, redirector.peertube_to_calckey, 'redirect_to_calckey')
            custom_switch(redirector.can_peertube_to_lemmy, redirector.peertube_to_lemmy, 'redirect_to_lemmy')
        }
    })
})()


document.getElementById("more-options").addEventListener("click", () => browser.runtime.openOptionsPage())