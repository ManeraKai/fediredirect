for (const a of document.getElementById("links").getElementsByTagName("a")) {
	if (!a.href.includes("https://")) {
		a.addEventListener("click", e => {
			const path = a.getAttribute("href").replace("#", "")
			loadPage(path)
			e.preventDefault()
		})
	}
}

async function loadPage(path) {
	for (const section of document.getElementById("pages").getElementsByTagName("section")) section.style.display = "none"
	document.getElementById(`${path}_page`).style.display = "block"

	for (const element of document.getElementsByClassName("title")) {
		const a = element.getElementsByTagName('a')[0]
		if (a.getAttribute("href") == `#${path}`) {
			element.classList.add("selected")
		} else {
			element.classList.remove("selected")
		}
	}

	window.history.pushState({ id: "100" }, "Page 2", `/pages/settings/index.html#${path}`)
}

const r = window.location.href.match(/#(.*)/)
if (r) loadPage(r[1])
else loadPage("general")