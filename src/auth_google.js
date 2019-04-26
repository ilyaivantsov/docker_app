var authentication = require(__dirname + '/google-sheet/authentication');


authentication.authenticate().then(auth => {console.log(auth)})
