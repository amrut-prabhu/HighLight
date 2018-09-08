var express = require('express');
var router = express.Router();
var passport = require('passport')
var User = require('../config/mongoose_setup');
var TextInfo = require('../config/mongoose_setup2');
var request = require('request');
var fuzz = require('fuzzball')

/* GET home page. */
router.get('/', isNotLoggedIn, function(req, res, next) {
  res.render('index', { title: 'Registration' });
});

router.get('/login', isNotLoggedIn, function(req, res, next) {
  res.render('login', { title: 'Login', message : req.flash('loginMessage')  });
});

router.get('/signup', isNotLoggedIn, function(req, res, next) {
  res.render('signup', { title: 'Sign Up', message : req.flash('signupMessage') });
});

router.get('/logout', function(req, res) {

        User.findOne({ 'local.username' :  req.user.local.username }, function(err, user) {

            user.local.loggedIn = false;
            user.save((err) => {
                if(err) 
                    throw err;
                else
                  req.logout();
                  res.redirect('/');
            });
        });
    });

router.get('/getText', function(req, res) {
    request.post({
      headers: {'content-type' : 'application/json'},
      url:     'https://api.mlab.com/api/1/databases/textinfo/collections/local?apiKey=IugYRqr7D5Wf1pBgxxDhdPysWbzblmnV',
      body:    JSON.stringify({username: req.query.username || "LOL", selectedText: req.query.selectedText || "LOL LOL2 LOL", url: req.query.url || "LOL"})
    }, function(error, response, body){
        if(error) res.send(error)
        res.send(200)
    });
});

router.get('/sendHighlights', function(req, res) {
    console.log("Route reached")
    var url = req.query.url || "https://en.wikipedia.org/wiki/Computer_programming"
    request("https://api.mlab.com/api/1/databases/textinfo/collections/local?q={\"url\":\"" + encodeURIComponent(url) + "\"}&apiKey=IugYRqr7D5Wf1pBgxxDhdPysWbzblmnV", function (error, response, urlRecords) {
        // console.log(response)
        // console.log(body)
        urlRecords = JSON.parse(urlRecords);
        console.log(urlRecords)

        var result = []

        console.log("Filtering");
        var denom = 0
        for(var i = 0; i < urlRecords.length; i++) {
            result[urlRecords[i].selectedText] = 1
            for(var j = i + 1; j < urlRecords.length; j++) {
                console.log("Comparing " + urlRecords[i].selectedText  + " and " + urlRecords[j].selectedText)
                if(urlRecords[i].selectedText === urlRecords[j].selectedText) {
                    console.log("Matched!")
                    urlRecords.splice(j, 1)
                    result[urlRecords[i].selectedText]++;
                    j--
                }
            }
            denom += result[urlRecords[i].selectedText]
        }

        var threshold = Math.floor(0.1 * denom)
        console.log(denom)
        for (var key in result) {
            console.log(key)
            result[key] = result[key] > threshold ? result[key] : undefined
        }

        console.log(result)

        console.log("Eliminating substrings")
        for(var i = 0; i < urlRecords.length; i++) {
            var record = urlRecords[i]
            for (var j = i + 1; j < urlRecords.length; j++) {
                var otherRecord = urlRecords[j]
                console.log("Comparing " + record.selectedText  + " and " + otherRecord.selectedText)
                if(record.selectedText.indexOf(otherRecord.selectedText) !== -1) {
                    console.log("Matched!")
                    result[record.selectedText]++
                    result[otherRecord.selectedText] = undefined
                    urlRecords.splice(j, 1)
                    j--;
                }
            }
        }

        console.log(result)

        console.log("Intersection")
        for(var i = 0; i < urlRecords.length; i++) {
            var record = urlRecords[i]
            var breaker = false
            for (var j = i + 1; j < urlRecords.length; j++) {
                var otherRecord = urlRecords[j]
                console.log("Comparing " + record.selectedText  + " and " + otherRecord.selectedText)
                if(fuzz.token_set_ratio(record.selectedText, otherRecord.selectedText) > 55) {
                    if(result[record.selectedText] > result[otherRecord.selectedText]) {
                        result[record.selectedText]++
                        result[otherRecord.selectedText] = undefined
                        urlRecords.splice(j, 1)
                        j--
                    } else {
                        result[otherRecord.selectedText]++
                        result[record.selectedText] = undefined
                        urlRecords.splice(i, 1)
                        i--
                        breaker = true
                    }
                }
                if(breaker) {
                    break
                }
            }
        }

        console.log(result)
        
        var final_result = []
        var ratio = 1
        for (var key in result) {
            if (result[key] !== undefined) {
                if(result[key] >= ratio) {
                    ratio = result[key]
                }                
                final_result.push({"text": key, "matches": result[key]})
            }
        }
        for(var json of final_result) {
            json.intensity = json.matches / ratio
        }
        console.log(final_result)
        res.send(final_result)
    })
}) 



router.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true
    }));

router.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the login  page if there is an error
        failureFlash : true // allow flash messages
    }));


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

function isNotLoggedIn(req, res, next) {

    // if user is authenticated in the session, log them out
    if (req.isAuthenticated())
        res.redirect('/logout');

    // if they aren't redirect them to the home page
    return next();
}

module.exports = router;
