function saveSettings(e) {
	e.preventDefault();
	
	let settings = {
		maxBytes: document.querySelector("#maxBytes").value,
		linkCountPercent: document.querySelector("#linkCountPercent").value,
		linkDepthMax: document.querySelector("#linkDepthMax").value,
		blackList: document.querySelector("#blackList").value,
		wishList: document.querySelector("#wishList").value
	}
  
	let setting = browser.storage.local.set({settings});
	setting.then(null, onError);
	
	function onError(error) {
		console.log(`Error: ${error}`);
	}

}

function restoreSettings() {

  function loadValues(result) {
    document.querySelector("#maxBytes").value = result.settings.maxBytes || "25";
	document.querySelector("#linkCountPercent").value = result.settings.linkCountPercent || "20";
	document.querySelector("#linkDepthMax").value = result.settings.linkDepthMax || "2";
	document.querySelector("#blackList").value = result.settings.blackList || "black1";
	document.querySelector("#wishList").value = result.settings.wishList || "wish1";
  }
  
  let getting = browser.storage.local.get("settings");
  getting.then(loadValues, onError);
  
  function onError(error) {
    console.log(`Error: ${error}`);
  }
}

document.addEventListener("DOMContentLoaded", restoreSettings);
document.querySelector("form").addEventListener("submit", saveSettings);