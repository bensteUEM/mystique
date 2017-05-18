function saveSettings(e) {
	e.preventDefault();
	
	var settings = {
		maxBytes: document.querySelector("#maxBytes").value,
		linkCountPercent: document.querySelector("#maxNumberOfLinksToClick").value,
		linkDepthMax: document.querySelector("#maxLinkDepth").value,
		persona: document.querySelector("#persona").value,
		blackList: document.querySelector("#blackList").value,
		wishList: document.querySelector("#wishList").value,
		minVisitTime: 	document.querySelector("#minVisitTime").value,
        maxVisitTime:    document.querySelector("#maxVisitTime").value,
        maxPageviewsFromRoot:    document.querySelector("#maxPageviewsFromRoot").value
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
				maxNumberOfLinksToClick: "20",
				maxLinkDepth: "2",
				persona: "Persona1",
				blackList: "black1",
				wishList: "wish1",
				minVisitTime : "60",
				maxVisitTime: "660",
				maxPageviewsFromRoot: "100"
		  }
	  }

    document.querySelector("#maxBytes").value = settings.maxBytes;
	document.querySelector("#maxNumberOfLinksToClick").value = settings.maxNumberOfLinksToClick;
	document.querySelector("#maxLinkDepth").value = settings.maxLinkDepth;
	document.querySelector("#persona").value = settings.persona;
	document.querySelector("#blackList").value = settings.blackList;
	document.querySelector("#wishList").value = settings.wishList;
	document.querySelector("#minVisitTime").value = settings.minVisitTime;
    document.querySelector("#maxVisitTime").value = settings.maxVisitTime;
    document.querySelector("#maxPageviewsFromRoot").value = settings.maxPageviewsFromRoot;
  }
  
  var getting = browser.storage.local.get("settings");
  getting.then(loadValues, onError);
  
  function onError(error) {
    console.log(`Error: ${error}`);
  }
}

document.addEventListener("DOMContentLoaded", restoreSettings);
document.querySelector("form").addEventListener("submit", saveSettings);