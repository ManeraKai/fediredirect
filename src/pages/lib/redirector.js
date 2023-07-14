import lemmy from './lemmy.js'
import mastodon from './mastodon.js'
import soapbox from './soapbox.js'

function can_soapbox_to_soapbox(url, options) {
    for (const regexItem of [soapbox.regex.userFederated, soapbox.regex.userLocal]) {
        if (url.pathname.match(regexItem)) {
            if (!options.soapbox || !options.soapbox.instance) return 'instance'
            return true
        }
    }
    for (const regexItem of [soapbox.regex.postLocal, soapbox.regex.postFederated]) {
        if (url.pathname.match(regexItem)) {
            if (!options.soapbox || !options.soapbox.instance || !options.soapbox.access_token) return 'credentials'
            return true
        }
    }
    return false
}

function soapbox_to_soapbox(url, options) {
    return new Promise(async resolve => {
        const post_comment = await soapbox.get_post_comment(url, options)
        if (post_comment) {
            resolve(await soapbox.redirect_post_comment(post_comment, options))
            return
        }

        const username = soapbox.get_username(url)
        if (username) {
            resolve(soapbox.redirect_username(username, options))
            return
        }
    })
}

function can_soapbox_to_lemmy(url, options) {
    for (const regexItem of [soapbox.regex.userFederated, soapbox.regex.userLocal]) {
        if (url.pathname.match(regexItem)) {
            if (!options.lemmy || !options.lemmy.instance) return 'instance'
            return true
        }
    }
    return false
}

function soapbox_to_lemmy(url, options) {
    return new Promise(async resolve => {
        const username = soapbox.get_username(url)
        if (username) {
            resolve(lemmy.redirect_username(username, options))
            return
        }
    })
}

function can_soapbox_to_mastodon(url, options) {
    for (const regexItem of [soapbox.regex.userFederated, soapbox.regex.userLocal]) {
        if (url.pathname.match(regexItem)) {
            if (!options.mastodon || !options.mastodon.instance) return 'instance'
            return true
        }
    }
    for (const regexItem of [soapbox.regex.postLocal, soapbox.regex.postFederated]) {
        if (url.pathname.match(regexItem)) {
            if (!options.mastodon || !options.mastodon.instance || !options.mastodon.access_token) return 'credentials'
            return true
        }
    }
    return false
}

function soapbox_to_mastodon(url, options) {
    return new Promise(async resolve => {
        const post_comment = await soapbox.get_post_comment(url, options)
        if (post_comment) {
            resolve(await mastodon.redirect_post_comment(post_comment, options))
            return
        }

        const username = soapbox.get_username(url)
        if (username) {
            resolve(mastodon.redirect_username(username, options))
            return
        }
    })
}

function can_mastodon_to_mastodon(url, options) {
    for (const regexItem of [mastodon.regex.userFederated, mastodon.regex.userLocal]) {
        if (url.pathname.match(regexItem)) {
            if (!options.mastodon || !options.mastodon.instance) return 'instance'
            return true
        }
    }
    for (const regexItem of [mastodon.regex.postFederated, mastodon.regex.postLocal]) {
        if (url.pathname.match(regexItem)) {
            if (!options.mastodon || !options.mastodon.instance || !options.mastodon.access_token) return 'credentials'
            return true
        }
    }
    return false
}

function mastodon_to_mastodon(url, options) {
    return new Promise(async resolve => {
        const post_comment = await mastodon.get_post_comment(url, options)
        if (post_comment) {
            resolve(await mastodon.redirect_post_comment(post_comment, options))
            return
        }

        const username = mastodon.get_username(url)
        if (username) {
            resolve(mastodon.redirect_username(username, options))
            return
        }
    })
}

function can_mastodon_to_soapbox(url, options) {
    for (const regexItem of [mastodon.regex.userFederated, mastodon.regex.userLocal]) {
        if (url.pathname.match(regexItem)) {
            if (!options.soapbox || !options.soapbox.instance) return 'instance'
            return true
        }
    }
    for (const regexItem of [mastodon.regex.postLocal, mastodon.regex.postFederated]) {
        if (url.pathname.match(regexItem)) {
            if (!options.soapbox || !options.soapbox.instance || !options.soapbox.access_token) return 'credentials'
            return true
        }
    }
    return false
}

function mastodon_to_soapbox(url, options) {
    return new Promise(async resolve => {
        const post_comment = await mastodon.get_post_comment(url, options)
        if (post_comment) {
            resolve(await soapbox.redirect_post_comment(post_comment, options))
            return
        }

        const username = mastodon.get_username(url)
        if (username) {
            resolve(soapbox.redirect_username(username, options))
            return
        }
    })
}

function can_mastodon_to_lemmy(url, options) {
    for (const regexItem of [mastodon.regex.userFederated, mastodon.regex.userLocal]) {
        if (url.pathname.match(regexItem)) {
            if (!options.lemmy || !options.lemmy.instance) return 'instance'
            return true
        }
    }
    return false
}

function mastodon_to_lemmy(url, options) {
    return new Promise(async resolve => {
        const username = mastodon.get_username(url)
        if (username) {
            resolve(lemmy.redirect_username(username, options))
            return
        }
    })
}

function can_lemmy_to_lemmy(url, options) {
    for (const regexItem of [lemmy.regex.communityFederated, lemmy.regex.communityLocal, lemmy.regex.userFederated, lemmy.regex.userLocal]) {
        if (url.pathname.match(regexItem)) {
            if (!options.lemmy || !options.lemmy.instance) return 'instance'
            return true
        }
    }
    for (const regexItem of [lemmy.regex.post, lemmy.regex.comment]) {
        if (url.pathname.match(regexItem)) {
            if (!options.lemmy || !options.lemmy.instance || !options.lemmy.auth) return 'credentials'
            return true
        }
    }
    return false
}

function lemmy_to_lemmy(url, options) {
    return new Promise(async resolve => {
        const post = await lemmy.get_post(url)
        if (post) {
            resolve(await lemmy.redirect_post(post, options))
            return
        }

        const comment = await lemmy.get_comment(url)
        if (comment) {
            resolve(await lemmy.redirect_comment(comment, options))
            return
        }

        const username = lemmy.get_username(url)
        if (username) {
            resolve(lemmy.redirect_username(username, options))
            return
        }

        const community = lemmy.get_community(url)
        if (community) {
            resolve(lemmy.redirect_community(community, options))
            return
        }
    })
}

function can_lemmy_to_mastodon(url, options) {
    for (const regexItem of [lemmy.regex.userFederated, lemmy.regex.userLocal, lemmy.regex.communityFederated, lemmy.regex.communityLocal]) {
        if (url.pathname.match(regexItem)) {
            if (!options.mastodon || !options.mastodon.instance) return 'instance'
            return true
        }
    }
    for (const regexItem of [lemmy.regex.post]) {
        if (url.pathname.match(regexItem)) {
            if (!options.mastodon || !options.mastodon.instance || !options.mastodon.access_token) return 'credentials'
            return true
        }
    }
    return false
}

function lemmy_to_mastodon(url, options) {
    return new Promise(async resolve => {
        const username = lemmy.get_username(url)
        if (username) {
            resolve(mastodon.redirect_username(username, options))
            return
        }

        const community = lemmy.get_community(url)
        if (community) {
            resolve(mastodon.redirect_username(community, options))
            return
        }

        const post = await lemmy.get_post(url, options)
        if (post) {
            resolve(await mastodon.redirect_post_comment(post, options))
            return
        }
    })
}

function can_lemmy_to_soapbox(url, options) {
    for (const regexItem of [lemmy.regex.userFederated, lemmy.regex.userLocal]) {
        if (url.pathname.match(regexItem)) {
            if (!options.soapbox || !options.soapbox.instance) return 'instance'
            return true
        }
    }
    for (const regexItem of [lemmy.regex.post]) {
        if (url.pathname.match(regexItem)) {
            if (!options.soapbox || !options.soapbox.instance || !options.soapbox.access_token) return 'credentials'
            return true
        }
    }
    return false
}

function lemmy_to_soapbox(url, options) {
    return new Promise(async resolve => {
        const username = lemmy.get_username(url)
        if (username) {
            resolve(soapbox.redirect_username(username, options))
            return
        }

        const post = await lemmy.get_post(url, options)
        if (post) {
            resolve(await soapbox.redirect_post_comment(post.options))
            return
        }
    })
}

export default {
    can_soapbox_to_soapbox,
    soapbox_to_soapbox,

    can_soapbox_to_mastodon,
    soapbox_to_mastodon,

    can_soapbox_to_lemmy,
    soapbox_to_lemmy,

    can_mastodon_to_mastodon,
    mastodon_to_mastodon,

    can_mastodon_to_soapbox,
    mastodon_to_soapbox,

    can_mastodon_to_lemmy,
    mastodon_to_lemmy,

    can_lemmy_to_lemmy,
    lemmy_to_lemmy,

    can_lemmy_to_mastodon,
    lemmy_to_mastodon,

    can_lemmy_to_soapbox,
    lemmy_to_soapbox,
}