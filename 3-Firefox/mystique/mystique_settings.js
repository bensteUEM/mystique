function saveSettings(e) {
	e.preventDefault();
	
	var settings = {
		maxBytes: document.querySelector("#maxBytes").value,
		linkCountPercent: document.querySelector("#linkCountPercent").value,
		linkDepthMax: document.querySelector("#linkDepthMax").value,
		persona: document.querySelector("#persona").value,
		blackList: document.querySelector("#blackList").value,
		wishList: document.querySelector("#wishList").value
	}
  
	var setting = browser.storage.local.set({settings});
	setting.then(null, onError);
	
	function onError(error) {
		console.log(`Error: ${error}`);
	}

}

function restoreSettings() {

  function loadValues(result) {
	  
	  var settings = result.settings;
	  if(settings == null) {
		  settings = {
				maxBytes: "25",
				linkCountPercent: "20",
				linkDepthMax: "2",
				persona: "Persona1",
				blackList: "black1",
				wishList: "wish1"
		}
	  }

    document.querySelector("#maxBytes").value = settings.maxBytes;
	document.querySelector("#linkCountPercent").value = settings.linkCountPercent;
	document.querySelector("#linkDepthMax").value = settings.linkDepthMax;
	document.querySelector("#persona").value = settings.persona;
	document.querySelector("#blackList").value = settings.blackList;
	document.querySelector("#wishList").value = settings.wishList;
  }
  
  var getting = browser.storage.local.get("settings");
  getting.then(loadValues, onError);
  
  function onError(error) {
    console.log(`Error: ${error}`);
  }
}

document.addEventListener("DOMContentLoaded", restoreSettings);
document.querySelector("form").addEventListener("submit", saveSettings);