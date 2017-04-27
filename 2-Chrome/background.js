// We need to get them from the urlLib later
var urls = ["http://google.de", "http://amazon.de", "http://ebay.de"];

// We need to load this from the settings
var runMystique = true;

// Reference for tab, which loads the given urls
var urlWindow;
// count index to get the current url from the urls lib
var index = 0;
// global interval to load urls 
var loadUrlInterval;
// interval duration in ms
var intervalDuration = 5000;

loadUrlInterval = setInterval(function() {
	if(index === 0){
		urlWindow = window.open();
	} else if(!runMystique) {
		clearInterval(loadUrlInterval);
		return;
	}
	urlWindow.location.href = urls[index % urls.length];

	
	index++;
}, intervalDuration);


// Get HTML DOM from page -> TO BE Checked ...
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	console.log("Links ", request.links);
	// console.log(request.dom);
  });