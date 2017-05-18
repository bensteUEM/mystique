function openSettings() {

	var opening = browser.runtime.openOptionsPage();
	opening.then(onOpened, onError);
	
	function onError(error) {
	  console.log(`Error: ${error}`);
	}
}

function loadSettings() {

  function getValues(result) {
	  
	  var settings = result.settings;
	  if(settings == null) { //TODO init will be done by library in future
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

    document.querySelector("#maxBytes").textContent = settings.maxBytes;
	document.querySelector("#maxNumberOfLinksToClick").textContent = settings.maxNumberOfLinksToClick;
	document.querySelector("#maxLinkDepth").textContent = settings.maxLinkDepth;
	document.querySelector("#persona").textContent = settings.persona;
	document.querySelector("#blackList").textContent = settings.blackList;
	document.querySelector("#wishList").textContent = settings.wishList;
	document.querySelector("#minVisitTime").textContent = settings.minVisitTime;
    document.querySelector("#maxVisitTime").textContent = settings.maxVisitTime;
    document.querySelector("#maxPageviewsFromRoot").textContent = settings.maxPageviewsFromRoot;
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
document.addEventListener("DOMContentLoaded", loadSettings);
document.addEventListener("DOMContentLoaded", loadStatus);

