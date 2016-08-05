var Player = function() {
    var id;
    var name;
    var socket;
    var matchId;
    var ready = false;
    var answer = null;

    return {
        id: id,
        name: name,
        socket: socket,
        matchId: matchId,
        ready: ready,
        answer: answer
    };
};

exports.Player = Player;
