function saveConfig(e) {
	e.preventDefault();
	
	var fakeConfig = {
		blacklist: document.querySelector("#blacklist").value.split(","),
		wishlist: document.querySelector("#wishlist").value.split(","),
		persona: {
			key: document.querySelector("#personaKey").value,
			keywords: restoreKeywords(),
			defaultURLs: document.querySelector("#defaultURLs").value.split(",")
		},
		settings: {
			maxBytes: document.querySelector("#maxBytes").value,
			functionality: true,
			tracing: true,
			followLinkOnDomainOnly: true,
			maxLinkDepth: document.querySelector("#maxLinkDepth").value,
			maxNumberOfLinksToClick: document.querySelector("#maxNumberOfLinksToClick").value,
			minVisitTime: document.querySelector("#minVisitTime").value,
			maxVisitTime: document.querySelector("#maxVisitTime").value,
			maxPageviewsFromRoot: document.querySelector("#maxPageviewsFromRoot").value
		}
	}
  
	var config = browser.storage.local.set({fakeConfig});
	config.then(null, onError);
	
	function onError(error) {
		console.log(`Error: ${error}`);
	}
	
	function restoreKeywords() {
		var keyObj;
		var keywordstrings = [];
		var keywordobjects = [];
		keywordstrings = document.querySelector("#keywords").value.split();
		for(k in keywordstrings) {
			keyObj = { word: k.substring(0, indexOf("(")), score: k.substring(indexOf("(")+1, indexOf(")")) }
			keywordobjects.push(keyObj);
		}
		
		return keywordobjects;
	}
}

function restoreConfig() {

  function loadValues(result) {
	  
	  var config = result.fakeConfig;
	  
	  //Set default values of no config found in the storage
	  if(config == null) {
		  config = {
            blacklist: ["bild", "test"],
            wishlist: ["geld", "aktie"],
            persona: {                
                key: "Banker",
                keywords: [
                    { word: "DAX", score: 0 },
                    { word: "Börsenkurs", score: 5 },
                    { word: "Aktien", score: 10 },
                    { word: "Wechselkurse", score: 3 },
                    { word: "Goldpreis", score: 7 }
                ],
                defaultURLs: [
                    "http://www.boerse.de/",
                    "http://www.faz.net/aktuell/finanzen/"
                ]
            },
            settings: {
                maxBytes: 5000,
                functionality: true,
                tracing: true,
                followLinkOnDomainOnly: true,
                maxLinkDepth: 5,
                maxNumberOfLinksToClick: 0.1,
                minVisitTime: 60,
                maxVisitTime: 600,
                maxPageviewsFromRoot: 100
            }
        }
	  }
	  
	var keywordstrings = [];
		for(k in config.persona.keywords) {
			keywordstrings.push(k.word + "(" + k.score + ")");
	  }
	  
	document.querySelector("#blacklist").value = config.blacklist.join();
	document.querySelector("#wishlist").value = config.wishlist.join();
	document.querySelector("#personaKey").value = config.persona.key;
	document.querySelector("#keywords").value = keywordstrings.join();
	document.querySelector("#defaultURLs").value = config.persona.defaultURLs.join();
	document.querySelector("#maxBytes").value = config.settings.maxBytes;
	document.querySelector("#maxLinkDepth").value = config.settings.maxLinkDepth;
	document.querySelector("#maxNumberOfLinksToClick").value = config.settings.maxNumberOfLinksToClick;
	document.querySelector("#minVisitTime").value = config.settings.minVisitTime;
    document.querySelector("#maxVisitTime").value = config.settings.maxVisitTime;
    document.querySelector("#maxPageviewsFromRoot").value = config.settings.maxPageviewsFromRoot;
  }
  
  var getting = browser.storage.local.get("fakeConfig");
  getting.then(loadValues, onError);
  
  function onError(error) {
    console.log(`Error: ${error}`);
  }
}

function loadStatus() {

	function getStatus() {
	  
		var active = true; //TODO: Get Status of Extension
		var className = active ? "activated" : "deactivated";
		var statusText = active ? "ON" : "OFF";
		
		document.querySelector("#power_button").classList.add(className);
		document.querySelector("#power_button").textContent = statusText;
	}
  
	function onError(error) {
		console.log(`Error: ${error}`);
	}
  
	//TODO:Get Status of Extension
	//var getting = browser.management.get(browser.runtime.id);
	//getting.then(getStatus, onError);
	getStatus();
}

function toggleState() {

	var active = true; //TODO: Get Status of Extension
	var className = active ? "activated" : "deactivated";
	var statusText = active ? "ON" : "OFF";
	
	var btn = document.querySelector("#power_button");
	if (btn.classList.length > 0) {
		btn.classList.remove(e.target.classList.item(0));
	}
	btn.classList.add(className);
	btn.innerText = statusText; 
}

document.addEventListener("DOMContentLoaded", restoreConfig);
document.querySelector("form").addEventListener("submit", saveConfig);
document.addEventListener("DOMContentLoaded", loadStatus);
document.querySelector("#power_button").addEventListener("click", toggleState);