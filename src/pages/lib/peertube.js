import utils from "./utils.js";

const regex = {
    userFederated: /^\/a\/(.*)@(.*)\//,
    userLocal: /^\/a\/(.*)\//,
    channelFederated: /^\/c\/(.*)@(.*)\//,
    channelLocal: /^\/c\/(.*)\//,
    video: /^\/w\/([a-zA-Z0-9]+)/,
}

function isPeertube(url) {
    return new Promise(resolve => {
        const req = new XMLHttpRequest();
        req.open("GET", `${url.protocol}//${url.hostname}/api/v1/config`, false);
        req.onreadystatechange = () => {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    const data = JSON.parse(req.responseText)
                    if (data.serverVersion) {
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
    return `${utils.protocolHost(options.peertube.instance)}/a/${username}`
}

function get_channel(url) {
    const channelFederatedRegex = url.pathname.match(regex.channelFederated)
    if (channelFederatedRegex) return `${channelFederatedRegex[1]}@${channelFederatedRegex[2]}`

    const channelLocalRegex = url.pathname.match(regex.channelLocal)
    if (channelLocalRegex) return `${channelLocalRegex[1]}@${url.hostname}`
}

function redirect_channel(channel, options) {
    return `${utils.protocolHost(options.peertube.instance)}/c/${channel}`
}

function get_original_video_url(url, old_video_id) {
    return new Promise(resolve => {
        const req = new XMLHttpRequest()
        req.open("GET", `${url.protocol}//${url.hostname}/api/v1/videos/${old_video_id}`, false)
        req.onload = () => {
            const data = JSON.parse(req.responseText)
            resolve(data.url)
        }
        req.send()
    })
}

function get_video(url) {
    return new Promise(async resolve => {
        const videoRegex = url.pathname.match(regex.video)
        if (videoRegex) {
            resolve(await get_original_video_url(url, videoRegex[1]))
            return
        }
        resolve()
    })
}

function redirect_video(video, options) {
    return new Promise(resolve => {
        const req = new XMLHttpRequest();
        req.open("GET", `${options.peertube.instance}/api/v1/search/videos?search=${encodeURIComponent(video)}&count=1`, false);
        req.onload = async () => {
            const data = JSON.parse(req.responseText).data
            const video_id = data.uuid
            resolve(`${utils.protocolHost(options.peertube.instance)}/w/${video_id}`)
        }
        req.send();
    })
}

export default {
    isPeertube,

    get_username,
    redirect_username,

    get_channel,
    redirect_channel,

    get_video,
    redirect_video,

    regex
}