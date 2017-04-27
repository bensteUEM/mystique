function openSettings() {

	function onOpened() {
	  console.log(`Options page opened`);
	}

	function onError(error) {
	  console.log(`Error: ${error}`);
	}

	var opening = browser.runtime.openOptionsPage();
	opening.then(onOpened, onError);
}

document.querySelector("#settings_link").addEventListener("click", openSettings);


  function loadValues(result) {
    document.querySelector("#maxBytes").textContent = result.settings.maxBytes || "25";
	document.querySelector("#linkCountPercent").textContent = result.settings.linkCountPercent || "20";
	document.querySelector("#linkDepthMax").textContent = result.settings.linkDepthMax || "2";
	document.querySelector("#blackList").textContent = result.settings.blackList || "black1";
	document.querySelector("#wishList").textContent = result.settings.wishList || "wish1";
  }
  
  let getting = browser.storage.local.get("settings");
  getting.then(loadValues, onError);
  
  function onError(error) {
    console.log(`Error: ${error}`);
  }


document.addEventListener("DOMContentLoaded", restoreSettings);