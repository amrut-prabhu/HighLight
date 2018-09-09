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

router.get('/joinGroup', function(req, res) {
    //console.log(req.query.username)
    User.findOne({'local.username': req.query.username}, function(err, user) {
        console.log(user)
        user.local.groups.push(req.query.groupName)
        user.save((err, savedUser) => {
            if(err) 
                throw err;
            else
                User.find({'local.groups': {$in: [req.query.groupName]}}, function(err, users) {
                    console.log(users)
                    users.forEach((user) => {
                        console.log("User: " + user)
                        if(user.local.username !== savedUser.local.username) {
                            user.local.friends.push(savedUser.local.username)
                            console.log("User after adding friend: " + user)
                            user.save((err, savedUser2) => {
                                savedUser.local.friends.push(savedUser2.local.username)
                                console.log(savedUser)
                                savedUser.save((err) => {
                                    if(err)
                                        throw err
                                    res.send()  
                                })
                            })
                        } else {
                            res.send()  
                        }
                    })
                })
            })
        })
})

router.get('/logout', function(req, res) {

        User.find({ 'local.username' :  req.user.local.username }, function(err, user) {
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

router.get('/createUser', function(req, res) {
    User.find({'local.username': req.query.username.toString()}, 'local.username', (err, user) => {
        console.log(user)
        if(!user) {
            request.post({
              headers: {'content-type' : 'application/json'},
              url:     'https://api.mlab.com/api/1/databases/textinfo/collections/users?apiKey=IugYRqr7D5Wf1pBgxxDhdPysWbzblmnV',
              body:    JSON.stringify({username: req.query.username.toString(), groups: [], friends: []})
            }, function(error, response, body){
                if(error) res.send(error)
                res.send(200)
            });
        } else {
            res.send("User already existed")
        }
    })
})

router.get('/getText', function(req, res) {
    request.post({
      headers: {'content-type' : 'application/json'},
      url:     'https://api.mlab.com/api/1/databases/textinfo/collections/local?apiKey=IugYRqr7D5Wf1pBgxxDhdPysWbzblmnV',
      body:    JSON.stringify({username: req.query.username, selectedText: req.query.selectedText, url: req.query.url})
    }, function(error, response, body){
        if(error) res.send(error)
        res.send(200)
    });
});

function getFriendList(username) {
    console.log("Stuff")
        
}

router.get('/sendHighlights', function(req, res) {
    console.log("Route reached")
    var url = req.query.url
    request("https://api.mlab.com/api/1/databases/textinfo/collections/local?q={\"url\":\"" + encodeURIComponent(url) + "\"}&apiKey=IugYRqr7D5Wf1pBgxxDhdPysWbzblmnV", function (error, response, urlRecords) {
        // console.log(response)
        // console.log(body)
        urlRecords = JSON.parse(urlRecords);
        console.log(urlRecords)

        User.find({'local.username': req.query.username.toString() }, 'local.friends', (err, res2) => {

        var friendList = res2 == null ? [] : res2.local.friends

        var result = []

        console.log("Filtering");
        var denom = 0
        for(var i = 0; i < urlRecords.length; i++) {
            if(urlRecords[i] == undefined)
                continue
            result[urlRecords[i].selectedText] = {"matches" : 1, "friendMatches" : 0}
            for(var j = i + 1; j < urlRecords.length; j++) {
                if(urlRecords[j] == undefined)
                    continue
                console.log("Comparing " + urlRecords[i].selectedText  + " AND " + urlRecords[j].selectedText)
                if(urlRecords[i].selectedText === urlRecords[j].selectedText) {
                    console.log("Matched!")
                    if(friendList.indexOf(urlRecords[j].username) !== -1) {
                        urlRecords[i] = undefined
                        result[urlRecords[j].selectedText].matches++;
                        result[urlRecords[j].selectedText].friendMatches++;
                    } else {
                        urlRecords[j] = undefined
                        result[urlRecords[i].selectedText].matches++;
                        if(friendList.indexOf(urlRecords[i].username) !== -1) {
                            result[urlRecords[i].selectedText].friendMatches++;
                        }
                    }
                }
            }
            denom += result[urlRecords[i].selectedText].matches
        }

        var threshold = Math.floor(0.1 * denom)
        console.log(denom)
        for (var key in result) {
            console.log(key)
            result[key] = result[key].matches > threshold ? result[key] : undefined
        }

        console.log(result)

        console.log("Eliminating substrings")
        for(var i = 0; i < urlRecords.length; i++) {
            var record = urlRecords[i]
            if(record === undefined)
                continue
            for (var j = 0; j < urlRecords.length; j++) {
                var otherRecord = urlRecords[j]
                if(otherRecord === undefined)
                    continue
                console.log("Comparing " + record.selectedText  + " AND " + otherRecord.selectedText)
                if(record.selectedText.indexOf(otherRecord.selectedText.trim()) !== -1 && i !== j) {
                    console.log("Matched!")
                    if(friendList.indexOf(urlRecords[j].username) !== -1) {
                        urlRecords[i] = undefined
                        result[urlRecords[j].selectedText].matches++;
                        result[urlRecords[j].selectedText].friendMatches++;
                        result[record.selectedText] = undefined
                    } else {
                        urlRecords[j] = undefined
                        result[urlRecords[i].selectedText].matches++;
                        if(friendList.indexOf(urlRecords[i].username) !== -1) {
                            result[urlRecords[i].selectedText].friendMatches++;
                        }
                        result[otherRecord.selectedText] = undefined
                    }
                }
            }
        }

        console.log(result)

        console.log("Intersection")
        for(var i = 0; i < urlRecords.length; i++) {
            var record = urlRecords[i]
            var breaker = false
            if(record === undefined)
                continue
            for (var j = i + 1; j < urlRecords.length; j++) {
                var otherRecord = urlRecords[j]
                if(otherRecord === undefined)
                    continue
                console.log("Comparing " + record.selectedText  + " AND " + otherRecord.selectedText)
                if(fuzz.ratio(record.selectedText.trim(), otherRecord.selectedText.trim()) > 50) {
                    console.log("Fuzzy selected")
                    if(friendList.indexOf(urlRecords[j].username) !== -1) {
                        urlRecords[i] = undefined
                        result[urlRecords[j].selectedText].matches++;
                        result[urlRecords[j].selectedText].friendMatches++;
                        result[record.selectedText] = undefined
                    } else if(friendList.indexOf(urlRecords[i].username) !== -1) {
                        urlRecords[j] = undefined
                        result[urlRecords[i].selectedText].matches++;
                        result[urlRecords[i].selectedText].friendMatches++;
                        result[otherRecord.selectedText] = undefined
                    } else if(result[record.selectedText] > result[otherRecord.selectedText]) {
                        console.log("Removing " + otherRecord.selectedText)
                        result[record.selectedText].matches++
                        result[otherRecord.selectedText] = undefined
                        urlRecords[j] = undefined
                    } else {
                        console.log("Removing " + record.selectedText)
                        result[otherRecord.selectedText].matches++
                        result[record.selectedText] = undefined
                        urlRecords[i] = undefined
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
                final_result.push({"text": key, "matches": result[key].matches || 1, "friendMatches": result[key].friendMatches || 1})
            }
        }
        for(var json of final_result) {
            json.intensity = json.matches / ratio
        }
        console.log(final_result)
        res.send(final_result)

        });
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
