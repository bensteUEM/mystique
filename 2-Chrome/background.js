// We need to get them from the urlLib later
var urls = [];

// We need to load this from the settings
var runMystique = true;

var maxLinkDepth;
var currLinkDepth = 0;
var linkCoveragePecentage;
var minVisitTime;
var maxVisitTime;
var maxPageViewsFromRoot;
var currentMaxPageViewsFromRoot;

// Reference for tab, which loads the given urls
var urlWindow;
// count index to get the current url from the urls lib
var index = 0;
// global interval to load urls 
var loadUrlInterval;
// interval duration in ms
var intervalDuration = 5000;
// the next url which should be opened.
// Could be null at the moment because the urlLib is very slow at generating new urls!"
var nextUrl = null;

var tabId = null;

var maxBytes = 0;
var usedBytes = 0;

// Wordlist copied from urlLib to call generateURL
var wordlist = ["abacus", "abbey", "abdomen", "ability", "abolishment", "abroad", "accelerant", "accelerator", "accident", "accompanist", "accordion", "account", "accountant", "achieve", "achiever", "acid", "acknowledgment", "acoustic", "acoustics", "acrylic", "act", "action", "active", "activity", "actor", "actress", "acupuncture", "ad", "adapter", "addiction", "addition", "address", "adjustment", "administration", "adrenalin"];

chrome.storage.sync.get({
    activate: "true",
    followLinkOnDomainOnly: "false",
    maxBytes: '100',
    numberOfLinksToClick_max: 10,
    linkDepth_max: 5,
    minVisitTime: 3,
    maxVisitTime: 10,
    maxPageViewsFromRoot: 30,
    blacklist: "",
    whitelist: "",
    personas: 1,
    history: "",
    usedBytes: 0,
    lastSyncDate: new Date()
}, function (items) {
    runMystique = items.activate;
    maxLinkDepth = items.linkDepth_max;
    maxBytes = items.maxBytes;
    maxPageViewsFromRoot = parseInt(items.maxPageViewsFromRoot);
    minVisitTime = parseInt(items.minVisitTime);
    maxVisitTime = parseInt(items.maxVisitTime);

    linkCoveragePecentage = items.numberOfLinksToClick_max;
    if (items.lastSyncDate === getYesterday(items.lastSyncDate)) {
        usedBytes = 0;
        chrome.storage.sync.set({lastSyncDate: new Date()});
    } else {
        usedBytes = items.usedBytes;
    }

    run();
});

let run = function () {
    if (runMystique) {
        if (!currentMaxPageViewsFromRoot || currentMaxPageViewsFromRoot < 0) {
            currentMaxPageViewsFromRoot = maxPageViewsFromRoot;
            urls = [];
        }
        if (urls.length <= 0) {
            urls.unshift({
                url: "http://wikipedia.de",
                level: maxLinkDepth
            });
        }
        currentMaxPageViewsFromRoot--;
        let url = urls[0];
        currLinkDepth = url.level;
        console.info("CurrLinkDepth [" + currLinkDepth + "] : urls [" + urls.length
            + "] : currentMaxPageViewsFromRoot [" + currentMaxPageViewsFromRoot + "]");
        urls = urls.splice(1, urls.length);
        openUrl(url.url).then(() => {
             setTimeout(run, getRandomInt(parseInt(minVisitTime), parseInt(maxVisitTime) + 1) * 1000);
        });
    }

    /*urlLib.generateURL({wordlist: wordlist}).then((url) => {
     if(url) {
     urls.push(url);
     }
     }).catch((err) => {
     console.log("Error ", err);
     }); */
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
            chrome.tabs.create({}, function (tab) {
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
            chrome.tabs.update(tabId, {
                url: url
            }, resolve);
        } catch (exception) {
            reject(exception)
        }
    });
};


let processLinks = function (links) {
    let followLinksCount = Math.floor(((linkCoveragePecentage / 100) * links.length) + 1);
    let idx, url;
    let i = 0;
    let followLinks = [];

    while (i < followLinksCount) {
        idx = Math.floor(Math.random() * links.length);
        url = links[idx];
        // Check url
        // urlLib._approveUrl(url);
        followLinks.push(url);
        i++;
    }
    return followLinks;
};

// Get HTML DOM from page -> TO BE Checked ...
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        if (sender.tab.id === tabId) {
            if (currLinkDepth > 0) {
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
                var HistVar = "";
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
        }
    });

// Get changes from settings
chrome.storage.onChanged.addListener(function (changes, namespace) {
    let active = 'activate';
    if (changes.hasOwnProperty(active)) {
        let storageChange = changes[active];
        runMystique = storageChange.newValue;
        if (runMystique) {
			clearInterval(loadUrlInterval);
			loadUrlInterval=null;
            run();
        }
    }
});


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getYesterday(d) {
    return d && d.getDate && new Date(d.setDate(d.getDate() - 1));
}