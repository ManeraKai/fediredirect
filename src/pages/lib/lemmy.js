import utils from './utils.js'

function isLemmy(url) {
    return new Promise(resolve => {
        const req = new XMLHttpRequest();
        req.open("GET", `${url.protocol}//${url.hostname}/api/v3/community/list`, false);
        req.onreadystatechange = () => {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            }
        }
        req.send()
    })
}

function isPost(url) {
    url = new URL(url)
    const regex = url.pathname.match(/\/post\/([0-9]+)/)
    if (regex) return regex[1]
    else return false

}

function isComment(url) {
    url = new URL(url)
    const regex = url.pathname.match(/\/comment\/([0-9]+)/)
    if (regex) return regex[1]
    else return false

}

function isCommunity(url) {
    const federatedRegex = url.pathname.match(/\/c\/(.*)@(.*)(?:\/|#|\?)?/)
    if (federatedRegex) {
        return [federatedRegex[1], federatedRegex[2]]
    } else {
        const localRegex = url.pathname.match(/\/c\/(.*)(?:\/|#|\?)?/)
        if (localRegex) return [localRegex[1]]
    }
}

function isUser(url) {
    const federatedRegex = url.pathname.match(/\/u\/(.*)@(.*)(?:\/|#|\?)?/)
    if (federatedRegex) {
        return [federatedRegex[1], federatedRegex[2]]
    } else {
        const localRegex = url.pathname.match(/\/u\/(.*)(?:\/|#|\?)?/)
        if (localRegex) return [localRegex[1]]
    }
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
        const postId = isPost(url)
        if (postId) {
            const req = new XMLHttpRequest();
            req.open("GET", `${url.protocol}//${url.hostname}/api/v3/post?id=${postId}`, false);
            req.onload = async () => {
                const ap_id = JSON.parse(req.responseText)['post_view']['post']['ap_id']
                resolve(await resolveObject(ap_id, 'post', options))
            }
            req.send();
            return
        }
        const commentId = isComment(url)
        if (commentId) {
            const req = new XMLHttpRequest();
            req.open("GET", `${url.protocol}//${url.hostname}/api/v3/comment?id=${commentId}`, false);
            req.onload = async () => {
                const ap_id = JSON.parse(req.responseText)['comment_view']['comment']['ap_id']
                resolve(await resolveObject(ap_id, 'comment', options))
            }
            req.send();
            return
        }
        const communityRegex = isCommunity(url)
        if (communityRegex) {
            let newUrl
            if (communityRegex.length == 1) newUrl = `${utils.protocolHost(options.lemmy.instance)}/c/${communityRegex[0]}@${url.hostname}`
            else if (communityRegex.length == 2) newUrl = `${utils.protocolHost(options.lemmy.instance)}/c/${communityRegex[0]}@${communityRegex[1]}`
            resolve(newUrl)
            return
        }
        const userRegex = isUser(url)
        if (userRegex) {
            let newUrl
            if (userRegex.length == 1) newUrl = `${utils.protocolHost(options.lemmy.instance)}/u/${userRegex[0]}@${url.hostname}`
            else if (userRegex.length == 2) newUrl = `${utils.protocolHost(options.lemmy.instance)}/u/${userRegex[0]}@${userRegex[1]}`
            resolve(newUrl)
            return
        }
    })
}

function lemmy_to_mastodon(url, options) {
    return new Promise(async resolve => {
        const federatedRegex = url.pathname.match(/\/u\/(.*)@(.*)(?:\/|#|\?)?/)
        if (federatedRegex) {
            resolve(`${utils.protocolHost(options.mastodon.instance)}/@${federatedRegex[1]}@${federatedRegex[2]}`)
            return
        }
        const localRegex = url.pathname.match(/\/u\/(.*)(?:\/|#|\?)?/)
        if (localRegex) {
            resolve(`${utils.protocolHost(options.mastodon.instance)}/@${localRegex[1]}@${url.hostname}`)
            return
        }
    })
}

export default {
    isLemmy,
    isUser,
    isPost,
    isComment,
    isCommunity,
    resolveObject,
    lemmy_to_lemmy,
    lemmy_to_mastodon
}