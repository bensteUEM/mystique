// See a working example: https://jsfiddle.net/39kvmxd4/11/
// Open DEV Tools to see the result
// Disable WebSecurity for CORS requests
/* Libs:
	https://code.jquery.com/jquery-3.2.1.min.js
	https://cdn.jsdelivr.net/bluebird/3.5.0/bluebird.js
*/



//var jQuery = document.createElement('script');
//jQuery.src = 'https://code.jquery.com/jquery-3.2.1.min.js';
//jQuery.type = 'text/javascript';
//document.getElementsByTagName('head')[0].appendChild(jQuery);

var fake_test_data='lauzsdlazusbdöbö<div class="rc"><h3 class="r"><a href="LINK_A" onmousedown="...", ...>DESCRIPTION</a></h3>öanwdäöanwdän <div class="rc"><h3 class="r"><a href="http://www.getraenke-holz.de/getraenkewissen~8a81811d400f785601400f81c6fe0041.de.html" onmousedown="...", ...>DESCRIPTION</a></h3>öiuahwüdawüdawdüawdüawdn'

var urlLib = {

  // This is our main public function which returns the final approved url
  generateURL: function(config) {
    console.log("Received Config:");
    console.log(config);
    return new Promise((resolve, reject) => {
      this._buildSearchString(config)
        .then(this._getUrl)
        .then(this._approveUrl)
        .then((url) => {
          if (url) {
            resolve(url);
            return;
          }
          resolve(this.generateURL(config));
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
    wordSorter: function(a, b) {
      return a.score - b.score
    },
    updateLexicon : function(config) {      
      return new Promise(function(resolve, reject) {
        //TODO: find new words (score can be zero in the first iteration)
        
        var wordsWithScores = [{
          name: "Geld",
          score: 2
        }, {
          name: "Finanzen",
          score: 0
        }];
        var personaKey = "Bank";
        wordsWithScores.sort(urlLib._evolutionModule.wordSorter);
       
        return urlLib._evolutionModule.insertWordIfFitEnough("Holz", wordsWithScores, personaKey);
      });
    },
    insertWordIfFitEnough : function(word, words, masterWord) {
      return new Promise(function(resolve, reject) {
        var getNumOfResults = function(search) {
          return new Promise(function(resolve, reject) {
            var url = "https://www.google.com/search?q=" + encodeURIComponent(search);            
            $.get({
              url: url,
              success: function(data) {
                var resultStatsRegexp = /<div id="resultStats">[^>]*</g;
                var resultStats = resultStatsRegexp.exec(data)[0].replace("<div id=\"resultStats\">", "").replace("<", "").replace(" Ergebnisse", "").replace(" Results", "").replace("Ungefähr ", "");
                var numberOfResults = parseInt(resultStats.replace(/\./g, ''));
                return resolve(numberOfResults);
              },
              error: function(e) {
                reject(e);
              }
            });
          });
        };

        //check that every word has a result

				
        function buildScoresIfNotThere(words) {
          if (words[0].score > 0) {
            // assume all scores are there
            return new Promise(function(resolve, reject) {
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

        buildScoresIfNotThere(words).then(function() {
          console.log(JSON.stringify(words));

          //get worst word in words
          var worstWord = words.shift();
          getNumOfResults(word + " " + masterWord).then(function(scoreNew) {
            //give the oldWord a last chance
            getNumOfResults(worstWord.name + " " + masterWord).then(function(scoreOld) {
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
            });
          });
        });

      });
    }
  },


  _buildSearchString(config) {
    return new Promise(function(resolve, reject) {
      console.log("build search string" + urlLib._evolutionModule);
      urlLib._evolutionModule.updateLexicon(config).then(function(config) {
        console.log("updated lexicon");
        var words = [];
        words.push(_get_random_word(config.wordlist));
        words.push(_get_random_word(config.wordlist));
        var searchString = words.join(" and ");
        resolve(searchString);
      });
    });

    function _get_random_word(w) {
      return w[Math.floor(Math.random() * w.length)];
    }
  },

//------------- _getURL Begin ------------------------------------------------------------------

    _urlModule: {
        /**
         * Parses the returned google page for the shown links. They follow a specific schema, are matched and stored in an array
         * Schema for links: <div class="rc"><h3 class="r"><a href="LINK" onmousedown="..." ...>DESCRIPTION</a></h3>
         * @param page source of a google search
         * @return an array with all search results of this page, so usually 10 entries
         * */
        _get_links: function(data) {
            var result_link=/<div class="rc"><h3 class="r"><a href="([\S])+"/g;
            var trim_html=/<div class="rc"><h3 class="r"><a href=/g;
            var trim_ticks=/"/g;
            var all_links = [];

            do {
                var match = result_link.exec(data);
                if(match != null) {
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
        _get_random_URL: function(data) {
            var links = urlLib._urlModule._get_links(data);
            return links[Math.floor(Math.random() * links.length)];
        },
    },

    _getUrl: function(searchString) {
        console.log("Search String is: " + searchString)
        return new Promise(function(resolve, reject) {
            var url = "https://www.google.com/search?q=" + encodeURIComponent(searchString);
            $.get({
                url: url,
                success: data => {
                    url = urlLib._urlModule._get_random_URL(data);
                    console.log("Created URL is: " + url);
                    resolve(url);
                },
                error: e =>{
                    //url = urlLib._urlModule._get_random_URL(fake_test_data);
                    //console.log("Created URL from fake_test_data is: " + url);
                    reject(e);
                }
            });

        })
    },

//------------- _getURL End --------------------------------------------------------------------


  // This Method must return the url if valid
  // If the url is not valid the function mus return false
  _approveUrl: function(url, config) {
    return new Promise(function(resolve, reject) {
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
  }



};


var lib = urlLib
lib.hello()

lib._getUrl("asdasd")