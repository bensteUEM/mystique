//=========================================== TESTING


/**
Testing method for validating selectLink
*/
function selectLink(links){
	logData("[ContentScript] - Returned "+links.length+" links")	
	logLinks(links)

	//TODO this is not implemented yet
}

/**
Logging method for testing validating selectLink
*/
function logLinks(links){
	for (link of links){
		logData("[ContentScript] - " + link)
	}
}

//=========================================== START

var loggingActive = true

browser.runtime.onMessage.addListener(notify)
window.onload = run()

function notify(message, sender, sendResponse){
	logData("[ContentScript] - message received: " + message)
	sendResponse({response: "ContentScript - This is me"})
	
	if (message.action == "execute"){
		run()
	}
}

/**
Run method which extracts all links and sends to background */
function run(){
	logData("[ContentScript] - Run action triggered")
	
	var links = getLinks();
	var sending = browser.runtime.sendMessage({
		topic: "links",
		data: links
	});
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
	logData("[ContentScript] - Total links found: " + linksDetected.length)

	return linksDetected;
}

function logData(data, level) {
	if (loggingActive) {
		switch (level) {
			case "info":
				console.info(data);
				break;
			case "error":
				console.error(data);
				break;
			default:
				console.log(data);
		}
	}
}



