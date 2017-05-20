var configTmp;
var personasObjectGlobal;
// Saves options to chrome.storage
function saveConfig() {
  var functionality = document.getElementById('functionality').checked;
  var followLinkOnDomainOnly = document.getElementById('followLinkOnDomainOnly').checked;
  var maxMegaBytes = document.getElementById('maxMegaBytes').value;
  var maxBytes = (maxMegaBytes * (1024*1024));	// convert from MegaBytes to Bytes
  var maxNumberOfLinksToClick = document.getElementById('maxNumberOfLinksToClick').value;
  var maxLinkDepth = document.getElementById('maxLinkDepth').value;
  var minVisitTime = document.getElementById('minVisitTime').value;
  var maxVisitTime = document.getElementById('maxVisitTime').value;
  var maxPageviewsFromRoot = document.getElementById('maxPageviewsFromRoot').value;
  var blacklist = document.getElementById('blacklist').value;
  var wishlist = document.getElementById('wishlist').value;
  var selectedPersonaKey = document.getElementById('personaSelector').value;
  configTmp.settings.functionality = functionality, 
  configTmp.settings.followLinkOnDomainOnly= followLinkOnDomainOnly, 
  configTmp.settings.maxBytes= maxBytes, 
  configTmp.settings.maxNumberOfLinksToClick= maxNumberOfLinksToClick, 
  configTmp.settings.maxLinkDepth= maxLinkDepth, 
  configTmp.settings.minVisitTime= minVisitTime, 
  configTmp.settings.maxVisitTime= maxVisitTime, 
  configTmp.settings.maxPageviewsFromRoot= maxPageviewsFromRoot, 
  configTmp.settings.blacklist= blacklist, 
  configTmp.settings.wishlist= wishlist, 
  configTmp.settings.selectedPersonaKey= selectedPersonaKey,
  chrome.storage.sync.set({
    config: configTmp
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
function restoreConfig() {
  chrome.storage.sync.get({
	config: null,
	usedBytes: 0,
	history: null
  }, function(items) {
	configTmp = items.config;
	fillPersonas(items.config.settings.selectedPersonaKey, items.config.personas);
    document.getElementById('functionality').checked = items.config.settings.functionality;
    document.getElementById('followLinkOnDomainOnly').checked = items.config.settings.followLinkOnDomainOnly;
	var maxMegaBytes = (items.config.settings.maxBytes / (1024*1024));	// convert from Bytes to MegaBytes
	document.getElementById('maxMegaBytes').value = maxMegaBytes;
    document.getElementById('maxNumberOfLinksToClick').value = items.config.settings.maxNumberOfLinksToClick;
    document.getElementById('maxLinkDepth').value = items.config.settings.maxLinkDepth;
    document.getElementById('minVisitTime').value = items.config.settings.minVisitTime;
    document.getElementById('maxVisitTime').value = items.config.settings.maxVisitTime;
    document.getElementById('maxPageviewsFromRoot').value = items.config.settings.maxPageviewsFromRoot;
    document.getElementById('blacklist').value = items.config.settings.blacklist;
    document.getElementById('wishlist').value = items.config.settings.wishlist;
	//document.getElementById('history').value = items.config.settings.history;
	console.log("Used bytes: " + items.usedBytes);
	var sizeInMB = (items.usedBytes / (1024*1024)).toFixed(2);	// convert from Bytes to MegaBytes
	document.getElementById('usedBytes').textContent = sizeInMB;
  });
}


// Clear History
function clearHistory(){
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

function toggleHistory(){
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


function fillPersonas(selectedPersonaKey, personasObject){
	personasObjectGlobal = personasObject;
	var personaSelector = document.getElementById('personaSelector');
	// First: clear all options from personaSelector
	var length = personaSelector.options.length;
	for (i = 0; i < length; i++) {
	  personaSelector.options[i] = null;
	}
	// Now create options from persona that was received from urlLib
	for (var personaKey in personasObject){
		var persona = personasObject[personaKey];
		var opt = document.createElement('option');
		opt.value = persona.key;
		opt.innerHTML = persona.key;
		if(personaKey == selectedPersonaKey) opt.selected = true;
		personaSelector.appendChild(opt);
	}
	getKeywordsOfPersona();
}

function resetConfig(){
	chrome.runtime.sendMessage({ 	
		resetConfig: true
	});
	// Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options have been reset.';
    setTimeout(function() {
      status.textContent = '';
	  restoreConfig();
    }, 500);	
}

function getKeywordsOfPersona()
{
	var keywordList = ""
	var e = document.getElementById("personaSelector");
	var selectedPersonaKeyTmp = e.options[e.selectedIndex].value;
	for (var key in personasObjectGlobal[selectedPersonaKeyTmp].keywords)
	{
		keywordList+= personasObjectGlobal[selectedPersonaKeyTmp].keywords[key].word + ", ";
	}
	document.getElementById("personaKeywords").textContent = keywordList;
}

// Execute on load of page
document.addEventListener('DOMContentLoaded', restoreConfig);

// add event listeners to buttons
document.getElementById('saveSettings').addEventListener('click', saveConfig);
document.getElementById('resetSettings').addEventListener('click', resetConfig);
document.getElementById('personaSelector').addEventListener('change', getKeywordsOfPersona);


//document.getElementById('clearHistory').addEventListener('click', clearHistory);
//document.getElementById('toggleHistory').addEventListener('click', toggleHistory);
