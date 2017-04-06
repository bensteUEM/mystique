// See a working example: https://jsfiddle.net/39kvmxd4/11/
// Open DEV Tools to see the result
// Disable WebSecurity for CORS requests

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
          return this.generateURL(config);
        });
    })

  },


  _buildSearchString(config) {
    return new Promise(function(resolve, reject) {
      // Find new Words!
      var words = [];
      words.push(_get_random_word(config.wordlist));
      words.push(_get_random_word(config.wordlist));
      var searchString = words.join(" and ");

      resolve(searchString);
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
      if (new Date().getTime() % 2) {
        console.log("URL IS VALID");
        resolve(url);
        return;
      }
      console.log("URL IS NOT VALID");
      resolve(false);

    })
  }



}

var wl = ["abacus", "abbey", "abdomen", "ability", "abolishment", "abroad", "accelerant", "accelerator", "accident", "accompanist", "accordion", "account", "accountant", "achieve", "achiever", "acid", "acknowledgment", "acoustic", "acoustics", "acrylic", "act", "action", "active", "activity", "actor", "actress", "acupuncture", "ad", "adapter", "addiction", "addition", "address", "adjustment", "administration", "adrenalin"];


urlLib.generateURL({
  wordlist: wl
}).then(function(url) {
  console.log(url);
});
