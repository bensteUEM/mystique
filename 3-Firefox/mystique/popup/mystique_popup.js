function openSettings() {

	var opening = browser.runtime.openOptionsPage();
	opening.then(onOpened, onError);
	
	function onError(error) {
	  console.log(`Error: ${error}`);
	}
}

function loadSettings() {

  function getValues(result) {
	  
	  var config = result.fakeConfig;

	  //Set default values of no config found in the storage
	  //TODO: Init will be done by library in future
	  if(config == null) {
		  config = {
            blacklist: ["bild", "test"],
            wishlist: ["geld", "aktie"],
            persona: {
                key: "Banker",
                 keywords: [
                    { "word": "DAX", "score": 0 },
                    { "word": "Börsenkurs", "score": 5 },
                    { "word": "Aktien", "score": 10 },
                    { "word": "Wechselkurse", "score": 3 },
                    { "word": "Goldpreis", "score": 7 }
                ],
                defaultURLs: [
                    "http://www.boerse.de/",
                    "http://www.faz.net/aktuell/finanzen/"
                ]
            },
            settings: {
                maxBytes: 5000, //PER dAY
                functionlity: true,
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

	document.querySelector("#blacklist").textContent = config.blacklist.join();
	document.querySelector("#wishlist").textContent = config.wishlist.join();
	document.querySelector("#personaKey").textContent = config.persona.key;
	//document.querySelector("#keywords").textContent = config.persona.keywords;
	//document.querySelector("#defaultURLs").textContent = config.persona.defaultURLs.join();
	document.querySelector("#maxBytes").textContent = config.settings.maxBytes;
	document.querySelector("#maxLinkDepth").textContent = config.settings.maxLinkDepth;
	document.querySelector("#maxNumberOfLinksToClick").textContent = config.settings.maxNumberOfLinksToClick;
	document.querySelector("#minVisitTime").textContent = config.settings.minVisitTime;
    document.querySelector("#maxVisitTime").textContent = config.settings.maxVisitTime;
    document.querySelector("#maxPageviewsFromRoot").textContent = config.settings.maxPageviewsFromRoot;
  }
  
  var getting = browser.storage.local.get("settings");
  getting.then(getValues, onError);
  
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

document.querySelector("#settings_link").addEventListener("click", openSettings);
document.querySelector("#power_button").addEventListener("click", toggleState);
document.addEventListener("DOMContentLoaded", restoreConfig);
document.addEventListener("DOMContentLoaded", loadStatus);

