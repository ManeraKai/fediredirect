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
        req.open("GET", `${url.protocol}//${url.hostname}/api/v1/instance`, false);
        req.onreadystatechange = () => {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    const data = JSON.parse(req.responseText)
                    if (!data.version.includes("Soapbox")) {
                        resolve(true)
                        return
                    }
                }
                resolve(false)
            }
        }
        try { req.send() }
        catch (error) { resolve(false) }
    })
}

function can_mastodon_to_lemmy(url, options) {
    for (const regexItem of [regex.userFederated, regex.userLocal]) {
        if (url.pathname.match(regexItem)) {
            if (!options.lemmy || !options.lemmy.instance) return 'instance'
            return true
        }
    }
    return false
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

function can_mastodon_to_mastodon(url, options) {
    for (const regexItem of [regex.userFederated, regex.userLocal]) {
        if (url.pathname.match(regexItem)) {
            if (!options.mastodon || !options.mastodon.instance || !options.mastodon.access_token) return 'credentials'
            return true
        }
    }
    for (const regexItem of [regex.postLocal, regex.postFederated, regex.userFederated, regex.userLocal]) {
        if (url.pathname.match(regexItem)) {
            if (!options.mastodon || !options.mastodon.instance) return 'instance'
            return true
        }
    }
    return false
}

function mastodon_to_mastodon(url, options) {
    return new Promise(async resolve => {
        const localPostRegex = url.pathname.match(regex.postLocal)
        const federatedPostRegex = url.pathname.match(regex.postFederated)
        if (localPostRegex || federatedPostRegex) {
            let q
            if (localPostRegex) {
                q = url.href
            } else if (federatedPostRegex) {
                q = await get_original_url(url, federatedPostRegex[3])
            }
            const req = new XMLHttpRequest();
            req.open("GET", `${options.mastodon.instance}/api/v2/search?q=${encodeURIComponent(q)}&resolve=true&limit=1`, false);
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


function can_mastodon_to_soapbox(url, options) {
    for (const regexItem of [regex.userFederated, regex.userLocal]) {
        if (url.pathname.match(regexItem)) {
            if (!options.mastodon || !options.mastodon.instance || !options.mastodon.access_token) return 'credentials'
            return true
        }
    }
    for (const regexItem of [regex.postLocal, regex.postFederated, regex.userFederated, regex.userLocal]) {
        if (url.pathname.match(regexItem)) {
            if (!options.mastodon || !options.mastodon.instance) return 'instance'
            return true
        }
    }
    return false
}


function get_original_url(url, old_post_id) {
    return new Promise(resolve => {
        const req = new XMLHttpRequest()
        req.open("GET", `${url.protocol}//${url.hostname}/api/v1/statuses/${old_post_id}`, false)
        req.onload = () => {
            const data = JSON.parse(req.responseText)
            resolve(data.url)
        }
        req.send()
    })
}

function mastodon_to_soapbox(url, options) {
    return new Promise(async resolve => {
        const localPostRegex = url.pathname.match(regex.postLocal)
        const federatedPostRegex = url.pathname.match(regex.postFederated)
        if (localPostRegex || federatedPostRegex) {
            let q
            if (localPostRegex) {
                q = url.href
            } else if (federatedPostRegex) {
                q = await get_original_url(url, federatedPostRegex[3])
            }
            const req = new XMLHttpRequest()
            req.open("GET", `${options.soapbox.instance}/api/v2/search?q=${encodeURIComponent(q)}&resolve=true&limit=1`, true);
            req.setRequestHeader('Authorization', `Bearer ${options.soapbox.access_token}`)
            req.onload = () => {
                const post_id = JSON.parse(req.responseText)['statuses'][0]['id']
                if (localPostRegex) {
                    resolve(`${utils.protocolHost(options.soapbox.instance)}/@${localPostRegex[1]}@${url.hostname}/posts/${post_id}`)
                }
                else if (federatedPostRegex) {
                    resolve(`${utils.protocolHost(options.soapbox.instance)}/@${federatedPostRegex[1]}@${federatedPostRegex[2]}/posts/${post_id}`)
                }
            }
            req.send()
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

    can_mastodon_to_lemmy,
    mastodon_to_lemmy,

    can_mastodon_to_mastodon,
    mastodon_to_mastodon,

    can_mastodon_to_soapbox,
    mastodon_to_soapbox,

    regex
}