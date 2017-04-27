function pageLoaded() {
	var linksFromDom = document.getElementsByTagName('a');
	chrome.runtime.sendMessage({links: linksFromDom});
}

window.onload = pageLoaded;