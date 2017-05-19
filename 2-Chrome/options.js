// Saves options to chrome.storage
function save_options() {
  var activate = document.getElementById('activate').checked;
  var followLinkOnDomainOnly = document.getElementById('followLinkOnDomainOnly').checked;
  var maxMegaBytes = document.getElementById('maxMegaBytes').value;
  var maxBytes = (maxMegaBytes * (1024*1024));	// convert from MegaBytes to Bytes
  var maxNumberOfLinksToClick = document.getElementById('maxNumberOfLinksToClick').value;
  var maxLinkDepth = document.getElementById('maxLinkDepth').value;
  var minVisitTime = document.getElementById('minVisitTime').value;
  var maxVisitTime = document.getElementById('maxVisitTime').value;
  var maxPageViewsFromRoot = document.getElementById('maxPageViewsFromRoot').value;
  var blacklist = document.getElementById('blacklist').value;
  var whitelist = document.getElementById('whitelist').value;
  var personas = document.getElementById('personas').value;
  var history = document.getElementById('history').value;
  chrome.storage.sync.set({
    activate: activate, 
	followLinkOnDomainOnly: followLinkOnDomainOnly, 
	maxBytes: maxBytes, 
	maxNumberOfLinksToClick: maxNumberOfLinksToClick, 
	maxLinkDepth: maxLinkDepth, 
	minVisitTime: minVisitTime, 
	maxVisitTime: maxVisitTime, 
	maxPageViewsFromRoot: maxPageViewsFromRoot, 
	blacklist: blacklist, 
	whitelist: whitelist, 
	personas: personas,
	history: history,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    activate: "true", 
	followLinkOnDomainOnly: "false",
	maxBytes: 104857600, 
	maxNumberOfLinksToClick: 30, 
	maxLinkDepth: 4, 
	minVisitTime: 3, 
	maxVisitTime: 120, 
	maxPageViewsFromRoot: 50,
	blacklist: "", 
	whitelist: "", 
	personas: 1,
	history: "",
	usedBytes: 0
  }, function(items) {
    document.getElementById('activate').checked = items.activate;
	var maxMegaBytes = (items.maxBytes / (1024*1024));	// convert from Bytes to MegaBytes
	document.getElementById('maxMegaBytes').value = maxMegaBytes;
    document.getElementById('maxNumberOfLinksToClick').value = items.maxNumberOfLinksToClick;
    document.getElementById('maxLinkDepth').value = items.maxLinkDepth;
    document.getElementById('minVisitTime').value = items.minVisitTime;
    document.getElementById('maxVisitTime').value = items.maxVisitTime;
    document.getElementById('maxPageViewsFromRoot').value = items.maxPageViewsFromRoot;
    document.getElementById('blacklist').value = items.blacklist;
    document.getElementById('whitelist').value = items.whitelist;
    document.getElementById('personas').value = items.personas;
	document.getElementById('history').value = items.history;
	console.log("Used bytes: " + items.usedBytes);
	var sizeInMB = (items.usedBytes / (1024*1024)).toFixed(2);	// convert from Bytes to MegaBytes
	document.getElementById('usedBytes').textContent = sizeInMB;
  });
}


// Clear History
function clear_history(){
  chrome.storage.sync.set({
	history: ""
	}, function() {
	// Clear history box
	document.getElementById('history').value= "History cleared.";
    setTimeout(function() {
      document.getElementById('history').value= "";
    }, 750);	
});
}

function toggle_history(){
	if(document.getElementById('history').style.visibility == 'hidden')
	{
		document.getElementById('history').style.visibility='visible';
		document.getElementById('toggleHistory').textContent='Hide history';
	}
	else 
	{
		document.getElementById('history').style.visibility='hidden';
		document.getElementById('toggleHistory').textContent='Show history';
	}
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('clear').addEventListener('click', clear_history);
document.getElementById('toggleHistory').addEventListener('click', toggle_history);