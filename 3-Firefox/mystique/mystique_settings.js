var globalConfig
var loggingActive = true

//TODO: Move to Background near Initialize
var globalMaxBytes = [80000, 300000, 104857600]
var globalMaxNumberOfLinks = [10, 30, 60]
var globalMaxLinkDepth = [10, 20, 45]

function resetConfig(e) {
	//send reset message background.js   
   	var sending = browser.runtime.sendMessage({
		topic: "configReset",
		data: ""
	});
	logData("resetButton pressed in GUI");
	window.close();
}

function saveConfig(e) {
	if (e != null){
		e.preventDefault();
	}
	
	var completeConfig = {
		selectedPersonaKey: document.querySelector("#personaKey").value,
		personas: globalConfig.personas,
		settings: {
			blacklist: document.querySelector("#blacklist").value.split(","),
        	wishlist: document.querySelector("#wishlist").value.split(","),
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
		logData("[SettingsPopUp] - Settings loading with loadValues "+globalConfig.selectedPersonaKey);

		//Bind Personas to Persona Select
		var personaSelect = document.querySelector("#personaKey");
		for(const p in globalConfig.personas) {
			if(globalConfig.personas.hasOwnProperty(p)) {
				var opt = document.createElement('option');
				opt.value = globalConfig.personas[p].key;
				opt.text = globalConfig.personas[p].key;
				personaSelect.appendChild(opt);
			}
		}
		document.querySelector("#personaKey").value = globalConfig.selectedPersonaKey;
		
		//Load Keywords of the selected persona
		loadKeywords();	
		
		document.querySelector("#blacklist").value = globalConfig.settings.blacklist.join();
		document.querySelector("#wishlist").value = globalConfig.settings.wishlist.join();
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
    logData(error, "error");
  }
}

/** On Off Button pressed load browser settings*/
function toggleState() {	

	globalConfig.settings.functionality = !globalConfig.settings.functionality;
	updateStatusButton();
	
	var sending = browser.runtime.sendMessage({
		topic: "status",
		data: globalConfig.settings.functionality ? "ON" : "OFF"
	});
	
	saveConfig();
}

function updateStatusButton() {
	var className = globalConfig.settings.functionality ? "activated" : "deactivated";
	var statusText = globalConfig.settings.functionality ? "ON" : "OFF";

	var btn = document.querySelector("#power_button");
	if (btn.classList.length > 0) {
		btn.classList.remove(btn.classList.item(0));
	}
	btn.classList.add(className);
	btn.innerText = statusText;
}

function loadKeywords() {
	var selPersonaKeys = globalConfig.personas[document.querySelector("#personaKey").value].keywords;
	var keywordWords = [];
	for(let k = 0; l = k < selPersonaKeys.length; k++) {
		keywordWords.push(selPersonaKeys[k].word);
	}
	document.querySelector("#keywords").textContent = keywordWords.join();
	//TODO #89 document.querySelector("#keywords").textContent = "<ul><li>"+keywordWords.join("</li><li>")+"</li></ul>";
}

document.addEventListener("DOMContentLoaded", restoreConfig);
document.querySelector("form").addEventListener("submit", saveConfig);
document.querySelector("form").addEventListener("reset", resetConfig);
document.querySelector("#power_button").addEventListener("click", toggleState);
document.querySelector("#personaKey").addEventListener("change", loadKeywords);

function logData(data, level) {
	if (loggingActive) {
		switch (level) {
			case "info":
				console.info(data);
				break;
			case "error":
				console.error(data);
				break;
			default:
				console.log(data);
		}
	}
}