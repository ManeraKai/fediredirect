import utils from '/pages/lib/utils.js'

const form = document.getElementById('lemmy_form')
const instance = form.getElementsByClassName('instance')[0]
const username = form.getElementsByClassName('username')[0]
const password = form.getElementsByClassName('password')[0]
const jwt = form.getElementsByClassName('jwt')[0]

let options
(async () => {
    options = await utils.getOptions()
    if (options.lemmy) {
        instance.value = options.lemmy.instance
        jwt.value = options.lemmy.auth
    }
    checkInstance()
    checkJwt()
})()

form.addEventListener("submit", async e => {
    e.preventDefault()
    let url
    try {
        url = new URL(instance.value)
    } catch {
        return
    }
    if (jwt.value == "" && username.value != '' && password.value != '') jwt.value = await getJwt(url, username.value, password.value)
    browser.storage.local.set(
        { lemmy: { instance: `${url.protocol}//${url.hostname}`, auth: jwt.value } },
        () => location.reload()
    )
})

function getJwt(url, username, password) {
    return new Promise(resolve => {
        if (username == "" || password == "") { resolve(); return }
        const req = new XMLHttpRequest();
        req.open("POST", `${url.protocol}//${url.hostname}/api/v3/user/login`);
        req.setRequestHeader('Content-Type', 'application/json')
        req.onreadystatechange = () => {
            console.log(req)
            if (req.readyState == 4) {
                if (req.status == 200) {
                    resolve(JSON.parse(req.responseText).jwt)
                    return
                } else {
                    resolve
                    return
                }
            }
        }
        req.send(JSON.stringify({ "username_or_email": username, "password": password }, null, 2))
    })
}

function checkInstance() {
    try {
        new URL(instance.value)
        username.disabled = false
        password.disabled = false
        jwt.disabled = false
    }
    catch {
        username.disabled = true
        password.disabled = true
        jwt.disabled = true
    }
}

instance.addEventListener("change", checkInstance)

function checkJwt() {
    if (jwt.value != '') {
        username.disabled = true
        password.disabled = true
    }
    else {
        username.disabled = false
        password.disabled = false
    }
}

jwt.addEventListener("change", checkJwt)