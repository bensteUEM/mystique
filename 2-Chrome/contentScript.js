

if (document.readyState === "complete") {
    pageLoaded();
} else {
    window.onload = pageLoaded;
}

function pageLoaded() {
	var arr = [], l = document.links;
	for(var i=0; i<l.length; i++) {
  		arr.push(l[i].href);
	}

	var _bytes = get_byte_size();

	chrome.runtime.sendMessage({ 	
		links: arr,
        url: document.location.href,
		bytes: _bytes
	});
}

function get_byte_size(){
  // Check for support of the PerformanceResourceTiming.*size properties and print their values
  // if supported.
  if (performance === undefined) {
    console.log("= Display Size Data: performance NOT supported");
    return;
  }

  var list = performance.getEntriesByType("resource");
  if (list === undefined) {
    console.log("= Display Size Data: performance.getEntriesByType() is  NOT supported");
    return;
  }

  var bytes = 0;
  for (var i=0; i < list.length; i++) {
	bytes += list[i].decodedBodySize;
	bytes += list[i].encodedBodySize;
	bytes += list[i].transferSize;    
  }

  return bytes; 
}