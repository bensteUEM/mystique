// Saves options to chrome.storage
function save_options() {
  var activate = document.getElementById('activate').checked;
  var linksOnDomainOnly = document.getElementById('linksOnDomainOnly').checked;
  var maxBytes = document.getElementById('maxBytes').value;
  var linkCoveragePecentage = document.getElementById('linkCoveragePecentage').value;
  var linkDepth = document.getElementById('linkDepth').value;
  var blacklist = document.getElementById('blacklist').value;
  var whitelist = document.getElementById('whitelist').value;
  var personas = document.getElementById('personas').value;
  chrome.storage.sync.set({
    activate: activate, 
	linksOnDomainOnly: linksOnDomainOnly, 
	maxBytes: maxBytes, 
	linkCoveragePecentage: linkCoveragePecentage, 
	linkDepth: linkDepth, 
	blacklist: blacklist, 
	whitelist: whitelist, 
	personas: personas
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value maxBytes = '100' and likesColor = true.
  chrome.storage.sync.get({
    activate: "true", 
	linksOnDomainOnly: "false",
	maxBytes: '100', 
	linkCoveragePecentage: 10, 
	linkDepth: 5, 
	blacklist: "", 
	whitelist: "", 
	personas: 1,
  }, function(items) {
    document.getElementById('activate').checked = items.activate;
    document.getElementById('activate').checked = items.activate;
    document.getElementById('maxBytes').value = items.maxBytes;
    document.getElementById('linkCoveragePecentage').value = items.linkCoveragePecentage;
    document.getElementById('linkDepth').value = items.linkDepth;
    document.getElementById('blacklist').value = items.blacklist;
    document.getElementById('whitelist').value = items.whitelist;
    document.getElementById('personas').value = items.personas;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);