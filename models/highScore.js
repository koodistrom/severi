var mongoose = require('mongoose');

//scores sub schema
var scoreSchema = mongoose.Schema({
    name:{
        type: String
    },
    time:{
        type: Number
    }
});

//highScores schema
var highScoresSchema = mongoose.Schema({
    level:{
        type: Number
    },
    scoreList:{
        type: [scoreSchema],
        default: undefined
    }
}, 
{collection: 'highScores'},
 { bufferCommands: false });

var highScores = module.exports = mongoose.model('highScore', highScoresSchema);

// Get highScores
module.exports.getHighScores = function(callback, limit){
    return highScores.find(callback).limit(limit);
}

// Get highScore by level
module.exports.getHighScoresLevel = function(level, callback){
    return highScores.findOne({'level': level},callback);
}
