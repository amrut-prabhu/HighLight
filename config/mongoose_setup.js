// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the schema for our user model
var userSchema = mongoose.Schema({
	local : {
        username     : String,
        groups		 : Array,
        friends		 : Array
    }

}, { usePushEach: true });

// userSchema.path('local.username').validate(function(value, done) {
//     this.model('User').count({ username: value }, function(err, count) {
//         if (err) {
//             return done(err);
//         } 
//         // If `count` is greater than zero, "invalidate"
//         done(!count);
//     });
// }, 'username already exists');



// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
