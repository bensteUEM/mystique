//SAMPLE Code in order to run the functionality
 
//var links = getLinksDomainPercentage(true,0.05);
//selectLink(links);

//Should select one link to be opened
function selectLink(links){
	console.log("Returned "+links.length+" links");
	
	logLinks(links)

	//TODO this is not implemented yet
}

function logLinks(links){
	for (link of links){
		console.log(link);
	}
}

//=========================================== 
//=========================================== 
//=========================================== 
//===========================================  

browser.runtime.onMessage.addListener(notify)
window.onload = run()

function notify(message, sender, sendResponse){
	console.log("ContentScript - message received from background: " + message)
	sendResponse({response: "ContentScript - This is me"})
	
	if (message.action == "execute"){
		run()
	}
}

function run(){
	console.log("ContentScript - action triggered")
	
	var links = getLinksDomainPercentage(true, 1);
	//selectLink(links);
	
	var sending = browser.runtime.sendMessage(links);
}

/**
* getLinks is used to get a list of all links in the specified document link
*/

function getLinks(){
	var array = getLinks(true);
	return array;
}

/**
* getLinksDomain is used to get a list of all links in the specified 
@param document link
@param followLinkOnDomainOnly to filter only to same Domain links
*/
function getLinksDomain(followLinkOnDomainOnly){
	var linksDetected = [];
	var aTags = document.getElementsByTagName("a");
	for(var i=0; i<aTags.length; i++) {
		linksDetected.push(aTags[i].href);
	}
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
function getLinksDomainPercentage(followLinkOnDomainOnly,numberOfLinksToClick_max){
	var allLinks = getLinksDomain(followLinkOnDomainOnly);
	var array = [];
	//alert("Choose max "+numberOfLinksToClick_max*100+" % Links");
	console.log("Total links found: " + allLinks.length)
	logLinks(allLinks)
	var numberToChoose = Math.round(numberOfLinksToClick_max*Math.random()*allLinks.length);
	//alert("Chose " + numberToChoose + " of "+ allLinks.length);

	if ((allLinks.length <= numberToChoose) || (allLinks.length<0)){	
		return 	allLinks;
	}
	chosen = 0;
	while (chosen < numberToChoose) {
		pickIndex = Math.floor(Math.random()*allLinks.length)
    		array.push(allLinks[pickIndex]);
    		chosen++;
	}
	return array;
}

/**
* select links is used to get a number of links based on the
*/
function isOnSameDomain(currentPage,checkPage){
	var prefix = /^https?:\/\//i;
    	var domain = /^[^\/]+/;
    	// removing prefix
    	url1 = currentPage.replace(prefix, "");
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
 
