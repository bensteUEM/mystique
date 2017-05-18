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
        console.log("Received Config:");
        console.log(config);
        return new Promise((resolve, reject) => {
            this._buildSearchString(personaKey, config)
                .then(this._getUrl)
                .then(this._approveUrl)
                .then((url) => {
                    if (url) {
                        resolve(url);
                        return;
                    }
                    resolve(this.generateURL(personaKey, config));
                }).catch((err) => {
                    console.log("Regenerate");
                    //return this.generateURL(config);
                });
        })

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

              var randomNumber = Math.floor((Math.random() * persona.keywords.length - 1) + 1);
              var searchWord = persona.keywords[randomNumber];

              var resultList = [];
              var foundResult = false;
              var counter = 0;

                                   

              //while(foundResult == false && counter < 10)
              //{
                randomNumber = Math.floor((Math.random() * persona.keywords.length - 1) + 1);
                searchWord = persona.keywords[randomNumber];
                var urlCall = "http://thesaurus.altervista.org/thesaurus/v1?word=" + searchWord.word
                      + "&language=" + language + "&output=json&key=9kYEIiYAwcnhCuXrjK30";     

                counter++;
                  $.ajax({ 
                      url: urlCall,
                      type: "GET",
                      success: function(data){ 
                        console.log("updateLexicon - success");
                          if (data.length != 0) { 
                              for (key in data.response) { 
                                  var synonyms = data.response[key].list.synonyms.split("|");     

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

                            //persona.keywords.sort(urlLib._evolutionModule.wordSorter);
                            console.log(JSON.stringify(resultList));
                            return Promise.each(resultList, item => { urlLib._evolutionModule.insertWordIfFitEnough(item.word, 
                                                                          config, personaKey).then(function(newConfig) {
                                                  console.log("New Config: " + JSON.stringify(newConfig.personas[personaKey].keywords));
                                                  resolve(newConfig);
                                              }).catch((e) => {
                                                console.log("updateLexicon - Error ");
                                                console.log("updateLexicon - Config: " + JSON.stringify(config.personas[personaKey].keywords));
                                                resolve(config);
                                              })
                                            }).catch((e) => {
                                                console.log("updateLexicon2 - Error ");
                                                console.log("updateLexicon2 - Config: " + JSON.stringify(config.personas[personaKey].keywords));
                                                resolve(config);
                                            }); 
                          }
                      }, 
                      error: function(xhr, status, error){ 
                          console.log("Error " + status + ": " + error);
                          resolve(config);
                      } 
                  });
              //}



          }).then(function(newConfig) {
              console.log("New Config outer: " + JSON.stringify(newConfig.personas[personaKey].keywords));
              resolve(newConfig);
          }).catch((e) => {
            console.log("updateLexicon - outer- Error " + JSON.stringify(config));
            resolve(config);
          });
        },
        insertWordIfFitEnough: function (word, config, masterWord) {
            console.log("Word: " + word);
            console.log("keywords " + JSON.stringify(config.personas[masterWord].keywords));
            return new Promise(function (resolve, reject) {

                var getNumOfResults = function (search) {
                    return new Promise(function (resolve, reject) {                        
                        var url = "https://www.google.com/search?q=" + encodeURIComponent(search);
                        console.log(url);
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
                                //reject(e);
                                //resolve(config);
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
                        console.log("Built all word scores!");
                        words.sort(urlLib._evolutionModule.wordSorter);
                        return Promise.resolve(words);
                    })
                };
                
                console.log(JSON.stringify(config.personas[masterWord].keywords));
                buildScoresIfNotThere(config.personas[masterWord].keywords).then(function (words) {
                    console.log("buildScoresIfNotThere: " + JSON.stringify(words));

                    //get worst word in words
                    var worstWord = words.shift();
                    console.log("buildScoresIfNotThere-Worstword: " + JSON.stringify(worstWord));

                    getNumOfResults(word + " " + masterWord).then(function (scoreNew) {
                        //give the oldWord a last chance
                        getNumOfResults(worstWord.word + " " + masterWord).then(function (scoreOld) {
                            //console.log("Fitnessfunction("+word+"): "+worstWord .word+" "+masterWord+": "+scoreOld+ " vs. "+word +" "+masterWord+": "+scoreNew);
                            if (scoreNew > scoreOld) {
                                words.push({
                                    name: word,
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
                     // resolveO(config);
                     reject(e);
                    });
                });

            }).catch((e) => {        
                console.log("insertWordIfFitEnough - error ");
                resolve(config);
            });
        }
    },


    _buildSearchString(personaKey, config) {
        return new Promise(function (resolve, reject) {
            urlLib._evolutionModule.updateLexicon(personaKey, config).then(function (newConfig) {
                console.log("updated lexicon " + JSON.stringify(newConfig));

                //TODO: Choose random word
                var searchString = newConfig.personas[personaKey].keywords[0];
                console.log(searchString.word);
                resolve(searchString.word);
            }).catch((e) => {
                console.log("_buildSearchString - error " + JSON.stringify(e));
                
                //TODO: Choose random word
                var searchString = config.personas[personaKey].keywords[0];
                console.log(searchString.word);
                resolve(searchString.word);
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
         * Randomly retrieves one entry of the provided array. This is used to prevent fraud detection because always
         * the first shown result is clicked. Instead this simulates behaviour that some link on the first page is clicked.
         * @return a single URL of the search results
         * */
        _get_random_URL: function (data) {
            var links = urlLib._getUrlModule._get_links(data);
            return links[Math.floor(Math.random() * links.length)];
        },
    },

    _getUrl: function (searchString) {
        console.log("Search String is: " + searchString)
        return new Promise(function (resolve, reject) {
            var url = "https://www.google.com/search?safe=active&num=25&q=" + encodeURIComponent(searchString);
            $.get({
                url: url,
                success: data => {
                    url = urlLib._getUrlModule._get_random_URL(data);
                    console.log("Created URL is: " + url);
                    resolve(url);
                },
                error: e => {
                    reject(e);
                }
            });

        })
    },

    //------------- _getUrlModule End --------------------------------------------------------------------


    // This Method must return the url if valid
    // If the url is not valid the function mus return false
    _approveUrl: function (url, config) {
        return new Promise(function (resolve, reject) {
            /*if (new Date().getTime() % 2) {
              console.log("URL IS VALID");
              resolve(url);
              return;
            }
            console.log("URL IS NOT VALID");
            resolve(false);*/

            resolve(url);
            return;

        })
    },

       initializeConfig: function () {
        return {
            "blacklist": ["bild"],
            "whishlist": [],
            "personas": {                
                "Banker": {
                    "key": "Banker",
                    "keywords": [
                        { "word": "DAX", "score": 0 },
                        { "word": "Börse", "score": 5 },
                        { "word": "Aktien", "score": 10 },
                        { "word": "Kurs", "score": 3 },
                        { "word": "Gold", "score": 7 }
                    ],
                    "defaultURLs": [
                        "http://www.boerse.de/",
                        "http://www.faz.net/aktuell/finanzen/"
                    ]
                }
            },
            "settings": {
                "maxBytes": 5000,
                "functionlity": true,
                "tracing": true,
                "followLinkOnDomainOnly": true,
                "linkDepth_max": 5,
                "maxNumberOfLinksToClick": 10,
                "maxVisitTime": 10
            }
        };
    }



};

