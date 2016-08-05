var Match = function() {
    var player1;
    var player2;

    var round = 0;
    var question = {}

    return {
        player1: player1,
        player2: player2,
        round: round,
        question: question
    };
}

exports.Match = Match;
