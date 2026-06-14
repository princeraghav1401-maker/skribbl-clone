class Player {
    constructor({ id, name, socketId, isHost = false }) {
        this.id = id;
        this.name = name;
        this.socketId = socketId;
        this.score = 0;
        this.isHost = isHost;
        this.hasGuessed = false;
    }

    resetGuessStatus() {
        this.hasGuessed = false;
    }
}

module.exports = Player;