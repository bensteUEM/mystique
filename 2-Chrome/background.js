// We need to get them from the urlLib later
let urls = [];

let tabId = null;

let usedBytes = 0;
let lastSyncDate;
let currentMaxPageViewsFromRoot;
let currLinkDepth = 0;
let currentUrl = null;

let _config;
let _isRunning = false;

chrome.storage.sync.get({
    config: null,
}, function (items) {

    lastSyncDate = items.lastSyncDate;

    if (!items.config) {
        resetConfig();
    } else {
        _config = items.config;
    }

    run();
});

let resetConfig = function() {
    _config = urlLib.initializeConfig("de");
    // initialize config object and store it
    let personaArray = Object.keys(_config.personas);
    _config.settings.selectedPersonaKey = personaArray[getRandomInt(0, personaArray.length - 1)];
    _config.settings.lastSyncDate = Date.now();
    chrome.storage.sync.set({config: _config});
};


let run = function () {
    verifyTrafficLimit();

    if (usedBytes >= _config.settings.maxBytes || _isRunning === true) {
        return;
    }

    if (_config.settings.functionality) {
        _isRunning = true;
        if (!currentMaxPageViewsFromRoot || currentMaxPageViewsFromRoot < 0) {
            currentMaxPageViewsFromRoot = parseInt(_config.settings.maxPageviewsFromRoot);
            urls = [];
        }
        if (urls.length <= 0) {
            urlLib.generateURL(_config.settings.selectedPersonaKey, _config).then((_urlResult) => {
                _config = _urlResult.config;
                urls.unshift({
                    url: _urlResult.result,
                    level: parseInt(_config.settings.maxLinkDepth)
                });

                processUrl();
            });
        } else {
            processUrl();
        }
    } else {
        _isRunning = false;
    }
};

let processUrl = function () {
    currentMaxPageViewsFromRoot--;
    let urlObject = urls[0];
    currentUrl = urlObject.url;
    currLinkDepth = urlObject.level;
    console.info("CurrLinkDepth [" + currLinkDepth + "] : urls [" + urls.length
        + "] : currentMaxPageViewsFromRoot [" + currentMaxPageViewsFromRoot + "]");
    urls = urls.splice(1, urls.length);
    console.log("--- processUrl 1");
    openUrl(currentUrl).then(() => {
        console.log("--- processUrl 2a");
        setTimeout(run, getRandomInt(parseInt(_config.settings.minVisitTime), parseInt(_config.settings.maxVisitTime) + 1) * 1000);
    }, (exception) => {
        console.log("--- processUrl 2b");
        console.error(exception);
        setTimeout(run, getRandomInt(parseInt(_config.settings.minVisitTime), parseInt(_config.settings.maxVisitTime) + 1) * 1000);
    });
    console.log("--- processUrl 3");
};


let openUrl = function (url, config) {
    return _getOrCreateTabId()
        .then(() => {
            return _updateTab(url);
        });
};

let _getOrCreateTabId = function () {
    return new Promise((resolve) => {
        if (tabId !== null) {
            resolve(tabId);
        } else {
            chrome.tabs.create({active: false}, function (tab) {
                tabId = tab.id;
                chrome.tabs.onRemoved.addListener((currentTabId, changeInfo, tab) => {
                    if (currentTabId === tabId) {
                        tabId = null;
                    }
                });

                resolve(tab.id);
            })
        }
    });
};


let _updateTab = function (url) {
    return new Promise((resolve, reject) => {
        try {
            // add listener so callback executes only if page loaded. otherwise calls instantly
            let listener = function(cTabId, changeInfo, tab) {
                console.log("--- processUrl 10 - " + tabId, changeInfo);
                if (tabId === cTabId && changeInfo.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(listener);
                    console.log("--- processUrl 4");
                    chrome.tabs.executeScript(tabId, {
                        file: "contentScript.js",
                        runAt: "document_end",
                        matchAboutBlank: true
                    }, (tab) => {
                        console.log("--- processUrl 5");
                        resolve(tab);
                    });
                }
            };
            chrome.tabs.onUpdated.addListener(listener);
            chrome.tabs.update(tabId, {
                url: url
            });
        } catch (exception) {
            reject(exception)
        }
    });
};


let processLinks = function (links) {
    let followLinksCount = Math.floor(((parseFloat(_config.settings.maxNumberOfLinksToClick)) * links.length) + 1);
    let idx, url;
    let i = 0;
    let followLinks = [];

    while (i < followLinksCount) {
        idx = Math.floor(Math.random() * links.length);
        url = links[idx];

        if (urlLib.approveURL(url, _config) && isOnSameDomain(url)) {
            followLinks.push(url);
            i++;
        }

    }
    return followLinks;
};

function isOnSameDomain(checkPage) {
    if (_config.settings.followLinkOnDomainOnly === false) {
        return true;
    }

    let prefix = /^https?:\/\//i;
    let domain = /^[^\/]+/;
    // removing prefix
    let url1 = currentUrl.replace(prefix, "");
    let url2 = checkPage.replace(prefix, "");
    // if link starts with / it is on the current page
    if (url2.charAt(0) === "/") {
        return true;
    }
    // extract domain and compare
    let part1 = url1.match(domain).toString();
    let part2 = url2.match(domain);
    return part1.includes(part2);
}

// Get HTML DOM from page -> TO BE Checked ...
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log("Request ", request);
        console.log("Sender ", sender);

        if (sender && sender.tab && sender.tab.id && sender.tab.id === tabId) {
            if (currLinkDepth > 0) {
                console.log("Url ", request.url);
                console.log("Links ", request.links);
                console.log("Bytes ", request.bytes);

                usedBytes += request.bytes;

                chrome.storage.sync.set({
                    usedBytes: usedBytes
                });

                // add one (maybe multiple) subUrls from the called url (randomized)
                let followLinks = processLinks(request.links);
                currLinkDepth--;
                followLinks = followLinks.map((url) => {
                    return {
                        url: url,
                        level: currLinkDepth
                    };
                });
                urls = followLinks.concat(urls);
                console.log("Call: ", sender.url);
                let HistVar = "";
                chrome.storage.sync.get("history", function (items) {
                    HistVar = items.history;
                    console.log("History: ", HistVar);
                });

                //trouble to save history
                HistVar = HistVar + sender.url + "\n";
                chrome.storage.sync.set({
                    'history': HistVar
                }, function () {
                });
                // console.log(request.dom);
            }
        } else if(request.hasOwnProperty('resetConfig') && request['resetConfig'] === true) {
            resetConfig();
        }
    });

// Get changes from settings
chrome.storage.onChanged.addListener(function (changes, namespace) {
	if(changes.hasOwnProperty('config')) {
        _config = changes.config.newValue;
        run();
     }
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function verifyTrafficLimit() {
    let d = new Date(_config.settings.lastSyncDate);
    if (!d) {
        return;
    }

    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);

    if (d.getTime() <= (d.getTime() - 24 * 60 * 60 * 1000)) {
        usedBytes = 0;
        chrome.storage.sync.set({
            lastSyncDate: Date.now()
        })
    }

}