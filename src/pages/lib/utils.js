window.browser = window.browser || window.chrome

function getRandomInstance(instances) {
	return instances[~~(instances.length * Math.random())]
}

function camelCase(str) {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

function protocolHost(url) {
	url = new URL(url)
	if (url.username && url.password) return `${url.protocol}//${url.username}:${url.password}@${url.host}`
	return `${url.protocol}//${url.host}`
}

function getOptions() {
	return new Promise(resolve =>
		browser.storage.local.get(null, r => {
			resolve(r)
		})
	)
}

function isMyInstance(url, software) {
    const instance = new URL(options[software].instance)
    return url.hostname == instance.hostname
}

function getBlacklist(options) {
	return new Promise(resolve => {
		let url
		if (options.fetchInstances == 'github') {
			url = 'https://raw.githubusercontent.com/libredirect/instances/main/blacklist.json'
		}
		else if (options.fetchInstances == 'codeberg') {
			url = 'https://codeberg.org/LibRedirect/instances/raw/branch/main/blacklist.json'
		}
		else {
			resolve('disabled')
			return
		}
		const http = new XMLHttpRequest()
		http.open("GET", url, true)
		http.onreadystatechange = () => {
			if (http.status === 200 && http.readyState == XMLHttpRequest.DONE) {
				resolve(JSON.parse(http.responseText))
				return
			}
		}
		http.onerror = () => {
			resolve()
			return
		}
		http.ontimeout = () => {
			resolve()
			return
		}
		http.send(null)
	})
}

function getList(options) {
	return new Promise(resolve => {
		let url
		if (options.fetchInstances == 'github') {
			url = 'https://raw.githubusercontent.com/libredirect/instances/main/data.json'
		}
		else if (options.fetchInstances == 'codeberg') {
			url = 'https://codeberg.org/LibRedirect/instances/raw/branch/main/data.json'
		}
		else {
			resolve('disabled')
			return
		}
		const http = new XMLHttpRequest()
		http.open("GET", url, true)
		http.onreadystatechange = () => {
			if (http.status === 200 && http.readyState == XMLHttpRequest.DONE) {
				resolve(JSON.parse(http.responseText))
				return
			}
		}
		http.onerror = () => {
			resolve()
			return
		}
		http.ontimeout = () => {
			resolve()
			return
		}
		http.send(null)
	})
}

export default {
	getRandomInstance,
	protocolHost,
	getList,
	getBlacklist,
	camelCase,
	getOptions,
	isMyInstance
}
