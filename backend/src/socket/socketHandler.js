const Player = require("../classes/Player");
const Room = require("../classes/Room");
const generateRoomCode = require("../utils/generateRoomCode");

const rooms = new Map();

function socketHandler(io) {
    io.on("connection", (socket) => {
        console.log("User Connected:", socket.id);

        // Create Room
        socket.on("create_room", ({ playerName, settings }, callback) => {
            const roomCode = generateRoomCode();

            const host = new Player({
                id: socket.id,
                name: playerName,
                socketId: socket.id,
                isHost: true,
            });

            const room = new Room({
                roomCode,
                host,
                settings,
            });

            rooms.set(roomCode, room);
            socket.join(roomCode);

            console.log(`Room Created: ${roomCode}`);

            callback({
                success: true,
                roomCode,
                players: room.players,
                settings: room.settings,
            });
        });

        // Join Room
        socket.on("join_room", ({ roomCode, playerName }, callback) => {
            const room = rooms.get(roomCode);

            if (!room) {
                return callback({
                    success: false,
                    message: "Room not found",
                });
            }

            if (room.players.length >= room.settings.maxPlayers) {
                return callback({
                    success: false,
                    message: "Room is full",
                });
            }

            const player = new Player({
                id: socket.id,
                name: playerName,
                socketId: socket.id,
            });

            room.addPlayer(player);
            socket.join(roomCode);

            io.to(roomCode).emit("player_joined", {
                player,
                players: room.players,
            });

            console.log(`${playerName} joined room: ${roomCode}`);

            callback({
                success: true,
                roomCode,
                player,
                players: room.players,
                settings: room.settings,
            });
        });

        // Start Game
        socket.on("start_game", ({ roomCode }, callback) => {
            const room = rooms.get(roomCode);

            if (!room) {
                return callback({
                    success: false,
                    message: "Room not found",
                });
            }

            if (!room.isHost(socket.id)) {
                return callback({
                    success: false,
                    message: "Only host can start game",
                });
            }

            if (room.players.length < 2) {
                return callback({
                    success: false,
                    message: "Minimum 2 players required",
                });
            }

            const roundData = room.game.startNewRound(room.players);

            console.log("================================");
            console.log("ROUND START SENT");
            console.log("WORD OPTIONS:", roundData.wordOptions);
            console.log("DRAWER:", roundData.drawer.name);
            console.log("SOCKET:", roundData.drawer.socketId);
            console.log("================================");

            io.to(roomCode).emit("canvas_clear");

            io.to(roomCode).emit("round_start", {
                round: roundData.round,
                drawerId: roundData.drawer.id,
                drawerName: roundData.drawer.name,
                drawTime: roundData.drawTime,
            });

            io.to(roundData.drawer.socketId).emit("word_options", {
                wordOptions: roundData.wordOptions,
            });
            console.log(`Game started in room: ${roomCode}`);
            callback({
                success: true,
                initialRoundData: {
                    round: roundData.round,
                    drawerId: roundData.drawer.id,
                    drawerName: roundData.drawer.name,
                    drawTime: roundData.drawTime,
                    wordOptions:
                        roundData.drawer.socketId === socket.id
                            ? roundData.wordOptions
                            : [],
                },
            });
        });

        // Word Chosen
        socket.on("word_chosen", ({ roomCode, word }, callback) => {
            const room = rooms.get(roomCode);

            if (!room) {
                return callback({
                    success: false,
                    message: "Room not found",
                });
            }

            if (room.game.currentDrawer.socketId !== socket.id) {
                return callback({
                    success: false,
                    message: "Only drawer can choose word",
                });
            }

            if (room.game.selectedWord) {
                return callback({
                    success: false,
                    message: "Word already selected",
                });
            }

            if (!room.game.wordOptions.includes(word)) {
                return callback({
                    success: false,
                    message: "Invalid word selected",
                });
            }

            room.game.chooseWord(word);

            io.to(roomCode).emit("word_selected", {
                drawerId: room.game.currentDrawer.id,
                drawerName: room.game.currentDrawer.name,
                hint: room.game.getHint(),
                message: "Word selected. Start drawing!",
            });

            io.to(room.game.currentDrawer.socketId).emit("drawer_word", {
                word: room.game.selectedWord,
            });

            startTimer(io, roomCode);

            callback({
                success: true,
                hint: room.game.getHint(),
            });
        });

        // Guess Word
        socket.on("guess", ({ roomCode, guess }, callback) => {
            const room = rooms.get(roomCode);

            if (!room) {
                return callback({
                    success: false,
                    message: "Room not found",
                });
            }

            const player = room.players.find((p) => p.socketId === socket.id);

            if (!player) {
                return callback({
                    success: false,
                    message: "Player not found",
                });
            }

            if (room.game.currentDrawer?.socketId === socket.id) {
                return callback({
                    success: false,
                    message: "Drawer cannot guess",
                });
            }

            if (room.game.timeLeft <= 0) {
                return callback({
                    success: false,
                    message: "Round already ended",
                });
            }

            if (player.hasGuessed) {
                return callback({
                    success: false,
                    message: "Player already guessed correctly",
                });
            }

            const isCorrect = room.game.checkGuess(guess);

            if (isCorrect) {
                player.hasGuessed = true;
                player.score += 100;

                const remainingGuessers = room.players.filter(
                    (p) =>
                        p.socketId !== room.game.currentDrawer.socketId &&
                        !p.hasGuessed
                );

                io.to(roomCode).emit("guess_result", {
                    
                    type: "guess",
                    playerName: player.name,
                    guess,
                    correct: true,
                    score: player.score,
                    leaderboard: room.getLeaderboard(),
                    message: `${player.name} guessed the word! `,
                });
                if (remainingGuessers.length === 0) {
                    endRound(io, roomCode);
                }

                return callback({
                    success: true,
                    correct: true,
                });
            }

            io.to(roomCode).emit("guess_result", {
                type: "guess",
                playerName: player.name,
                guess,
                correct: false,
                message: `${player.name}: ${guess}`,
            });

            callback({
                success: true,
                correct: false,
            });
        });

        // Drawing Events
        socket.on("draw_start", ({ roomCode, stroke }) => {
            const room = rooms.get(roomCode);
            if (!room) return;

            if (room.game.currentDrawer?.socketId !== socket.id) return;

            socket.to(roomCode).emit("draw_data", {
                type: "start",
                stroke,
            });
        });

        socket.on("draw_move", ({ roomCode, stroke }) => {
            const room = rooms.get(roomCode);
            if (!room) return;

            if (room.game.currentDrawer?.socketId !== socket.id) return;

            socket.to(roomCode).emit("draw_data", {
                type: "move",
                stroke,
            });
        });

        socket.on("draw_end", ({ roomCode }) => {
            const room = rooms.get(roomCode);
            if (!room) return;

            if (room.game.currentDrawer?.socketId !== socket.id) return;

            socket.to(roomCode).emit("draw_data", {
                type: "end",
            });
        });

        socket.on("canvas_clear", ({ roomCode }) => {
            const room = rooms.get(roomCode);
            if (!room) return;

            if (room.game.currentDrawer?.socketId !== socket.id) return;

            io.to(roomCode).emit("canvas_clear");
        });


        socket.on("draw_undo", ({ roomCode }) => {
            const room = rooms.get(roomCode);
            if (!room) return;

            if (room.game.currentDrawer?.socketId !== socket.id) return;

            socket.to(roomCode).emit("draw_undo");
        });


        // Chat Message
        socket.on("chat", ({ roomCode, text }, callback) => {
            const room = rooms.get(roomCode);

            if (!room) {
                return callback({
                    success: false,
                    message: "Room not found",
                });
            }

            const player = room.players.find((p) => p.socketId === socket.id);

            if (!player) {
                return callback({
                    success: false,
                    message: "Player not found",
                });
            }

            io.to(roomCode).emit("chat_message", {
                playerId: player.id,
                playerName: player.name,
                text,
            });

            callback({
                success: true,
            });
        });

        // Disconnect
        socket.on("disconnect", () => {
            console.log("User Disconnected:", socket.id);

            for (const [roomCode, room] of rooms.entries()) {
                const leavingPlayer = room.players.find(
                    (player) => player.socketId === socket.id
                );

                if (leavingPlayer) {
                    room.removePlayer(socket.id);

                    io.to(roomCode).emit("player_left", {
                        playerId: leavingPlayer.id,
                        playerName: leavingPlayer.name,
                        players: room.players,
                    });

                    console.log(`${leavingPlayer.name} left room: ${roomCode}`);

                    if (room.players.length === 0) {
                        rooms.delete(roomCode);
                        console.log(`Room deleted: ${roomCode}`);
                    }

                    break;
                }
            }
        });
    });
}

function startTimer(io, roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;

    clearInterval(room.game.timer);

    room.game.timeLeft = room.game.drawTime;

    room.game.timer = setInterval(() => {
        room.game.timeLeft -= 1;

        io.to(roomCode).emit("timer_update", {
            timeLeft: room.game.timeLeft,
            hint: room.game.getRevealedHint(),
        });

        if (room.game.timeLeft <= 0) {
            endRound(io, roomCode);
        }
    }, 1000);
}

function endRound(io, roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;

    clearInterval(room.game.timer);

  

    io.to(roomCode).emit("round_end", {
        word: room.game.selectedWord,
        leaderboard: room.getLeaderboard(),
    });

    console.log(`Round ended in room: ${roomCode}`);

    const totalTurns = room.game.totalRounds * room.players.length;
    console.log("CHECK GAME OVER:", {
        currentRound: room.game.currentRound,
        totalTurns,
    });

    if (room.game.currentRound >= totalTurns) {
        io.to(roomCode).emit("game_over", {
            winner: room.getLeaderboard()[0],
            leaderboard: room.getLeaderboard(),
        });

        console.log(`Game over in room: ${roomCode}`);
        return;
    }

    setTimeout(() => {
        room.game.nextDrawer(room.players);

        const roundData = room.game.startNewRound(room.players);

        console.log("================================");
        console.log("NEXT ROUND START SENT");
        console.log("WORD OPTIONS:", roundData.wordOptions);
        console.log("DRAWER:", roundData.drawer.name);
        console.log("SOCKET:", roundData.drawer.socketId);
        console.log("================================");

        io.to(roomCode).emit("canvas_clear");
        io.to(roomCode).emit("round_start", {
            round: roundData.round,
            drawerId: roundData.drawer.id,
            drawerName: roundData.drawer.name,
            drawTime: roundData.drawTime,
        });

        io.to(roundData.drawer.socketId).emit("word_options", {
            wordOptions: roundData.wordOptions,
        });

        console.log(`Next round started in room: ${roomCode}`);
    }, 5000);
}

module.exports = socketHandler;