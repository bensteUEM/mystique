var globalConfig

//TODO: Move to Background near Initialize
var globalMaxBytes = [80000, 300000, 104857600]
var globalMaxNumberOfLinks = [10, 30, 60]
var globalMaxLinkDepth = [10, 20, 45]

function saveConfig(e) {
	e.preventDefault();
	
	var completeConfig = {
		selectedPersonaKey: document.querySelector("#personaKey").value,
		personas: globalConfig.personas,
		settings: {
			blacklist: document.querySelector("#blacklist").value.split(","),
        	wishlist: document.querySelector("#wishlist").value.split(","),
			active: globalConfig.settings.active,
			maxBytes: document.querySelector("#maxBytes").value,
			functionality: globalConfig.settings.functionality,
			tracing: globalConfig.settings.tracing,
			followLinkOnDomainOnly: globalConfig.settings.followLinkOnDomainOnly,
			maxLinkDepth: document.querySelector("#maxLinkDepth").value,
			maxNumberOfLinksToClick: document.querySelector("#maxNumberOfLinksToClick").value,
			minVisitTime: document.querySelector("#minVisitTime").value,
			maxVisitTime: document.querySelector("#maxVisitTime").value,
			maxPageviewsFromRoot: document.querySelector("#maxPageviewsFromRoot").value
		}
	}
	
	//send updated config to background.js   
   	var sending = browser.runtime.sendMessage({
		topic: "configUpdate",
		data: completeConfig
	});
}

/** Firefox addon configuration is opened */
function restoreConfig() {

	//Load Config from Browser Storage
	var getting = browser.storage.local.get("config");
	getting.then(loadValues, onError);

	function loadValues(result) {

		globalConfig = result.config;
		console.log("Settings loading with loadValues "+globalConfig.selectedPersonaKey);


		//Bind Personas to Persona Select
		/*var personaSelect = document.querySelector("#personaKey");
		for(p in globalConfig.personas) {
			var opt = document.createElement('option');
            opt.value = p.key;
            opt.text = p.key;
            personaSelect.appendChild(opt);
		}*/

		document.querySelector("#blacklist").value = globalConfig.settings.blacklist.join();
		document.querySelector("#wishlist").value = globalConfig.settings.wishlist.join();
		document.querySelector("#personaKey").value = globalConfig.selectedPersona;

		document.querySelector("#maxBytes").value = globalConfig.settings.maxBytes;
		document.querySelector("#maxLinkDepth").value = globalConfig.settings.maxLinkDepth;
		document.querySelector("#maxNumberOfLinksToClick").value = globalConfig.settings.maxNumberOfLinksToClick;
		document.querySelector("#minVisitTime").value = globalConfig.settings.minVisitTime;
		document.querySelector("#maxVisitTime").value = globalConfig.settings.maxVisitTime;
		document.querySelector("#maxPageviewsFromRoot").value = globalConfig.settings.maxPageviewsFromRoot;

		//Set Status
		updateStatusButton();
  }
  
  function onError(error) {
    console.log(`Error: ${error}`);
  }
}

/** On Off Button pressed load browser settings*/
function toggleState() {	

	globalConfig.settings.active = !globalConfig.settings.active;
	updateStatusButton();
	
	var active = true; //TODO define in config
	var sending = browser.runtime.sendMessage({
		topic: "status",
		data: globalConfig.settings.active ? "ON" : "OFF"
	});
}

function updateStatusButton() {

	var className = globalConfig.settings.active ? "activated" : "deactivated";
	var statusText = globalConfig.settings.active ? "ON" : "OFF";

	var btn = document.querySelector("#power_button");
	if (btn.classList.length > 0) {
		btn.classList.remove(btn.classList.item(0));
	}
	btn.classList.add(className);
	btn.innerText = statusText;
}

document.addEventListener("DOMContentLoaded", restoreConfig);
document.querySelector("form").addEventListener("submit", saveConfig);
document.querySelector("#power_button").addEventListener("click", toggleState);
            "blacklist": ["bild"],
            "wishlist": ["aktie"],
			"selectedPersonaKey": "Banker",
            "personas": {
                "Banker": {
                    "key": "Banker",
                    "keywords": [
                        { "word": "DAX", "score": 0 },
                        { "word": "Börsenkurs", "score": 5 },
                        { "word": "Aktien", "score": 10 },
                        { "word": "Wechselkurse", "score": 3 },
                        { "word": "Goldpreis", "score": 7 }
                    ],
                    "defaultURLs": [
                        "http://www.boerse.de/",
                        "http://www.faz.net/aktuell/finanzen/"
                    ]
                },
				"Hundebesitzer": {
                    "key": "Hundebesitzer",
                    "keywords": [
                        { "word": "Hundefutter", "score": 0 },
                        { "word": "Hundesteuer", "score": 5 },
                        { "word": "Kotbeutel", "score": 10 },
                        { "word": "Halsband", "score": 3 },
                        { "word": "Tierarzt", "score": 7 }
                    ],
                    "defaultURLs": [
                        "http://www.fressnapf.de",
                        "http://www.hunde.de"
                    ]
                },
				"Surfer": {
                    "key": "Surfer",
                    "keywords": [
                        { "word": "Hawaii", "score": 0 },
                        { "word": "surfen", "score": 5 },
                        { "word": "Welle", "score": 10 },
                        { "word": "Carve", "score": 3 },
                        { "word": "Surfbrett", "score": 7 },
						{ "word": "Meer", "score": 6 }
                    ],
                    "defaultURLs": [
                        "http://www.surfen.de",
                        "http://www.holidaycheck.de"
                    ]
                }
            },
            "settings": {
				"active": false,
                "maxBytes": 1, //Per day -> equals 100MB
                "functionality": true,
                "tracing": true,
                "followLinkOnDomainOnly": true,
                "maxLinkDepth": 0,
                "maxNumberOfLinksToClick": 2, // value is interpreted in percent, so no need for a float
                "minVisitTime": 3,
                "maxVisitTime": 120,
                "maxPageviewsFromRoot": 50
				}
			}
