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

  hello: function() {
    console.log("Hello World")
  },

    _get_links: function() {
        //data = fake_test_data;
        var result_link=/<div class="rc"><h3 class="r"><a href="([\S])+"/g;
        var trim_html=/<div class="rc"><h3 class="r"><a href=/g
        var trim_ticks=/"/g

        var all_links = [];
        var single_link

        do {
            var match = result_link.exec(fake_test_data);
            if(match != null) {
                //This is the whole link. Now the matches need to be replace
                single_link = match[0];
                single_link = single_link.replace(trim_html, "");
                single_link = single_link.replace(trim_ticks, "");

                //store the link
                all_links.push(single_link);
                console.log(single_link)
            }
        } while (match != null)

        console.log(all_links)
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


    //example: <div class="rc"><h3 class="r"><a href="http://www.getraenke-holz.de/getraenkewissen~8a81811d400f785601400f81c6fe0041.de.html" onmousedown="return rwt(this,'','','','11','AFQjCNE6DhktwFPAo1AVm1IrKQ6bJ5oWjQ','BpZ5-KhkO_2ZeHc3Ldm02Q','0ahUKEwijgMOk9dvTAhWLcBoKHe8CBE4QFghQMAo','','',event)">Getränkewissen: Mineralwasser, Bier, Saft, Wein ... - Getränke Holz</a></h3>
    //<div class="rc"><h3 class="r"><a href=LINK onmousedown="..." ...>DESCRIPTION</a></h3>
  _getUrl: function(searchString) {
    console.log("Search String is: " + searchString)
    return new Promise(function(resolve, reject) {
      // ADD btnI& for Lucky Search
      var url = "https://www.google.com/search?q=" + encodeURIComponent(searchString);
      $.get({
        url: url,
        success: function(data) {
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


var lib = urlLib
lib.hello()

lib._getUrl("asdasd")