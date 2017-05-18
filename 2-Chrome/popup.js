// not yet working
	var activated = chrome.storage.sync.get({    activate: "true"})
	if(activated == "true")
	{
		document.getElementById("activateExtension").css("visibility", "hidden");
		document.getElementById("deactivateExtension").css("visibility", "visible");
	}
	else
	{
		document.getElementById("activateExtension").css("visibility", "visible");
		document.getElementById("deactivateExtension").css("visibility", "hidden");
	}

function saveActivationState(newState)
{
	chrome.storage.sync.set({
		activate: newState});
}		


