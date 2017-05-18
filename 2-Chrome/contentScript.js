function pageLoaded() {
	var arr = [], l = document.links;
	for(var i=0; i<l.length; i++) {
  		arr.push(l[i].href);
	}
	chrome.runtime.sendMessage({links: arr});
}

window.onload = pageLoaded;