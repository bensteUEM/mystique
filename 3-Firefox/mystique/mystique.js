//SAMPLE Code in order to run the functionality
 
var links = getLinks(false);
selectLink(links);
 

/**
* getLinks is used to get a list of all links in the specified document link
*/
//TODO untested
function getLinks(){
	var array = getLinks(true);
	return array;
}


/**
* getLinks is used to get a list of all links in the specified 
@param document link
@param followLinkOnDomainOnly to filter only to same Domain links
*/
function getLinks(followLinkOnDomainOnly){
	alert(followLinkOnDomainOnly);
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

//=========================================== 
//Should select one link to be opened
function selectLink(links){
	window.alert("This page has got "+links.length+" links");
	//TODO this is not implemented yet
}
 
