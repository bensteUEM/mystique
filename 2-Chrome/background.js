// We need to get them from the urlLib later
var urls = ["http://google.de", "http://amazon.de", "http://ebay.de"];
var subUrl;

// We need to load this from the settings
var runMystique = true;

var maxLinkDepth;
var currLinkDepth = 0;

// Reference for tab, which loads the given urls
var urlWindow;
// count index to get the current url from the urls lib
var index = 0;
// global interval to load urls 
var loadUrlInterval;
// interval duration in ms
var intervalDuration = 5000;
// the next url which should be opened.
// Could be null at the moment because the urlLib is very slow at generating new urls!"
var nextUrl = null;

// Wordlist copied from urlLib to call generateURL
var wordlist = ["abacus", "abbey", "abdomen", "ability", "abolishment", "abroad", "accelerant", "accelerator", "accident", "accompanist", "accordion", "account", "accountant", "achieve", "achiever", "acid", "acknowledgment", "acoustic", "acoustics", "acrylic", "act", "action", "active", "activity", "actor", "actress", "acupuncture", "ad", "adapter", "addiction", "addition", "address", "adjustment", "administration", "adrenalin"];

chrome.storage.sync.get({
    activate: "true",
    linksOnDomainOnly: "false",
    maxBytes: '100',
    linkCoveragePecentage: 10,
    linkDepth: 5,
}, function(items) {
    runMystique = items.activate;
    maxLinkDepth = items.linkDepth;
});

loadUrlInterval = setInterval(function() {
	if(!urlWindow){
		urlWindow = window.open();
	}
	if(runMystique) {
        if(!subUrl || currLinkDepth >= maxLinkDepth) {
	        urlWindow.location.href = urls[index];
            index++;
            currLinkDepth = 0;
        } else {
            urlWindow.location.href = subUrl;
            currLinkDepth++;
        }


	} else {
        clearInterval(loadUrlInterval);
	}

    /*urlLib.generateURL({wordlist: wordlist}).then((url) => {
        if(url) {
            urls.push(url);
        }
    }).catch((err) => {
        console.log("Error ", err);
    }); */
}, intervalDuration);


// Get HTML DOM from page -> TO BE Checked ...
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	console.log("Links ", request.links);

    // add one (maybe multiple) subUrls from the called url (randomized)

    subUrl = request.links[getRandomInt(0, request.links.length)];
    console.log("Call: ",sender.url);
	var HistVar = "";
	chrome.storage.sync.get("history", function(items) {
        HistVar = items.history;
		console.log("History: ",HistVar);
    });

	//trouble to save history
	HistVar = HistVar +  sender.url + "\n";
	chrome.storage.sync.set({
        'history': HistVar
    }, function() {
    });
	// console.log(request.dom);
  });

// Get changes from settings
chrome.storage.onChanged.addListener(function(changes, namespace) {
	let active = 'activate';
	if (changes.hasOwnProperty(active)) {
        let storageChange = changes[active];
        runMystique = storageChange.newValue
    }
});


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}