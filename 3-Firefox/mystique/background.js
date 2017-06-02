// for testing purposes
var i = 0
var wl = ["abacus", "abbey", "abdomen", "ability", "abolishment", "abroad", "accelerant", "accelerator", "accident", "accompanist", "accordion", "account", "accountant", "achieve", "achiever", "acid", "acknowledgment", "acoustic", "acoustics", "acrylic", "act", "action", "active", "activity", "actor", "actress", "acupuncture", "ad", "adapter", "addiction", "addition", "address", "adjustment", "administration", "adrenalin"];
var interval = 5000;
var startingUrl = ["https://de.wikipedia.org/wiki/Wikipedia:Hauptseite"];

//TODO this needs to be started with the run of the application #67
var getting = browser.storage.local.get("fakeConfig");
logData("[InitProcess] - Browser config object requested");
getting.then(loadValues, onError);

function loadValues(result) {
    config = result.fakeConfig;
	logData("[InitProcess] - Config loaded from browser - " + config);

	if(config == null) {
	    config = urlLib.initializeConfig();
	    logData("[InitProcess] - Config linitialized from library because browser config was NULL - " + config);
    }
}

// functionality to open a given URL in a separate tab object 

var loggingActive = true
var tabId = -1
var windowId = -1
var lastUrlRequested
var runInNewWindow = false

var config
var urls = []

browser.runtime.onMessage.addListener(messageReceived)

function sessionHandler(links){
	logData("[SessionHandler] - Started: " + links)

	if(maintainLinksToFollow(links)){
		logData("[SessionHandler] - URL list is empty")
		
		// TODO replace testing code with the section below
		maintainLinksToFollow(startingUrl);
		openUrl(urls[0].url, runInNewWindow);

//		let persona = "Banker"; //TODO #61
//		//TODO #61 use correct config object
//		urlLib.generateURL(persona, urlLib.initializeConfig()).then(function(url) {
//				console.log("Got link from library: " + url.result);
//
//				maintainLinksToFollow(url.result);
//				openUrl(urls[0].url, runInNewWindow);
//			});
	}
	else {
		logData("[SessionHandler] - URL list is filled")
		setTimeout(timerTriggered, 5000);//TODO #61 random from max/min
	}

	function timerTriggered() {
		openUrl(urls[0].url, runInNewWindow)
	}
}

// config.settings.maxPageviewsFromRoot

function messageReceived(message, sender, sendResponse){
	logData("[MessageHandler] - Message received")
	
	if (message.topic == "links" && sender.tab.id == tabId) {
		logData("[MessageHandler] - " + message.data.length + " links received from CS")
		let filteredLinks = getLinksDomainPercentage(message.data,config.settings.followLinkOnDomainOnly,config.settings.maxNumberOfLinksToClick)
		logData("[MessageHandler] - " + filteredLinks.length + " links remain after filtering")
		sessionHandler(filteredLinks);
	}
	else if (message.topic == "status") {
		logData("[MessageHandler] - Status: " + message.data)
		if (message.data == "ON"){
			sessionHandler();
		}
		else {
			// stop execution
		}
	}
}

/**
 * This function maintains the global URL list. It takes new links to be added as an argument and adds them to the global list.
 * Hereby it takes care of the correct link order (next link to be opened is always at first index) and keeps track of the max link depth. 
 * 
 * @param newLinks to be added to the global list of links that have to opened
 * @returns isListEmpty == true when the global URL is empty
 */
function maintainLinksToFollow(newLinks) {
	
	// CASE: URL list is initially empty
	if (urls.length == 0 && (newLinks == null || newLinks.length == 0)) {
		logData("[LinkManager] - URL list intially empty");
		return true;
	}
	else if (urls.length == 0 && newLinks.length >= 0){
		logData("[LinkManager] - Filling URL list initially");
		fillTree();
		logData(urls, "info");
	}
	// CASE: max link depth not yet reached and new links have been provided
	else if (urls[0].level > 0 && !(newLinks == null || newLinks.length == 0)) {
		logData("[LinkManager] - Adding new links to URL list");
		fillTree();
		logData(urls, "info");
	}
	// CASE: max link depth reached and/or NO new links have been provided while URL list wasn't empty yet
	else {
		logData("[LinkManager] - Reducing URL list");
		reduceTree();
		logData(urls, "info");
		if (urls.length == 0) {
			logData("[LinkManager] - URL list is empty again");
			return true;
		}
	}
	
	return false;
	
	function reduceTree(){
		let lastLevel
		do {
			lastLevel = urls[0].level
			urls.splice(0, 1)
		} while (urls.length > 0 && urls[0].level != lastLevel);
	}
	
	function fillTree(){
		let nextLevel
		
		if (urls.length == 0) {
			nextLevel = config.settings.maxLinkDepth;
			logData("[LinkManager] - Filling on level " + nextLevel);
		}
		else {
			nextLevel = urls[0].level - 1
			logData("[LinkManager] - Filling on level " + nextLevel);
		}

		newLinks = newLinks.map((link) => {
            return {
                url: link,
                level: nextLevel
            };
        });
		
		urls = newLinks.concat(urls);
	}
}

//function calls the libary to generate a random URL from the wordlist
function getLinkFromLibary(){

	let persona = "Banker"; //TODO #61 get current persona

	urlLib.generateURL(persona, urlLib.initializeConfig()).then(function(url) {
			logData("[UrlLibrary] - Got new link: " + url.result);
			return url.result
			});
}

/**
 * Opens the given URL in a new tab. If the function has already been called at least once 
 * the tab that was initially created will be reused in every subsequent function call to open the given URL.
 * The new tab can either be opened in the current window or in a new one alternatively.
 * 
 * @param url the URL to be opened
 * @param inNewWindow specifies whether the URL shall be opened in a new window 
 */
function openUrl(url, inNewWindow) {
	
	if(inNewWindow) {
		
		if (windowId < 0) {
			logData("[TabManager] - Creating new window to run addon inside");
			
			lastUrlRequested = url
			
			windowCreating = browser.windows.create({
				incognito: true,
				state: "minimized"
			});
			
			windowCreating.then(onWindowCreated, onError);
		}
		else {
			maintainAddOnTab(url, windowId)
		}
	}
	else {
		maintainAddOnTab(url, null)
	}
	
	function onWindowCreated(window) {
		windowId = window.id
		
		logData('[TabManager] - New window created - ID: ' + window.id +
				' / FOCUSED: ' + window.focused);
				
		maintainAddOnTab(lastUrlRequested, windowId)
	}
}

/**
 * Helper function that keeps track of the single tab which is supposed to serve the add-on for URL calls only.
 * Therefore a tab object is created, updated or reopened if necessary. 
 * 
 * @param url
 * @param windowId
 */
function maintainAddOnTab(url, windowId) {
	lastUrlRequested = url
	
	if (tabId < 0) {
		if (windowId == null){
			var creating = browser.tabs.create({
				url: url,
				active: false,
				index: 0,
				pinned: true
			});
		}
		else {
			var creating = browser.tabs.create({
				url: url,
				active: true,
				index: 0,
				windowId: windowId
			});
		}
		
		creating.then(onTabProcessed, onError);
	} else {
		var updatingTab = browser.tabs.update(tabId, {
			url: url
		});
		
		updatingTab.then(onTabProcessed, onUpdateTabError)
	}
	
	function onTabProcessed(tab) {
		 
		tabId = tab.id
		logData('[TabManager] - New tab created - ID: ' + tab.id +
				' / SELECTED: ' + tab.selected +
				' / PINNED: ' + tab.pinned +
				' / TITLE: ' + tab.title +
				' / STATUS: ' + tab.status +
				' / WINDOW-ID: ' + tab.windowId +
				' / URL: ' + tab.url);
	}
	
	function onUpdateTabError(error){
		logData(error, "error");
		
		if (runInNewWindow) {
			// check whether the separate window still exists - otherwise open again 
			getting = browser.windows.get(windowId)
			getting.then(reopenTab, onGetWindowError)
		}
		else {
			reopenTab()
		}
		
		function onGetWindowError(error) {
			logData(error, "error");
			
			windowId = -1
			reopenTab()
		}
	}
}

function sendMessageToContentScript(command){
	
	browser.tabs.sendMessage(
			tabId,
			{action: command}
		).then(response => {
			messageReceived(response);
		});
}

function reopenTab(){
	tabId = -1
	openUrl(lastUrlRequested, runInNewWindow)
}

function onError(error) {
	logData(error, "error")
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


//========================= Link handling part

/**
* getLinksDomain is used to get a list of all links in the specified 
@param document link
@param followLinkOnDomainOnly to filter only to same Domain links
*/

function getLinksDomain(followLinkOnDomainOnly){
    linksDetected = CONTENTSCRIPT.getLinks(); //TODO
	var array = [];
	for(var i=0; i<linksDetected.length; i++) {
		if (isOnSameDomain(document.location.href,linksDetected[i])){
			array.push(linksDetected[i]);
		}
		else if (followLinkOnDomainOnly) {
			array.push(linksDetected[i]);
		}

	}
	return array;
}

/**
* getLinksDomain is used to get a list of all links in the specified 
@param document link
@param followLinkOnDomainOnly to filter only to same Domain links
*/
function getLinksDomainPercentage(allLinks,followLinkOnDomainOnly,maxNumberOfLinksToClick){
	var array = [];
	//alert("Choose max "+maxNumberOfLinksToClick*100+" % Links");
	var numberToChoose = Math.round(maxNumberOfLinksToClick*Math.random()*allLinks.length);
	//alert("Chose " + numberToChoose + " of "+ allLinks.length);

	if ((allLinks.length <= numberToChoose) || (allLinks.length<0)){	
		return 	allLinks;
	}
	var chosen = 0;
	var index = 0;
	var pickedLinks = [];
	while (chosen < numberToChoose && index < allLinks.length) {
		pickIndex = Math.floor(Math.random()*allLinks.length);
		pickedLinks.push(pickIndex)
		index++;
		
		// TODO #61 use correct config object
		if(urlLib.approveURL(allLinks[pickIndex], urlLib.initializeConfig())) {
			array.push(allLinks[pickIndex]);
	    	chosen++;
		}
	}
	logData("[LinkEvaluation] - Picked links: " + pickedLinks);
	logData("[LinkEvaluation] - No. of links tried to approve: " + index);
	return array;
}

/**
* select links is used to get a number of links based on the
*/
function isOnSameDomain(checkPage){
	var prefix = /^https?:\/\//i;
    var domain = /^[^\/]+/;
    // removing prefix
    url1 = window.location.href.replace(prefix, "");
	url2 = checkPage.replace(prefix, "");
    	// if link starts with / it is on the current page
	if (url2.charAt(0) === "/") {
        	return true;
    	}
    	// extract domain and compare
   	var part1 = url1.match(domain).toString();
	var part2 = url2.match(domain);
	return part1.includes(part2);
}

//========================= USER AGENT Part

/*
Rewrite the User-Agent header to "ua".
from https://github.com/mdn/webextensions-examples/blob/master/user-agent-rewriter/background.js
*/
function rewriteUserAgentHeader(e) {
	var uaStrings = generateUA();
	var ua = uaStrings[Math.floor(Math.random()*uaStrings.length)];
	//ua = "Mozilla/5.0 (iPad; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/600.1.4"];
  	for (var header of e.requestHeaders) {
    		if (header.name.toLowerCase() === "user-agent") {
      		    header.value = ua;
   		}
 	 }
 	return {requestHeaders: e.requestHeaders};
}

/*
Add rewriteUserAgentHeader as a listener to onBeforeSendHeaders,
only for the target page.
Make it "blocking" so we can modify the headers.
from https://github.com/mdn/webextensions-examples/blob/master/user-agent-rewriter/background.js
*/
/*
var targetPage = "http://useragentstring.com/*";
browser.webRequest.onBeforeSendHeaders.addListener(rewriteUserAgentHeader,{urls: [targetPage]},["blocking", "requestHeaders"]);
*/

/*
Map browser names to UA strings.
*/
/*
function generateUA(){
    
	//WINDOWS Platform
	var winVersions = ["10.0","6.3","6.2","6.1","6.0","5.2","5.1","5.0"];
	var windows = [];
	for (version of winVersions){
		windows.push("Windows NT "+version+";");
		windows.push("Windows NT "+version+"; Win64; x64;");
		windows.push("Windows NT "+version+"; WOW64;");
	}

	//OSX Platform
	var osxVersions = ["10.0","10.1","10.2","10.3","10.4","10.5","10.6","10.7","10.8","10.9","10.10","10.11","10.12"];
	var apple = [];	
	for (version of osxVersions){
		apple.push("Macintosh; Intel Mac OS X "+version+";");
		apple.push("Macintosh; PPC Mac OS X "+version+";");
	}

	//LINUX Platform
	var linux = ["X11; Linux i686;","X11; Linux x86_64;","X11; Linux i686 on x86_64;","Maemo; Linux armv7l;","X11; Ubuntu; Linux i686;","X11; Ubuntu; Linux x86_64;","X11; Ubuntu; Linux i686 on x86_64;"];

	//ANDROID Platform
	var androidVersions = ["7.1","7.0","6.0","5.1","5.0","4.4","4.3","4.2","4.1"];
	var android = ["Android; Mobile","Android; Tablet"];
	for (version in osxVersions){
		android.push("Android "+version+"; Mobile;");
		android.push("Android "+version+"; Tablet;");
	}
	
	var allUseablePlatforms = [];
	if (true) {//TODO #61 once personas do exist choose platform based on Persona #2 {
		allUseablePlatforms = allUseablePlatforms.concat(windows);
	} if (true) {
		allUseablePlatforms = allUseablePlatforms.concat(apple);
	} if (true) {
		allUseablePlatforms = allUseablePlatforms.concat(linux);
	} if (true) {
		allUseablePlatforms = allUseablePlatforms.concat(android);
	}

	var platform = 	allUseablePlatforms[Math.floor(Math.random()*allUseablePlatforms.length)];

	var geckoversions = ["18.0","18.1","26.0","28.0","30","32","34","37","44"] //all link a Firefox OS version
	var rv_geckoversion = geckoversions[Math.floor(Math.random()*geckoversions.length)];

	var geckotrail = "Gecko/20100101" //20100101 for Desktops //TODO change for mobile #12 depending on #2
	var firefoxversions = ["25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45","46","47","48","49","50","51","52","53","54","55","56","57","58","59","60","61"]
	var firefoxversion = firefoxversions[Math.floor(Math.random()*firefoxversions.length)];	

	var generateUA = ["Mozilla/5.0 (" + platform + " rv:"+rv_geckoversion + ") "+ geckotrail + " Firefox/"+firefoxversion];

	// COMPLETE UA Strings for special platforms
	var iOSUA = ["Mozilla/5.0 (iPod touch; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/600.1.4",
	            "Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/600.1.4",
	            "Mozilla/5.0 (iPad; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/600.1.4"];
	            
	            //TODO decide which should be used based on personas #2
    
	return generateUA;
}
*/