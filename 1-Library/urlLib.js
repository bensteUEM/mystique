// See a working example: https://jsfiddle.net/39kvmxd4/11/
// Open DEV Tools to see the result
// Disable WebSecurity for CORS requests
/* Libs:
	https://code.jquery.com/jquery-3.2.1.min.js
	https://cdn.jsdelivr.net/bluebird/3.5.0/bluebird.js
*/

var urlLib = {

    // This is our main public function which returns the final approved url
    generateURL: function (personaKey, config) {
        return new Promise((resolve, reject) => {
            this._buildSearchString(personaKey, config)
                .then(this._getUrl)
                .then((ret) => {
                    if (ret) {
                        resolve(ret);
                        return;
                    }
                    resolve(this.generateURL(personaKey, config));
                }).catch((err) => {
                    // if generating url fails return default url
                    var ret = {};
                    if (typeof config.personas[personaKey].defaultURLs !== 'undefined' && config.personas[personaKey].defaultURLs.length > 0)
                    {
                        ret.result = config.personas[personaKey].defaultURLs[Math.floor(Math.random() 
                        * config.personas[personaKey].defaultURLs.length)];
                    }
                    else
                    {
                        ret.result = "http://www.bing.com/search?q=" + personaKey;
                    }

                    console.log("regenerate: " + ret.result);
                    ret.config = config;
                    resolve(ret);
                });
        })
    },

    approveURL: function(url, config) {
    	// Check if the URL has a valid pattern
    	var pattern = /^http|^https|^\/|^.\/|^..\/|^javascript/;
    	var match = pattern.test(url);
    	if(!match) {
    		return false;
    	}

    	// check if the url is not contained in blacklist
    	return this._isNotBlacklisted(url, config)
    },

    //------------- evolutionary algorithm------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------

    //-----fitness function--------------------------------------------------------------------------------
    _evolutionModule: {
        wordSorter: function (a, b) {
            return a.score - b.score
        },
        updateLexicon: function personaKey(personaKey, config) {
            return new Promise(function (resolve, reject) {
                
            var language = "de_DE";
            var persona = config.personas[personaKey];

            var resultList = [];
            var foundResult = false;

            var randomNumber = Math.floor((Math.random() * persona.keywords.length - 1) + 1);
            var searchWord = persona.keywords[randomNumber];
            var urlCall = "http://thesaurus.altervista.org/thesaurus/v1?word=" + searchWord.word
                    + "&language=" + language + "&output=json&key=9kYEIiYAwcnhCuXrjK30";     

                $.ajax({ 
                    url: urlCall,
                    type: "GET",
                    success: function(data){ 
                        if (data.length != 0) { 
                            for (key in data.response) { 
                                var synonyms = data.response[key].list.synonyms.split("|");     
                                
                                if(synonyms.length > 3)
                                {
                                for(var i = 0; i<3; i++)
                                {
                                        var result = {};
                                        var tmp = synonyms[Math.floor(Math.random() * synonyms.length)].split(" (");
                                        result.word = tmp[0];
                                        result.score = 0;

                                        resultList.push(result);
                                        foundResult = true;
                                }
                            }   
                            else
                            {
                                for (synonymKey in synonyms.slice(1,3))
                                {
                                    var result = {};
                                    var tmp = synonyms[synonymKey].split(" (");
                                    result.word = tmp[0];
                                    result.score = 0;

                                    resultList.push(result);
                                    foundResult = true;
                                }
                            }                                
                            }
                        
                        if(resultList.length == 0)
                        {
                            var result = {};
                            result.word = searchWord;
                            result.score = 0;
                        }

                        return Promise.each(resultList, item => { urlLib._evolutionModule.insertWordIfFitEnough(item.word, 
                                                                        config, personaKey).then(function(newConfig) {
                                                resolve(newConfig);
                                            }).catch((e) => {
                                            resolve(config);
                                            })
                                        }).catch((e) => {
                                            resolve(config);
                                        }); 
                        }
                    }, 
                    error: function(xhr, status, error){ 
                        console.log("no synonyms found");
                        resolve(config);
                    } 
                });
          }).then(function(newConfig) {
              resolve(newConfig);
          }).catch((e) => {
            resolve(config);
          });
        },
        insertWordIfFitEnough: function (word, config, masterWord) {
            return new Promise(function (resolve, reject) {

                var getNumOfResults = function (search) {
                    return new Promise(function (resolve, reject) {                        
                        var url = "https://www.google.com/search?q=" + encodeURIComponent(search);
                        $.get({
                            url: url,
                            success: function (data) {
                                var resultStatsRegexp = /<div id="resultStats">[^>]*</g;
                                var numberRegex = /\d+/g;
                                var resultStats = resultStatsRegexp.exec(data)[0].replace("<div id=\"resultStats\">", "").replace("<", "").replace(" Ergebnisse", "").replace(" Results", "").replace("Ungefähr ", "");
                                var numberOfResults = resultStats.replace(/\./g, '');
                                numberOfResults = numberRegex.exec(numberOfResults)[0];
                                numberOfResults = parseInt(numberOfResults);

                                resolve(numberOfResults);
                            },
                            error: function (e) {
                                reject(e);
                            }
                        });
                    });
                };

                //check that every word has a result


                function buildScoresIfNotThere(words) {

                    if (words[0].score > 0) {
                        // assume all scores are there
                        return new Promise(function (resolve, reject) {
                            resolve(words);
                        });
                    }
                    //get all scores
                    return Promise.each(words, item => {
                        return getNumOfResults(item.word + " " + masterWord)
                            .then((score) => {
                                item.score = score;
                            }).catch((e) => {
                              reject(e);
                            })
                    }).then((words) => {
                        words.sort(urlLib._evolutionModule.wordSorter);
                        return Promise.resolve(words);
                    })
                };
                
                buildScoresIfNotThere(config.personas[masterWord].keywords).then(function (words) {
                    //get worst word in words
                    var worstWord = words.shift();

                    getNumOfResults(word + " " + masterWord).then(function (scoreNew) {
                        //give the oldWord a last chance
                        getNumOfResults(worstWord.word + " " + masterWord).then(function (scoreOld) { 
                            var wordIndex = words.findIndex(function (e) {
                                return e.word === word;
                            });                 
                            //only update the word if it is better than the old word and if it is not already present in the array
                            if ( (scoreNew > scoreOld) && (wordIndex < 0) && worstWord != word) {
                                words.push({
                                    word: word,
                                    score: scoreNew
                                });
                                console.log("Fitnessfunction: " + worstWord.word + " replaced by " + word + "(" + scoreNew + ")");
                            } else {
                                //update oldWord
                                worstWord.score = scoreOld;
                                words.push(worstWord);
                                console.log("Fitnessfunction: " + word + "(" + scoreNew + ")" + " was not able to replace " + worstWord.word);
                            }
                            words.sort(urlLib._evolutionModule.wordSorter);
                            config.personas[masterWord].keywords = words;
                            resolve(config);
                        });
                    }).catch((e) => {
                     reject(e);
                    });
                });

            }).catch((e) => {        
                resolve(config);
            });
        }
    },


    _buildSearchString(personaKey, config) {
        return new Promise(function (resolve, reject) {
            urlLib._evolutionModule.updateLexicon(personaKey, config).then(function (newConfig) {

                //choose first and last word in ordered list (by score)
                var keywordLength = newConfig.personas[personaKey].keywords.length -1;
                var searchStringFirstLast = newConfig.personas[keywordLength].word + " " 
                    + newConfig.personas[personaKey].keywords[keywordLength].word

                console.log(searchStringFirstLast);
                var resultObj = {
                    "searchString": searchStringFirstLast,
                    "personaKey": personaKey,
                    "config": newConfig
                };

                resolve(resultObj);
            }).catch((e) => {
                console.log("config not changed");

                //choose first and last word in ordered list (by score)
                var keywordLength = config.personas[personaKey].keywords.length;
                var searchStringFirstLast = config.personas[personaKey].keywords[Math.floor(Math.random() * keywordLength)].word + " " 
                    + config.personas[personaKey].keywords[Math.floor(Math.random() * keywordLength)].word

                var resultObj = {
                    "searchString": searchStringFirstLast,
                    "personaKey": personaKey,
                    "config": config
                };

                resolve(resultObj);
            });
        });

        function _get_random_word(w) {
            return w[Math.floor(Math.random() * w.length)];
        }
    },

    //------------- _getUrlModule Begin ------------------------------------------------------------------

    _getUrlModule: {
        /**
         * Parses the returned google page for the shown links. They follow a specific schema, are matched and stored in an array
         * Schema for links: <div class="rc"><h3 class="r"><a href="LINK" onmousedown="..." ...>DESCRIPTION</a></h3>
         * @param page source of a google search
         * @return an array with all search results of this page, so usually 10 entries
         * */
        _get_links: function (data) {
            var result_link = /<div class="rc"><h3 class="r"><a href="([\S])+"/g;
            var trim_html = /<div class="rc"><h3 class="r"><a href=/g;
            var trim_ticks = /"/g;
            var all_links = [];

            do {
                var match = result_link.exec(data);
                if (match != null) {
                    //Extract only the link itself from the matched parts and store it in an array
                    all_links.push(match[0].replace(trim_html, "").replace(trim_ticks, ""));
                }
            } while (match != null);

            return all_links;
        },

        /**
         * Randomly retrieves a URL from all URL on the page until one is found that is not blacklisted.
         * Does not guarantee that some links might not be used multiple times.
         * @param links Array of possible URLs
         * @param config Configuration file that contains the blacklist that should be checked against
         * @returns a URL that is not blacklisted
         */
        _getNotBlacklistedURL: function(links, config, personaKey) {
            var url;
            var foundValidURL = false;
            for(var i=0;i<links.length;i++) {
                url = links[Math.floor(Math.random() * links.length)];
                if(urlLib._isNotBlacklisted(url, config)) {
                    foundValidURL = true;
                    break;
                }
            }

            //check if there was a valid URL. Otherwise use one of the defaultURLs 
            var URLs = config.personas[personaKey].defaultURLs;
            if(URLs.lenght > 0) {
                url = URLs[Math.floor(Math.random() * URLs.lenght)];
            } else {
                url = "http://www.bing.com/search?q=" + personaKey;
            }

            return url;
        },

        /**
         * Adds the URL to the defaultURLs of the persona. If the defaultURLs already contain 10 URLs, the oldest one is removed.
         */
        _storeURLforPersona: function(url, config, personaKey) {
            var URLs = config.personas[personaKey].defaultURLs;
            //do not store more than 10 URLs per Persona
            if(URLs.length >= 10) {
                URLs = URLs.slice(1, URLs.lenght);
            }

            URLs.push(url);
        },

        /**
         * Randomly retrieves one entry of the provided array. This is used to prevent fraud detection because always
         * the first shown result is clicked. Instead this simulates behaviour that some link on the first page is clicked.
         * @return a single URL of the search results
         * */
        _get_random_URL: function (data, personaKey, config) {
            var links = urlLib._getUrlModule._get_links(data);
            return urlLib._getUrlModule._getNotBlacklistedURL(links, config, personaKey);
        },
    },

    _getUrl: function (paramsObject) {
        return new Promise(function (resolve, reject) {
            var url = "https://www.google.com/search?safe=active&num=25&q=" + encodeURIComponent(paramsObject.searchString);
            $.get({
                url: url,
                success: data => {
                    url = urlLib._getUrlModule._get_random_URL(data, paramsObject.personaKey, paramsObject.config);
                    if(url) {
                        urlLib._getUrlModule._storeURLforPersona(url, paramsObject.config, paramsObject.personaKey);
                        console.log("Created URL is: " + url);
                        var resultObj = {
                            "result": url,
                            "config": paramsObject.config
                        };
                        resolve(resultObj);
                    } else {
                        reject("Could not find valid URL");
                    }
                },
                error: e => {
                    //If the GET fails, retrieve a defaultURL 
                    var URLs = paramsObject.config.personas[paramsObject.personaKey].defaultURLs;
                    if(URLs.lenght > 0) {
                        url = URLs[Math.floor(Math.random() * URLs.lenght)];
                        var resultObj = {
                            "result": url,
                            "config": paramsObject.config
                        };
                        resolve(resultObj);
                    } else {
                        reject(e);
                    }
                }
            });

        })
    },

    //------------- _getUrlModule End --------------------------------------------------------------------


    // This Method must return the url if valid
    // If the url is not in blacklist the function must return true
    _isNotBlacklisted: function (url, config) {
    	if(typeof(config.blacklist) === "undefined") {
    		return true; // no blacklist found --> url is valid
    	}
    	if(config.blacklist.length <= 0) {
    		return true; //no blacklist entry --> url is valid
    	}
    	
    	var regex = ":\/\/w?w?w?\\.?" + config.blacklist[0] + "\\.";
    	for (var i=1; i<config.blacklist.length; ++i) {
    		regex = regex + "|" + ":\/\/w?w?w?\\.?" + config.blacklist[i] + "\\.";
    	}

    	return new RegExp(regex).test(url);
    },

    initializeConfig: function (language) {
        language = language || "de";
        var configs = {
            "de":
            {
                "personas": {
                    "Banker": {
                        "key": "Banker",
                        "keywords": [
                            { "word": "DAX", "score": 0 },
                            { "word": "Börsenkurs", "score": 5 },
                            { "word": "Aktien", "score": 10 },
                            { "word": "Wechselkurse", "score": 3 },
                            { "word": "Goldpreis", "score": 7 }
                        ],
                        "defaultURLs": [
                            "http://www.boerse.de/",
                            "http://www.faz.net/aktuell/finanzen/"
                        ]
                    },
                    "Familie": {
                        "key": "Familie",
                        "keywords": [{ "word": "Kindergarten", "score": 0 }, { "word": "Windeln", "score": 0 }, { "word": "Spielzeug", "score": 0 }, { "word": "Kinderbuch", "score": 0 }, { "word": "Babysitter", "score": 0 }, { "word": "Schwangerschaftsstreifen", "score": 0 }, { "word": "abnehmen", "score": 0 }, { "word": "Yogaübungen", "score": 0 }, { "word": "Kita", "score": 0 }, { "word": "Babynahrung", "score": 0 }],
                        "defaultURLs": []
                    },
                    "Fruehrentner": {
                        "key": "Fruehrentner",
                        "keywords": [{ "word": "Altersteilzeit", "score": 0 }, { "word": "Frührente", "score": 0 }, { "word": "Weltreise", "score": 0 }, { "word": "Rentenrechner", "score": 0 }, { "word": "Urlaub", "score": 0 }, { "word": "Rente", "score": 0 }, { "word": "Auszeit", "score": 0 }, { "word": "Bootsführerschein", "score": 0 }],
                        "defaultURLs": []
                    },
                    "Student": {
                        "key": "Student",
                        "keywords": [{ "word": "Studium", "score": 0 }, { "word": "Studiumsgebühren", "score": 0 }, { "word": "Studentenwohnung", "score": 0 }, { "word": "Hochschule", "score": 0 }, { "word": "BAFÖG", "score": 0 }, { "word": "Studententicket", "score": 0 }, { "word": "Bachelorthesis", "score": 0 }, { "word": "Masterthesis", "score": 0 }],
                        "defaultURLs": []
                    },
                    "Fussballfan": {
                        "key": "Fussballfan",
                        "keywords": [{ "word": "Bundesliga", "score": 0 }, { "word": "MLS", "score": 0 }, { "word": "Champions Leage", "score": 0 }, { "word": "FC Bayern", "score": 0 }, { "word": "BVB", "score": 0 }, { "word": "Fußballweltmeister", "score": 0 }, { "word": "Fifa", "score": 0 }, { "word": "DFB", "score": 0 }, { "word": "Spieltag", "score": 0 }, { "word": "Bier", "score": 0 }, { "word": "Sky", "score": 0 }],
                        "defaultURLs": []
                    },
                    "Fitnessjunkie": {
                        "key": "Fitnessjunkie",
                        "keywords": [{ "word": "Fitnessprogramm", "score": 0 }, { "word": "Fitnessstudio", "score": 0 }, { "word": "abnehmen", "score": 0 }, { "word": "Sixpack", "score": 0 }, { "word": "Proteine", "score": 0 }, { "word": "Eiweiß", "score": 0 }, { "word": "Fitnesstracker", "score": 0 }, { "word": "Fitness-App", "score": 0 }, { "word": "Low-Carb", "score": 0 }, { "word": "Muskelaufbau", "score": 0 }],
                        "defaultURLs": []
                    },
                    "Professor": {
                        "key": "Professor",
                        "keywords": [
                            {"word": "Vorlesung", "score": 0},
                            {"word": "Universität", "score": 0},
                            {"word": "Hochschule", "score": 0},
                            {"word": "Hiwi", "score": 0},
                            {"word": "Latex", "score": 0},
                        ],
                        "defaultURLs": []
                    },
                    "Aktionaer": {
                        "key": "Aktionaer",
                        "keywords": [{ "word": "Aktien", "score": 0 }, { "word": "ETF", "score": 0 }, { "word": "Dividende", "score": 0 }, { "word": "Broker", "score": 0 }, { "word": "Rendite", "score": 0 }, { "word": "Aktiengesellschaft", "score": 0 }, { "word": "Anleihen", "score": 0 }, { "word": "Hauptversammlung", "score": 0 }, { "word": "DAX", "score": 0 }, { "word": "NASDAQ", "score": 0 }, { "word": "Dividendenrendite", "score": 0 }],
                        "defaultURLs": []
                    },
                    "Lottospieler": {
                        "key": "Lottospieler",
                        "keywords": [{ "word": "Lottogewinn", "score": 0 }, { "word": "Gewinnspiel", "score": 0 }, { "word": "Lottozahlen", "score": 0 }],
                        "defaultURLs": []
                    },
                    "Snowboarder": {
                        "key": "Snowboarder",
                        "keywords": [{ "word": "Snowboard", "score": 0 }, { "word": "Wheelis", "score": 0 }, { "word": "Backside", "score": 0 }, { "word": "Snowboardtricks", "score": 0 }, { "word": "Skipiste", "score": 0 }, { "word": "Snowboardurlaub", "score": 0 }, { "word": "Cruise&Ride", "score": 0 }, { "word": "Skiträger", "score": 0 }],
                        "defaultURLs": []
                    },
                    "Yachtfahrer": {
                        "key": "Yachtfahrer",
                        "keywords": [{ "word": "Bootsführerschein", "score": 0 }, { "word": "Schleusen", "score": 0 }, { "word": "Angelschein", "score": 0 }, { "word": "Urlaub", "score": 0 }, { "word": "Bootsanhänger", "score": 0 }, { "word": "Yachthafen", "score": 0 }, { "word": "BVWW", "score": 0 }, { "word": "Segeln", "score": 0 }, { "word": "Schiffverkehrsregeln", "score": 0 }],
                        "defaultURLs": []
                    },
                    "DINKS": {
                        "key": "DINKS",
                        "keywords": [{ "word": "Karriere", "score": 0 }, { "word": "Urlaub", "score": 0 }, { "word": "Wellness", "score": 0 }, { "word": "Hochschule", "score": 0 }, { "word": "Thermomix", "score": 0 }, { "word": "Sushi", "score": 0 }, { "word": "Essen gehen", "score": 0 }, { "word": "Shopping", "score": 0 }],
                        "defaultURLs": []
                    },
                    "Ingenieur": {
                        "key": "Ingenieur",
                        "keywords": [{ "word": "Studium", "score": 0 }, { "word": "VDI", "score": 0 }, { "word": "VDA", "score": 0 }, { "word": "Elektronik", "score": 0 }, { "word": "Maschinenbau", "score": 0 }, { "word": "Konstruktion", "score": 0 }, { "word": "Zeichnung", "score": 0 }, { "word": "Schweißen", "score": 0 }, { "word": "Löten", "score": 0 }, { "word": "Fügen", "score": 0 }, { "word": "Drehen", "score": 0 }, { "word": "Fräsen", "score": 0 }],
                        "defaultURLs": []
                    },
                    "Lehrer": {
                        "key": "Lehrer",
                        "keywords": [{ "word": "Kinder", "score": 0 }, { "word": "Erziehung", "score": 0 }, { "word": "Noten", "score": 0 }, { "word": "Hausaufgaben", "score": 0 }, { "word": "Zeugnisse", "score": 0 }, { "word": "Elterngespräch", "score": 0 }, { "word": "Schullandheim", "score": 0 }, { "word": "Lehrerausflug", "score": 0 }, { "word": "Tafel", "score": 0 }],
                        "defaultURLs": []
                    },
                    "Onlineshopper": {
                        "key": "Onlineshopper",
                        "keywords": [{ "word": "alando", "score": 0 }, { "word": "Amazon", "score": 0 }, { "word": "DaWanda", "score": 0 }, { "word": "Conrad", "score": 0 }, { "word": "Notebooksbilliger", "score": 0 }],
                        "defaultURLs": []
                    },
                    "Hundebesitzer": {
                        "key": "Hundebesitzer",
                        "keywords": [{ "word": "Hundefutter", "score": 0 }, { "word": "Hundesteuer", "score": 0 }, { "word": "Kotbeutel", "score": 0 }, { "word": "Halsband", "score": 0 }, { "word": "Hundeleine", "score": 0 }, { "word": "Tierarzt", "score": 0 }],
                        "defaultURLs": []
                    },
                    "Bauer": {
                        "key": "Bauer",
                        "keywords": [{ "word": "Stall", "score": 0 }, { "word": "Rinder", "score": 0 }, { "word": "Schweine", "score": 0 }, { "word": "Tierarzt", "score": 0 }, { "word": "Heu", "score": 0 }, { "word": "Weizen", "score": 0 }, { "word": "Silo", "score": 0 }, { "word": "Mähdrescher", "score": 0 }, { "word": "Trecker", "score": 0 }, { "word": "Mais", "score": 0 }],
                        "defaultURLs": []
                    },
                    "Surfer": {
                        "key": "Surfer",
                        "keywords": [{ "word": "Hawaii", "score": 0 }, { "word": "surfen", "score": 0 }, { "word": "Welle", "score": 0 }, { "word": "Wellenreiten", "score": 0 }, { "word": "Carve", "score": 0 }, { "word": "Cutback", "score": 0 }, { "word": "Meer", "score": 0 }, { "word": "Surfbrett", "score": 0 }, { "word": "Surfspots", "score": 0 }],
                        "defaultURLs": []
                    }
                },
                "settings": {
                    "maxBytes": 104857600, //Per day -> equals 100MB
                    "functionality": true,
                    "tracing": true,
                    "followLinkOnDomainOnly": true,
                    "maxLinkDepth": 45,
                    "maxNumberOfLinksToClick": 30, // value is interpreted in percent, so no need for a float
                    "minVisitTime": 3,
                    "maxVisitTime": 120,
                    "maxPageviewsFromRoot": 50,
                    "blacklist": ["bild"],
                    "wishlist": []
                }
            }
        };
        return configs[language];
    }



};

