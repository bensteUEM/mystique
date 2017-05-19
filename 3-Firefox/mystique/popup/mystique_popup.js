function openSettings() {

	var opening = browser.runtime.openOptionsPage();
	opening.then(onOpened, onError);
	
	function onError(error) {
	  console.log(`Error: ${error}`);
	}
}

function restoreConfig() {

  function loadValues(result) {
	  
	  var config = result.fakeConfig;
	  
	  //Set default values of no config found in the storage
	  //TODO: Init will be done by library in future
	  if(config == null) {
		  config = {
            blacklist: ["bild"],
            whishlist: [],
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

	document.querySelector("#blackList").value = config.blackList;
	document.querySelector("#wishList").value = config.wishList;
	document.querySelector("#personaKey").value = config.persona.key;
	//document.querySelector("#keywords").value = config.persona.keywords;
	//document.querySelector("#defaultUrls").value = config.persona.defaultUrls;
	document.querySelector("#maxBytes").value = config.settings.maxBytes;
	document.querySelector("#maxLinkDepth").value = config.settings.maxLinkDepth;
	document.querySelector("#maxNumberOfLinksToClick").value = config.settings.maxNumberOfLinksToClick;
	document.querySelector("#minVisitTime").value = config.settings.minVisitTime;
    document.querySelector("#maxVisitTime").value = config.settings.maxVisitTime;
    //document.querySelector("#maxPageviewsFromRoot").value = config.settings.maxPageviewsFromRoot;
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

	//load settings
	var getting = browser.storage.local.get("fakeConfig");
    getting.then(toggleStateWithConfig, onError);
  
    function onError(error) {
    console.log(`Error: ${error}`);
    }
}
	
function toggleStateWithConfig(result) {

    console.log("toggleStateWithConfig result: " + result)
    console.log("toggleStateWithConfig result.fakeconfig: " + result.fakeConfig)
    
   	var sending = browser.runtime.sendMessage({
		topic: "config",
		data: result.fakeConfig
    
	});
	var active = true; //TODO: Get Status of Extension
	var className = active ? "activated" : "deactivated";
	var statusText = active ? "ON" : "OFF";
	
//	var btn = document.querySelector("#power_button");
//	if (btn.classList.length > 0) {
//		btn.classList.remove(e.target.classList.item(0));
//	}
//	btn.classList.add(className);
//	btn.innerText = statusText;
	
	var sending = browser.runtime.sendMessage({
		topic: "status",
		data: active ? "ON" : "OFF"
	});
}

document.querySelector("#settings_link").addEventListener("click", openSettings);
document.querySelector("#power_button").addEventListener("click", toggleState);
document.addEventListener("DOMContentLoaded", restoreConfig);
//document.addEventListener("DOMContentLoaded", loadStatus);

