const Game = require("./Game");

class Room {
    constructor({ roomCode, host, settings = {} }) {
        this.roomCode = roomCode;
        this.host = host;
        this.players = [host];

        this.settings = {
            rounds: Math.min(Math.max(settings.rounds || 3, 2), 10),
            drawTime: Math.min(Math.max(settings.drawTime || 60, 15), 240),
            maxPlayers: Math.min(Math.max(settings.maxPlayers || 8, 2), 20),
            wordCount: Math.min(Math.max(settings.wordCount || 3, 1), 5),
            isPrivate: true,
        };

        this.game = new Game({
            rounds: this.settings.rounds,
            drawTime: this.settings.drawTime,
            wordCount: this.settings.wordCount,
        });
    }

    addPlayer(player) {
        if (this.players.length >= this.settings.maxPlayers) {
            throw new Error("Room is full");
        }

        this.players.push(player);
    }

    removePlayer(socketId) {
        this.players = this.players.filter(
            (player) => player.socketId !== socketId
        );
    }

    isHost(socketId) {
        return this.host.socketId === socketId;
    }

    getLeaderboard() {
        return [...this.players].sort((a, b) => b.score - a.score);
    }
}

module.exports = Room;