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
        req.send()
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
    })
}

export default {
    isLemmy,
    lemmy_to_lemmy,
    lemmy_to_mastodon,
    regex
}