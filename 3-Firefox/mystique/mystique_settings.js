function saveConfig(e) {
	e.preventDefault();
	
	var fakeConfig: {
		blackList: document.querySelector("#blackList").value,
		wishList: document.querySelector("#wishList").value,
		persona: {
			key: document.querySelector("#personaKey").value,
			keywords: document.querySelector("#keywords").value,
			defaultUrls: document.querySelector("#defaultUrls").value
		}
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
}

function restoreConfig() {

  function loadValues(result) {
	  
	  var config = result.fakeConfig;
	  
	  //Set default values of no config found in the storage
	  if(config == null) {
		  config = {
            /*blacklist: ["bild"],
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
            },*/
            settings: {
                maxBytes: 5000, //PER dAY
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

	//document.querySelector("#blackList").value = config.blackList;
	//document.querySelector("#wishList").value = config.wishList;
	//document.querySelector("#personaKey").value = config.persona.key;
	//document.querySelector("#keywords").value = config.persona.keywords;
	//document.querySelector("#defaultUrls").value = config.persona.defaultUrls;
	document.querySelector("#maxBytes").value = 5;//config.settings.maxBytes;
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

document.addEventListener("DOMContentLoaded", restoreConfig);
document.querySelector("form").addEventListener("submit", saveConfig);