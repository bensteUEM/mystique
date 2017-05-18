//=========================================== TESTING


/**
Testing method for validating selectLink
*/
function selectLink(links){
	console.log("Returned "+links.length+" links");
	
	logLinks(links)

	//TODO this is not implemented yet
}

/**
Logging method for testing validating selectLink
*/
function logLinks(links){
	for (link of links){
		console.log(link);
	}
}

//=========================================== START

browser.runtime.onMessage.addListener(notify)
window.onload = run()

function notify(message, sender, sendResponse){
	console.log("ContentScript - message received from background: " + message)
	sendResponse({response: "ContentScript - This is me"})
	
	if (message.action == "execute"){
		run()
	}
}

/**
Run method which extracts all links and sends to background */
function run(){
	console.log("ContentScript - action triggered")
	
	var links = getLinks();
	var sending = browser.runtime.sendMessage(links);
}

/**
* getLinks is used to get a list of all links in the current document link
*/

function getLinks(){
	var linksDetected = [];
	var aTags = document.getElementsByTagName("a");
	for(var i=0; i<aTags.length; i++) {
		linksDetected.push(aTags[i].href);
	}
	console.log("Total links found: " + linksDetected.length)

	return linksDetected;
}



