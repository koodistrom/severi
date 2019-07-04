var app = require('express')();
var mongoose = require('mongoose');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var port = process.env.PORT || 6969;
var mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/jdce';
HighScore = require('./models/highScore');



//connect to Mongoose
mongoose.connect(mongoUrl, {useNewUrlParser: true});
var db = mongoose.connection;


//server starts
server.listen(port, function(){
    console.log("severi pyörii");
    
});

//defining socket io events
io.on('connection', function(socket){
    console.log("pelaaja löytyi");

    socket.emit('socketID', { id: socket.id });
    

    socket.on('disconnect', function(){
        console.log("pelaaja poistui");
    });

    //sends info to the client if the score fits
    socket.on('testi', (data) => {
        console.log(data);
        compareHSfromDB(data.level, data.time, socket);
    });

    //if the score fit client sends name&time data to the highscore
    socket.on('nameTime', (data) => {
        console.log(data);
        putScore(data.time, data.level, data.name);
    });

    //sends names and times of specific level for the client as arrays
    socket.on('getHS', (data) => {
        socket.emit('testing',  true);
        
        sendArraysFromDB(data, socket);

    });
});



  //vertify database connecting

mongoose.connection.on('connected', function(){
    console.log('yhdistetty');

});
//retrieve and compare times from DB and send info do they fit to client
function compareHSfromDB(level, time, socket){
    HighScore.getHighScoresLevel(level,(err, highScores) => {
        if(err){
            console.log(err);
            throw err;
            
        }

        var levelScores = highScores.scoreList;
        console.log(levelScores);
        var scoreFits = false;

        levelScores.forEach(function(item) {
            if(time<item.time){
                console.log('mahtuu');
                scoreFits = true;
            }
            if(item.time==null){
                console.log('mahtuu');
                scoreFits = true;
            }
        });

        if(scoreFits){
            socket.emit('scoreFits', true);
        }else{
            socket.emit('scoreFits', false);
        }

    });
}

//make arrays from DB and emit

function sendArraysFromDB(level, socket){
    HighScore.getHighScoresLevel(level,(err, highScores) => {
        if(err){
            console.log(err);
            throw err;
            
        }

        var names = [];
        var times = [];

        var levelScores = highScores.scoreList;
        console.log(levelScores);
        

        levelScores.forEach(function(item) {
            names.push(item.name);
            times.push(item.time);
        });

        socket.emit('HSinfo', names, times );
        console.log( names);
        console.log( times);
        console.log("info sent");

    });
}


//addHighscore to db

function addHSToDB(level, index, time, name){
    HighScore.update(
        { level: level }, 
        { $push: { 
            scoreList:{ 
                $each: [{name: name, time: time}],
                $position: index,
                $slice: 10 }}},
        (err, callback) => {
            if(err){
                console.log(err);
                throw err;
                
            }

            console.log(callback);
    });

}

//check where score fits
function putScore(time, level, name){
    HighScore.getHighScoresLevel(level,(err, highScores) => {
        if(err){
            console.log(err);
            throw err;
            
        }

        var levelScores = highScores.scoreList;
        console.log(levelScores);
        var found = false

        levelScores.forEach(function(item, index) {
            
            if((time<item.time || item.time == null) && found == false){
                addHSToDB(level, index, time, name);
                found = true;
            }
    
        });


    });
}
