var mongoose = require('mongoose'),
    config   = require('config');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
	username: String,
	password: String
});
var User = mongoose.model('User', UserSchema);

// var State = new Schema({
        
// });

// var CodeSchema = new Schema({
//         name: String,
//         user: ObjectId,
//         states: {},
//         transitions: [],
//         src: [
//         ]
// });

// var Code = mongoose.model('Code', CodeSchema);

module.exports.User = User;
// module.exports.Code = Code;