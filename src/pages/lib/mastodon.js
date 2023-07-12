import utils from "./utils.js";

const regex = {
    userFederated: /\/@([A-Za-z0-9_]+)@([A-Za-z0-9_.]+)\/?$/,
    userLocal: /\/@([A-Za-z0-9_]+)\/?$/,
    postLocal: /\/@([A-Za-z0-9_]+)\/([0-9]+)\/?$/,
    postFederated: /\/@(.*)@(.*)\/([0-9]+)\/?$/,
}

function isMastodon(url) {
    return new Promise(resolve => {
        const req = new XMLHttpRequest();
        req.open("GET", `${url.protocol}//${url.hostname}/api/v1/trends/statuses?limit=1`, false);
        req.onreadystatechange = () => {
            if (req.readyState == 4) {
                if (req.status == 200) resolve(true)
                else resolve(false)
            }
        }
        req.send()
    })
}

function mastodon_to_lemmy(url, options) {
    return new Promise(async resolve => {
        console.log(url.pathname)
        const userFederatedRegex = url.pathname.match(regex.userFederated)
        if (userFederatedRegex) {
            resolve(`${utils.protocolHost(options.lemmy.instance)}/u/${userFederatedRegex[1]}@${userFederatedRegex[2]}`)
            return
        }
        const userLocalRegex = url.pathname.match(regex.userLocal)
        if (userLocalRegex) {
            resolve(`${utils.protocolHost(options.lemmy.instance)}/u/${userLocalRegex[1]}@${url.hostname}`)
            return
        }
    })
}

function mastodon_to_mastodon(url, options) {
    return new Promise(async resolve => {
        const localPostRegex = url.pathname.match(regex.postLocal)
        const federatedPostRegex = url.pathname.match(regex.postFederated)
        if (localPostRegex || federatedPostRegex) {
            const req = new XMLHttpRequest();
            req.open("GET", `${options.mastodon.instance}/api/v2/search?q=${encodeURIComponent(url.href)}&resolve=true&limit=1`, false);
            req.setRequestHeader('Authorization', `Bearer ${options.mastodon.access_token}`)
            req.onload = async () => {
                const post_id = JSON.parse(req.responseText)['statuses'][0]['id']
                if (localPostRegex) {
                    resolve(`${utils.protocolHost(options.mastodon.instance)}/@${localPostRegex[1]}@${url.hostname}/${post_id}`)
                }
                else if (federatedPostRegex) {
                    resolve(`${utils.protocolHost(options.mastodon.instance)}/@${federatedPostRegex[1]}@${federatedPostRegex[2]}/${post_id}`)
                }
            }
            req.send();
            return
        }

        const userFederatedRegex = url.pathname.match(regex.userFederated)
        if (userFederatedRegex) {
            resolve(`${utils.protocolHost(options.mastodon.instance)}/@${userFederatedRegex[1]}@${userFederatedRegex[2]}`)
            return
        }
        const userLocalRegex = url.pathname.match(regex.userLocal)
        if (userLocalRegex) {
            resolve(`${utils.protocolHost(options.mastodon.instance)}/@${userLocalRegex[1]}@${url.hostname}`)
            return
        }
    })
}

export default {
    isMastodon,
    mastodon_to_lemmy,
    mastodon_to_mastodon,
    regex
}