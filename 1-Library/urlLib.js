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

              var resultList;
              var foundResult = false;
              var counter = 0;

              while(foundResult == false || counter < 10)
              {
                counter++;
                  $.ajax({ 
                      url: "http://thesaurus.altervista.org/thesaurus/v1?word=" + searchWord
                      + "&language=" + language + "&output=json&key=9kYEIiYAwcnhCuXrjK30",
                      success: function(data){ 
                          if (data.length != 0) { 
                              for (key in data.response) { 
                                  var synonyms = data.response[key].list.synonyms.split("|");        
                                  for (synonymKey in synonyms)
                                  {
                                      var result;
                                      result.word = synonyms[synonymKey].split(" (");

                                      resultList.push(result);
                                      foundResult = true;
                                  }
                              } 
                          }
                      }, 
                      error: function(xhr, status, error){ 
                          console.log("Error " + status + ": " + error);
                      } 
                  });
              }

              persona.keywords.sort(urlLib._evolutionModule.wordSorter);
              
              return Promise.each(words, word => { urlLib._evolutionModule.insertWordIfFitEnough(word, persona.keywords, personaKey).then(function(d) {
                                    resolve(d);
                                })
                              });

          });
        },
        insertWordIfFitEnough: function (word, words, masterWord) {

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
                        return getNumOfResults(item.name + " " + masterWord)
                            .then((score) => {
                                item.score = score;
                            })
                    }).then((words) => {
                        console.log("Built all word scores!");
                        words.sort(urlLib._evolutionModule.wordSorter);
                        return Promise.resolve(words);
                    })
                };

                buildScoresIfNotThere(words).then(function () {
                    console.log(JSON.stringify(words));

                    //get worst word in words
                    var worstWord = words.shift();
                    getNumOfResults(word + " " + masterWord).then(function (scoreNew) {
                        //give the oldWord a last chance
                        getNumOfResults(worstWord.name + " " + masterWord).then(function (scoreOld) {
                            //console.log("Fitnessfunction("+word+"): "+worstWord .name+" "+masterWord+": "+scoreOld+ " vs. "+word +" "+masterWord+": "+scoreNew);
                            if (scoreNew > scoreOld) {
                                words.push({
                                    name: word,
                                    score: scoreNew
                                });
                                console.log("Fitnessfunction: " + worstWord.name + " replaced by " + word + "(" + scoreNew + ")");
                            } else {
                                //update oldWord
                                worstWord.score = scoreOld;
                                words.push(worstWord);
                                console.log("Fitnessfunction: " + word + "(" + scoreNew + ")" + " was not able to replace " + worstWord.name);
                            }
                            words.sort(urlLib._evolutionModule.wordSorter);
                            resolve(words);
                        });
                    });
                });

            });
        }
    },


    _buildSearchString(personaKey, config) {
        return new Promise(function (resolve, reject) {
            console.log("build search string" + urlLib._evolutionModule);
            urlLib._evolutionModule.updateLexicon(personaKey, config).then(function (d) {
                console.log("updated lexicon");
                var allWords = d.map(function (e) {
                    return e.name;
                })
                var searchString = allWords.join(" and ");
                resolve(searchString);
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
            "personas": [{
                "key": "Banker",
                "Keywords": [
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
            }],
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

