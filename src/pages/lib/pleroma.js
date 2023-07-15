import utils from "./utils.js";

const regex = {
    userFederated: /\/users\/$([A-Za-z0-9_]+)\/?$/,
    userLocal: /\/users\/([A-Za-z0-9_]+)\/?$/,
    postLocal: /notice\/([a-zA-Z0-9]+)\/?$/,
}

function isPleroma(url) {
    return new Promise(resolve => {
        const req = new XMLHttpRequest();
        req.open("GET", `${url.protocol}//${url.hostname}/api/v1/instance`, false);
        req.onreadystatechange = () => {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    const data = JSON.parse(req.responseText)
                    if (data.version.includes("Pleroma")) {
                        for (const regexItem of Object.values(regex)) {
                            if (url.pathname.match(regexItem)) {
                                resolve(true)
                            }
                        }
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

function get_username(url) {
    const userFederatedRegex = url.pathname.match(regex.userFederated)
    if (userFederatedRegex) return `${userFederatedRegex[1]}@${userFederatedRegex[2]}`

    const userLocalRegex = url.pathname.match(regex.userLocal)
    if (userLocalRegex) return `${userLocalRegex[1]}@${url.hostname}`
}

function redirect_username(username, options) {
    return `${utils.protocolHost(options.pleroma.instance)}/@${username}`
}

function get_original_url(url, old_post_id) {
    return new Promise(resolve => {
        const req = new XMLHttpRequest()
        req.open("GET", `${url.protocol}//${url.hostname}/api/v1/statuses/${old_post_id}`, true)
        req.onload = () => {
            const data = JSON.parse(req.responseText)
            resolve(data.url)
        }
        req.send()
    })
}

function get_post_comment(url) {
    return new Promise(async resolve => {
        const localPostRegex = url.pathname.match(regex.postLocal)
        if (localPostRegex) {
            resolve(url.href)
            return
        }
        const federatedPostRegex = url.pathname.match(regex.postFederated)
        if (federatedPostRegex) {
            resolve(await get_original_url(url, federatedPostRegex[3]))
            return
        }
        resolve()
    })
}

function redirect_post_comment(post_comment, options) {
    return new Promise(resolve => {
        const req = new XMLHttpRequest()
        req.open("GET", `${options.pleroma.instance}/api/v2/search?q=${encodeURIComponent(post_comment)}&resolve=true&limit=1`, true);
        req.setRequestHeader('Authorization', `Bearer ${options.pleroma.access_token}`)
        req.onload = () => {
            const data = JSON.parse(req.responseText)['statuses'][0]
            const post_id = data['id']
            const username = data['account']['acct']
            resolve(`${utils.protocolHost(options.pleroma.instance)}/@${username}/posts/${post_id}`)
        }
        req.send()
    })
}


export default {
    isPleroma,

    get_username,
    redirect_username,

    get_post_comment,
    redirect_post_comment,

    regex
}