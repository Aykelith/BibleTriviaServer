// init variables
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var morgan = require('morgan');
var Player = require("./utils/Player").Player;
var Match = require("./utils/Match").Match;
//==============================================================================

app.use(morgan('dev'));

var matches = [];
var players = [];

io.on('connection', function(socket){
	console.log("Client connected");
	socket.emit('introduce');

	var playerId;

	socket.on('introduce', function(data){
		var player = new Player();
		player.socket = socket;
		player.id = data.id;
		player.name = data.name;

		console.log(data);

		playerId = players.length;
		players.push(player);

		if (players.length == 2) {
			foundMatch(0, 1);
		}
	});

	socket.on('prepare', function(data){
		socket.emit('question', { id: matches[players[playerId].matchId].question.id });
	});

	socket.on('ready', function(data){
		console.log("Player#" + playerId + " from Match#" + players[playerId].matchId + " is ready");
		players[playerId].ready = true;

		if (players[matches[players[playerId].matchId].player1].ready &&
			players[matches[players[playerId].matchId].player2].ready) {
			console.log("Both players are ready for Match#" + players[playerId].matchId);
			players[matches[players[playerId].matchId].player1].socket.emit('ready');
			players[matches[players[playerId].matchId].player2].socket.emit('ready');

			players[matches[players[playerId].matchId].player1].ready = false;
			players[matches[players[playerId].matchId].player2].ready = false;

			setNextQuestionId(players[playerId].matchId);
		}
	});

	socket.on('answer', function(data) {
		console.log("Answer from Player#" + playerId + ": '" + data.answer + "'");
		players[playerId].answer = data.answer;

		if (players[matches[players[playerId].matchId].player1].answer !== null &&
			players[matches[players[playerId].matchId].player2].answer !== null) {
			console.log("Both players answered");
			var player1answer = players[matches[players[playerId].matchId].player1].answer == matches[players[playerId].matchId].question.correctAnswer ? true : false;
			var player2answer = players[matches[players[playerId].matchId].player2].answer == matches[players[playerId].matchId].question.correctAnswer ? true : false;

			players[matches[players[playerId].matchId].player1].socket.emit('answer', {
				you: { label: players[matches[players[playerId].matchId].player1].answer, correct: player1answer },
				vs: { label: players[matches[players[playerId].matchId].player2].answer, correct: player2answer }
			});

			players[matches[players[playerId].matchId].player2].socket.emit('answer', {
				you: { label: players[matches[players[playerId].matchId].player2].answer, correct: player2answer },
				vs: { label: players[matches[players[playerId].matchId].player1].answer, correct: player1answer }
			});
		}
	});

	socket.on('disconnect', function(){
		console.log("Player#" + playerId + " disconnected");
	});
});

function foundMatch(player1, player2) {
	console.log(player1 + " & " + player2 + " enters in a match");

	players[player1].socket.emit("foundMatch", { vsId: players[player2].id, vsName: players[player2].name });
	players[player2].socket.emit("foundMatch", { vsId: players[player1].id, vsName: players[player1].name });

	var matchId = matches.length;
	players[player1].matchId = matchId;
	players[player2].matchId = matchId;

	var match = new Match();
	match.player1 = player1;
	match.player2 = player2;
	matches.push(match);
	setNextQuestionId(matchId);
}

function setNextQuestionId(matchId) {
	matches[matchId].question = {
		id: 1234,
		correctAnswer: "answer3"
	};
}

server.listen(process.env.PORT || 8080, function(){
	console.log("Listening...");
});
