// for testing purposes
var urlList = ["https://www.google.de", "https://wikipedia.de", "https://ebay.de", "https://kansdf.de"]
var i = 0

function urlProvider() {
	
	openUrl(urlList[i++])
	
	if (i == urlList.length) {
		i = 0
	}
}

browser.browserAction.onClicked.addListener(urlProvider);


// functionality to open a given URL in a separate tab object 

var tabId = -1
var lastUrlOpened

/**
 * Opens the given URL in a new tab. If the function has already been called at least once 
 * the tab that was initially created will be reused in every subsequent function call to open the given URL.  
 * 
 * @param url the URL to be opened
 */
function openUrl(url) {
	console.log("Button clicked - load URL in separate tab")
	
	if (tabId < 0) {
		var creating = browser.tabs.create({
			url: url,
			active: false,
			index: 0,
			pinned: true
		});
		
		creating.then(onCreated, onError);
	} else {
		
		var updatingTab = browser.tabs.update(tabId, {
			url: url
		});
		
		updatingTab.then(onUpdated, onError)
	}
}

function onCreated(tab) {
 
	tabId = tab.id
	lastUrlOpened = tab.url
	
	console.log('New tab created - ID: ' + tab.id +
			' / SELECTED: ' + tab.selected +
			' / PINNED: ' + tab.pinned +
			' / TITLE: ' + tab.title +
			' / STATUS: ' + tab.status +
			' / URL: ' + tab.url)
}

function onUpdated(tab) {
	
	lastUrlOpened = tab.url
	
	console.log('Tab updated - ID: ' + tab.id +
			' / SELECTED: ' + tab.selected +
			' / PINNED: ' + tab.pinned +
			' / TITLE: ' + tab.title +
			' / STATUS: ' + tab.status +
			' / URL: ' + tab.url)
}

function onError(error) {
	console.log(error)
	 
	if (tabId >=0 ){
		// tab already existed when error occurred
		console.log("Trying to create new tab")
		tabId = -1
		openUrl(lastUrlOpened)
	}
}