const myInstances = {
    'lemmy': 'https://programming.dev'
}
const auth = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI4OTQsImlzcyI6InByb2dyYW1taW5nLmRldiIsImlhdCI6MTY4ODYyMzUwNX0.1yJmq-4SMCKSgMU4X82qDgmg27SbMg0pPB9HR1L_ex4'

document.getElementById("more-options").addEventListener("click", () => browser.runtime.openOptionsPage())

document.getElementById("redirect_to_lemmy").addEventListener("click", () => {
    browser.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        let url = new URL(tabs[0].url);
        if (await isLemmy(url)) {
            if (isMyInstance(url, 'lemmy')) {
                browser.tabs.reload()
                return
            }
            const postId = isLemmyPost(url)
            if (postId) {
                const req = new XMLHttpRequest();
                req.open("GET", `${url.protocol}//${url.hostname}/api/v3/post?id=${postId}`, false);
                req.onload = async () => {
                    const ap_id = JSON.parse(req.responseText)['post_view']['post']['ap_id']
                    browser.tabs.update({ url: await lemmyResolveObject(ap_id, 'post') })
                }
                req.send();
                return
            }
            const commentId = isLemmyComment(url)
            if (commentId) {
                const req = new XMLHttpRequest();
                req.open("GET", `${url.protocol}//${url.hostname}/api/v3/comment?id=${commentId}`, false);
                req.onload = async () => {
                    const ap_id = JSON.parse(req.responseText)['comment_view']['comment']['ap_id']
                    browser.tabs.update({ url: await lemmyResolveObject(ap_id, 'comment') })
                }
                req.send();
                return
            }
            const communityRegex = isLemmyCommunity(url)
            if (communityRegex) {
                let newUrl
                if (communityRegex.length == 1) newUrl = `${myInstances.lemmy}/c/${communityRegex[0]}@${url.hostname}`
                else if (communityRegex.length == 2) newUrl = `${myInstances.lemmy}/c/${communityRegex[0]}@${communityRegex[1]}`
                browser.tabs.update({ url: newUrl })
                return
            }
            const userRegex = isLemmyUser(url)
            if (userRegex) {
                let newUrl
                if (userRegex.length == 1) newUrl = `${myInstances.lemmy}/u/${userRegex[0]}@${url.hostname}`
                else if (userRegex.length == 2) newUrl = `${myInstances.lemmy}/u/${userRegex[0]}@${userRegex[1]}`
                browser.tabs.update({ url: newUrl })
                return
            }
        }
    })
})

function isMyInstance(url, software) {
    const instance = new URL(myInstances[software])
    return url.hostname == instance.hostname
}

function isLemmy(url) {
    return new Promise(resolve => {
        const req = new XMLHttpRequest();
        req.open("GET", `${url.protocol}//${url.hostname}/api/v3/community/list`, false);
        req.onreadystatechange = () => {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    console.log('isLemmy', true)
                    resolve(true)
                } else {
                    console.log('isLemmy', false)
                    resolve(false)
                }
            }
        }
        req.send()
    })
}

function isLemmyPost(url) {
    url = new URL(url)
    const regex = url.pathname.match(/\/post\/([0-9]+)/)
    if (regex) return regex[1]
    else return false

}

function isLemmyComment(url) {
    url = new URL(url)
    const regex = url.pathname.match(/\/comment\/([0-9]+)/)
    if (regex) return regex[1]
    else return false

}

function isLemmyCommunity(url) {
    const federatedRegex = url.pathname.match(/\/c\/(.*)@(.*)(?:\/|#|\?)?/)
    if (federatedRegex) {
        return [federatedRegex[1], federatedRegex[2]]
    } else {
        const localRegex = url.pathname.match(/\/c\/(.*)(?:\/|#|\?)?/)
        if (localRegex) return [localRegex[1]]
    }
}

function isLemmyUser(url) {
    const federatedRegex = url.pathname.match(/\/u\/(.*)@(.*)(?:\/|#|\?)?/)
    if (federatedRegex) {
        return [federatedRegex[1], federatedRegex[2]]
    } else {
        const localRegex = url.pathname.match(/\/u\/(.*)(?:\/|#|\?)?/)
        if (localRegex) return [localRegex[1]]
    }
}

function lemmyResolveObject(q, type) {
    return new Promise(resolve => {
        const req = new XMLHttpRequest();
        req.open("GET", `${myInstances.lemmy}/api/v3/resolve_object?q=${encodeURIComponent(q)}&auth=${encodeURIComponent(auth)}`, false)
        req.onload = () => {
            switch (type) {
                case 'post': {
                    const id = JSON.parse(req.responseText)['post']['post']['id']
                    resolve(`${myInstances.lemmy}/post/${id}`)
                    return
                }
                case 'comment': {
                    const id = JSON.parse(req.responseText)['comment']['comment']['id']
                    resolve(`${myInstances.lemmy}/comment/${id}`)
                    return
                }
            }
        }
        req.send();
    })

}