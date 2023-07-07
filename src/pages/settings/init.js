window.browser = window.browser || window.chrome

document.body.classList.add("dark-theme")
document.body.classList.remove("light-theme")
for (const element of document.body.getElementsByClassName('dark')) {
	element.style.display = 'none';
}