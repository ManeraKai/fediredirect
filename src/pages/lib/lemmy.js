import utils from './utils.js'

const regex = {
    post: /\/post\/([0-9]+)/,
    comment: /\/comment\/([0-9]+)/,
    communityFederated: /\/c\/(.*)@(.*)(?:\/|#|\?)?/,
    communityLocal: /\/c\/(.*)(?:\/|#|\?)?/,
    userFederated: /\/u\/(.*)@(.*)(?:\/|#|\?)?/,
    userLocal: /\/u\/(.*)(?:\/|#|\?)?/
}

function isLemmy(url) {
    return new Promise(resolve => {
        const req = new XMLHttpRequest();
        req.open("GET", `${url.protocol}//${url.hostname}/api/v3/site`, true);
        req.onreadystatechange = () => {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    try {
                        const data = JSON.parse(req.responseText)
                        if (data.version) {
                            resolve(true)
                            return
                        }
                    } catch { }
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
    return `${utils.protocolHost(options.lemmy.instance)}/u/${username}`
}

function get_community(url) {
    const communityFederatedRegex = url.pathname.match(regex.communityFederated)
    if (communityFederatedRegex) return `${communityFederatedRegex[1]}@${communityFederatedRegex[2]}`

    const CommunityLocalRegex = url.pathname.match(regex.communityLocal)
    if (CommunityLocalRegex) return `${CommunityLocalRegex[1]}@${url.hostname}`
}

function redirect_community(community, options) {
    return `${utils.protocolHost(options.lemmy.instance)}/c/${community}`
}

function get_post(url) {
    return new Promise(resolve => {
        const postRegex = url.pathname.match(regex.post)
        if (postRegex) {
            const req = new XMLHttpRequest();
            req.open("GET", `${url.protocol}//${url.hostname}/api/v3/post?id=${postRegex[1]}`, false);
            req.onload = async () => {
                resolve(JSON.parse(req.responseText)['post_view']['post']['id'])
            }
            req.send()
        } else {
            resolve()
        }
    })
}

function redirect_post(post, options) {
    return new Promise(resolve => {
        const req = new XMLHttpRequest();
        req.open("GET", `${utils.protocolHost(options.lemmy.instance)}/api/v3/resolve_object?q=${encodeURIComponent(post)}&auth=${encodeURIComponent(options.lemmy.auth)}`, false)
        req.onload = () => {
            if (req.status == 200) {
                const data = JSON.parse(req.responseText)
                const id = data['post']['post']['id']
                resolve(`${utils.protocolHost(options.lemmy.instance)}/post/${id}`)
                return
            }
            resolve()
        }
        req.send();
    })
}

function get_comment(url) {
    return new Promise(resolve => {
        const commentRegex = url.pathname.match(regex.comment)
        if (commentRegex) {
            const req = new XMLHttpRequest();
            req.open("GET", `${url.protocol}//${url.hostname}/api/v3/comment?id=${commentRegex[1]}`, false);
            req.onload = async () => {
                resolve(JSON.parse(req.responseText)['comment_view']['comment']['id'])
            }
            req.send()
        } else {
            resolve()
        }
    })
}

function redirect_comment(comment, options) {
    return new Promise(resolve => {
        const req = new XMLHttpRequest();
        req.open("GET", `${utils.protocolHost(options.lemmy.instance)}/api/v3/resolve_object?q=${encodeURIComponent(comment)}&auth=${encodeURIComponent(options.lemmy.auth)}`, false)
        req.onload = () => {
            const id = JSON.parse(req.responseText)['comment']['comment']['id']
            resolve(`${utils.protocolHost(options.lemmy.instance)}/comment/${id}`)
            return
        }
        req.send();
    })
}

export default {
    isLemmy,

    get_username,
    redirect_username,

    get_community,
    redirect_community,

    get_post,
    redirect_post,

    get_comment,
    redirect_comment,

    regex
}