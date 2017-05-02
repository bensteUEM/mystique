// See a working example: https://jsfiddle.net/39kvmxd4/11/
// Open DEV Tools to see the result
// Disable WebSecurity for CORS requests
/* Libs:
	https://code.jquery.com/jquery-3.2.1.min.js
	https://cdn.jsdelivr.net/bluebird/3.5.0/bluebird.js
*/


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

  _getUrl: function(searchString) {
    console.log("Search String is: " + searchString)
    return new Promise(function(resolve, reject) {
      // ADD btnI& for Lucky Search
      var url = "https://www.google.com/search?q=" + encodeURIComponent(searchString);
      $.get({
        url: url,
        success: function(d) {
          resolve(url);
        },
        error: function(e) {
          reject(e);
        }
      });

    })
  },

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

var wl = ["abacus", "abbey", "abdomen", "ability", "abolishment", "abroad", "accelerant", "accelerator", "accident", "accompanist", "accordion", "account", "accountant", "achieve", "achiever", "acid", "acknowledgment", "acoustic", "acoustics", "acrylic", "act", "action", "active", "activity", "actor", "actress", "acupuncture", "ad", "adapter", "addiction", "addition", "address", "adjustment", "administration", "adrenalin"];


urlLib.generateURL({
  wordlist: wl
}).then(function(url) {
  console.log(url);
});
