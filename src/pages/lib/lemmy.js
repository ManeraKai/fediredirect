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
        req.open("GET", `${url.protocol}//${url.hostname}/api/v3/community/list`, false);
        req.onreadystatechange = () => {
            if (req.readyState == 4) {
                if (req.status == 200) resolve(true)
                else resolve(false)
            }
        }
        try { req.send() }
        catch (error) { resolve(false) }
    })
}

function resolveObject(q, type, options) {
    return new Promise(resolve => {
        const req = new XMLHttpRequest();
        req.open("GET", `${utils.protocolHost(options.lemmy.instance)}/api/v3/resolve_object?q=${encodeURIComponent(q)}&auth=${encodeURIComponent(options.lemmy.auth)}`, false)
        req.onload = () => {
            switch (type) {
                case 'post': {
                    const id = JSON.parse(req.responseText)['post']['post']['id']
                    resolve(`${utils.protocolHost(options.lemmy.instance)}/post/${id}`)
                    return
                }
                case 'comment': {
                    const id = JSON.parse(req.responseText)['comment']['comment']['id']
                    resolve(`${utils.protocolHost(options.lemmy.instance)}/comment/${id}`)
                    return
                }
            }
        }
        req.send();
    })
}

function can_lemmy_to_lemmy(url, options) {
    for (const regexItem of [regex.post, regex.comment, regex.communityFederated, regex.communityLocal, regex.userFederated, regex.userLocal]) {
        if (url.pathname.match(regexItem)) {
            if (!options.lemmy) return 'credentials'
            return true
        }
    }
    return false
}

function lemmy_to_lemmy(url, options) {
    return new Promise(async resolve => {
        const postRegex = url.pathname.match(regex.post)
        if (postRegex) {
            const req = new XMLHttpRequest();
            req.open("GET", `${url.protocol}//${url.hostname}/api/v3/post?id=${postRegex[1]}`, false);
            req.onload = async () => {
                const ap_id = JSON.parse(req.responseText)['post_view']['post']['ap_id']
                resolve(await resolveObject(ap_id, 'post', options))
                return
            }
            req.send();
            return
        }

        const commentRegex = url.pathname.match(regex.comment)
        if (commentRegex) {
            const req = new XMLHttpRequest();
            req.open("GET", `${url.protocol}//${url.hostname}/api/v3/comment?id=${commentRegex[1]}`, false);
            req.onload = async () => {
                const ap_id = JSON.parse(req.responseText)['comment_view']['comment']['ap_id']
                resolve(await resolveObject(ap_id, 'comment', options))
                return
            }
            req.send();
            return
        }

        const CommunityFederatedRegex = url.pathname.match(regex.communityFederated)
        if (CommunityFederatedRegex) {
            resolve(`${utils.protocolHost(options.lemmy.instance)}/c/${CommunityFederatedRegex[1]}@${CommunityFederatedRegex[2]}`)
            return
        }
        const CommunityLocalRegex = url.pathname.match(regex.communityLocal)
        if (CommunityLocalRegex) {
            resolve(`${utils.protocolHost(options.lemmy.instance)}/c/${CommunityLocalRegex[1]}@${url.hostname}`)
            return
        }

        const userFederatedRegex = url.pathname.match(regex.userFederated)
        if (userFederatedRegex) {
            resolve(`${utils.protocolHost(options.lemmy.instance)}/u/${userFederatedRegex[1]}@${userFederatedRegex[2]}`)
            return
        }

        const userLocalRegex = url.pathname.match(regex.userLocal)
        if (userLocalRegex) {
            resolve(`${utils.protocolHost(options.lemmy.instance)}/u/${userRegex[1]}@${url.hostname}`)
            return
        }
    })
}

function can_lemmy_to_mastodon(url, options) {
    for (const regexItem of [regex.userFederated, regex.userLocal, regex.communityFederated, regex.communityLocal, regex.post]) {
        if (url.pathname.match(regexItem)) {
            if (!options.mastodon) return 'credentials'
            return true
        }
    }
    return false
}

function lemmy_to_mastodon(url, options) {
    return new Promise(async resolve => {
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

        const communityFederatedRegex = url.pathname.match(regex.communityFederated)
        if (communityFederatedRegex) {
            resolve(`${utils.protocolHost(options.mastodon.instance)}/@${communityFederatedRegex[1]}@${communityFederatedRegex[2]}`)
            return
        }
        const communityLocalRegex = url.pathname.match(regex.communityLocal)
        if (communityLocalRegex) {
            resolve(`${utils.protocolHost(options.mastodon.instance)}/@${communityLocalRegex[1]}@${url.hostname}`)
            return
        }

        const localPostRegex = url.pathname.match(regex.post)
        if (localPostRegex) {
            const req = new XMLHttpRequest();
            req.open("GET", `${options.mastodon.instance}/api/v2/search?q=${encodeURIComponent(url.href)}&resolve=true&limit=1`, false);
            req.setRequestHeader('Authorization', `Bearer ${options.mastodon.access_token}`)
            req.onload = async () => {
                const data = JSON.parse(req.responseText)['statuses'][0]
                const post_id = data['id']
                const username = data['account']['username']
                resolve(`${utils.protocolHost(options.mastodon.instance)}/@${username}@${url.hostname}/${post_id}`)
            }
            req.send();
            return
        }
    })
}

export default {
    isLemmy,

    can_lemmy_to_lemmy,
    lemmy_to_lemmy,

    can_lemmy_to_mastodon,
    lemmy_to_mastodon,
    regex
}