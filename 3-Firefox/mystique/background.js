// for testing purposes
var urlList = ["https://www.google.de", "https://wikipedia.de", "https://ebay.de", "https://kansdf.de"]
var i = 0
var wl = ["abacus", "abbey", "abdomen", "ability", "abolishment", "abroad", "accelerant", "accelerator", "accident", "accompanist", "accordion", "account", "accountant", "achieve", "achiever", "acid", "acknowledgment", "acoustic", "acoustics", "acrylic", "act", "action", "active", "activity", "actor", "actress", "acupuncture", "ad", "adapter", "addiction", "addition", "address", "adjustment", "administration", "adrenalin"];
var interval = 5000;

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
* ToDo Listener to cancel interval if plugin is turned off
*/
function callTimer(){
	setInterval(urlProvider,interval);
	console.log(interval);
}

/**
* function calls the libary to generate a random URL from the wordlist
*/
function callLibary(){

	//ToDo place libary at the right place
	urlLib.generateURL({
		wordlist: wl
		}).then(function(url) {
			console.log(url);
			openUrl(url);
			});
}
//Testing purpose function whitelisting
var wert= "//...dadd"

/**
* Checks the url if it fits the whitelist conditions to disregard 
* relative links thta start with text only
*	@param url the URL to be checked
*/
function whiteListing(url){
       const pattern = /(^http)|(^https)|[^/]|[^./]|[^../]|(^javascript)/;
       let match = pattern.exec(wert);
       if (match)
        //ToDo call the openurl function  
		console.log("da");
	  else{
		  //ToDo What happens if the whitelist check is not positive
		  console.log("weg");
	  }
}

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
var targetPage = "http://useragentstring.com/*";
browser.webRequest.onBeforeSendHeaders.addListener(rewriteUserAgentHeader,{urls: [targetPage]},["blocking", "requestHeaders"]);

/*
Map browser names to UA strings.
*/
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
	if (true) {//TODO once personas do exist choose platform based on Persona #2 {
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
