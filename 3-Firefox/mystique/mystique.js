//SAMPLE Code in order to run the functionality
 
//var links = getLinksDomainPercentage(true,0.05);
//selectLink(links);

//Should select one link to be opened
function selectLink(links){
	console.log("Returned "+links.length+" links");
	
	for (link of links){
		console.log(link);
	}
	
	//window.alert("Returned "+links.length+" links");
	//alert(links);
	//TODO this is not implemented yet
}

//=========================================== 
//=========================================== 
//=========================================== 
//===========================================  

//var comPort
//
//browser.runtime.onConnect.addListener(connected)
//
//function connected(port){
//	console.log("Content script received connection from background script")	
//	comPort = port
//	
//	port.postMessage({response: "ContentScript - This is me"})
//	port.onMessage.addListener(messageReceived)
//	
//	document.addEventListener("DOMContentLoaded", domLoaded)
//}
//
//function messageReceived(message){
//	console.log("ContentScript - message received from background: " + message.action)
//	
//	if (message.action == "execute"){
//		var links = getLinksDomainPercentage(true,0.05);
//		selectLink(links);
//		
//		console.log("ContentScript - action triggered")
//	}
//}

browser.runtime.onMessage.addListener(notify)

function notify(message, sender, sendResponse){
	console.log("ContentScript - message received from background: " + message)
	sendResponse({response: "ContentScript - This is me"})
	
	if (message.action == "execute"){
		run()
	}
}

function run(){
	console.log("ContentScript - action triggered")
	
	var links = getLinksDomainPercentage(true,0.05);
	selectLink(links);
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
	return linksDetected;
}



