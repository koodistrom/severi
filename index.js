var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var fileName = './highScores.json';
var highScore = require('./highScores.json');


/*console.log(highScore.levels[0].scoreList[0].name);

console.log(highScore.levels[0].scoreList.push({"name": "kakka",
"time" : 3}));

fs.writeFile(fileName, JSON.stringify(highScore, null, 2), function (err) {
    if (err) return console.log(err);
    console.log(JSON.stringify(highScore));
    console.log('writing to ' + fileName);
  });
  */

//putScore(1, 8.01, "gaylordMcPenisilin");


//  console.log(doesScoreFit(1,2));

server.listen(6969, function(){
    console.log("severi pyörii");
});

io.on('connection', function(socket){
    console.log("pelaaja löytyi");
    socket.emit('socketID', { id: socket.id });
    

    socket.on('disconnect', function(){
        console.log("pelaaja poistui");
    });
    socket.on('testi', (data) => {
        console.log(data);
        if(doesScoreFit(data.level, data.time)){
            console.log("mahtuu mahtuu");
            socket.emit('scoreFits', true);
        }else{
            socket.emit('scoreFits', false);
        }
    });

    socket.on('nameTime', (data) => {
        console.log(data);
        putScore(data.level, data.time, data.name);
    });

    socket.on('getHS', (data) => {
        socket.emit('testing',  true);
        
        var names = [];
        var times = [];
        highScore.levels[data-1].scoreList.forEach(function(item) {
            names.push(item.name);
            times.push(item.time);
        });

        socket.emit('HSinfo', names, times );
        console.log( names);
        
        console.log("info sent");
    });
});


function doesScoreFit(levelNum, time) {
    var levelScores = highScore.levels[levelNum-1].scoreList;
    var scoreFits = false;
    levelScores.forEach(function(item) {
        if(time<item.time){
            scoreFits = true;
        }
        if(item.time==null){
            scoreFits = true;
        }
    });
    return scoreFits;
  }

  function putScore(levelNum, time, name) {
    var levelScores = highScore.levels[levelNum-1].scoreList;
    var found = false
    levelScores.forEach(function(item, index) {
        
        if((time<item.time || item.time == null) && found == false){
            levelScores.splice(index, 0, {"name" : name , "time" : time});
            found = true;
        }

    });

    levelScores.pop();

    fs.writeFile(fileName, JSON.stringify(highScore, null, 2), function (err) {
        if (err) return console.log(err);
        console.log(JSON.stringify(highScore));
        console.log('writing to ' + fileName);
      });
    
  }