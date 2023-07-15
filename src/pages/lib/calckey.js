import utils from "./utils.js";

const regex = {
    userFederated: /\/@([A-Za-z0-9_]+)@([A-Za-z0-9_.]+)\/?$/,
    userLocal: /\/@([A-Za-z0-9_]+)\/?$/,
    post: /\/notes\/([A-Za-z0-9_]+)\/?$/,
}

function isCalckey(url) {
    return new Promise(resolve => {
        const req = new XMLHttpRequest();
        req.open("GET", `${url.protocol}//${url.hostname}/api/v1/instance`, false);
        req.onreadystatechange = () => {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    const data = JSON.parse(req.responseText)
                    if (data.version.includes("Calckey")) {
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

function get_username(url) {
    const userFederatedRegex = url.pathname.match(regex.userFederated)
    if (userFederatedRegex) return `${userFederatedRegex[1]}@${userFederatedRegex[2]}`

    const userLocalRegex = url.pathname.match(regex.userLocal)
    if (userLocalRegex) return `${userLocalRegex[1]}@${url.hostname}`
}

function redirect_username(username, options) {
    return `${utils.protocolHost(options.calckey.instance)}/@${username}`
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

function get_post_comment(url) {
    return new Promise(async resolve => {
        const postRegex = url.pathname.match(regex.post)
        if (postRegex) {
            resolve(await get_original_url(url, postRegex[1]))
            return
        }
        resolve()
    })
}

function redirect_post_comment(post_comment, options) {
    return new Promise(resolve => {
        const req = new XMLHttpRequest();
        const fromJSON = {
            "uri": post_comment
        }
        req.open("POST", `${options.calckey.instance}/api/ap/show`, false);
        req.setRequestHeader('Authorization', `Bearer ${options.calckey.access_token}`)
        req.onload = async () => {
            const data = JSON.parse(req.responseText)
            const post_id = data['object']['id']
            resolve(`${utils.protocolHost(options.calckey.instance)}/notes/${post_id}`)
        }
        req.send(JSON.stringify(fromJSON));
    })
}

export default {
    isCalckey,

    get_username,
    redirect_username,

    get_post_comment,
    redirect_post_comment,

    regex
}