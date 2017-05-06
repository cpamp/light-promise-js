var $Promise = require("../$promise.js").$Promise;

(function promises() {
    new $Promise(function(resolve, reject) {
        console.log('Begin Promise-1');
        setTimeout(function() { resolve('Promise-1 Resolved'); }, 5000);
    }).then(function(data) {
        console.log(data);
    });
    console.log('After Promise-1');

    new $Promise(function(resolve, reject) {
        console.log('Begin Promise-2');
        setTimeout(function() { 
            resolve(new $Promise(function(resolve, reject) {
                resolve('Promise-2 Resolved');
            }));
        }, 2000);
    }).then(function(data) {
        console.log(data);
        return "Done done";
    }).then(function(data) {
        console.log(data);
    });
    console.log('After Promise-2');
})();