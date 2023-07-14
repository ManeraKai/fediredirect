window.browser = window.browser || window.chrome

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


export default {
	protocolHost,
	getOptions,
	isMyInstance
}
