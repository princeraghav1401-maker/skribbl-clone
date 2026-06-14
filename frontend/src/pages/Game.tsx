import { useEffect, useState } from "react";
import { socket } from "../sockets/socket";
import CanvasBoard from "../components/CanvasBoard";
import { useLocation, useNavigate } from "react-router-dom";
import GameSettings from "../components/GameSettings";
import { toast } from "react-toastify";

type Player = {
    id: string;
    name: string;
    socketId: string;
    score: number;
    isHost: boolean;
    hasGuessed: boolean;
};

type Message = {
    type?: "guess" | "chat";
    playerName: string;
    guess?: string;
    text?: string;
    correct?: boolean;
    message?: string;
    score?: number;
    leaderboard?: Player[];
};

type RoundStartData = {
    round: number;
    drawerId: string;
    drawerName: string;
    drawTime: number;
    wordOptions?: string[];
};



const Game = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { roomCode, initialRoundData } =
        (location.state as {
            roomCode: string;
            initialRoundData?: RoundStartData;
        }) || {};

    const [round, setRound] = useState(initialRoundData?.round || 0);
    const [drawerId, setDrawerId] = useState(initialRoundData?.drawerId || "");
    const [drawerName, setDrawerName] = useState(
        initialRoundData?.drawerName || ""
    );
    const [timer, setTimer] = useState(initialRoundData?.drawTime || 0);

    const [wordOptions, setWordOptions] = useState<string[]>(
        initialRoundData?.wordOptions || []
    );

    const [hint, setHint] = useState("");
    const [drawerWord, setDrawerWord] = useState("");
    const [guess, setGuess] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [leaderboard, setLeaderboard] = useState<Player[]>([]);

    const isDrawer = socket.id === drawerId;

    const [showSettings, setShowSettings] = useState(false);

    const leaveGame = () => {
        localStorage.clear();
        navigate("/");
    };

    useEffect(() => {
        const handleRoundStart = (data: RoundStartData) => {
            setRound(data.round);
            setDrawerId(data.drawerId);
            setDrawerName(data.drawerName);
            setTimer(data.drawTime);
            setWordOptions([]);
            setHint("");
            setDrawerWord("");
            setMessages([]);
        };

        const handleWordSelected = (data: { hint: string }) => {
            setHint(data.hint);
            setWordOptions([]);
        };
        const handleDrawerWord = (data: { word: string }) => {
            setDrawerWord(data.word);
        };
       

        const handleWordOptions = (data: { wordOptions: string[] }) => {
            console.log("WORD OPTIONS RECEIVED:", data.wordOptions);
            setWordOptions(data.wordOptions);
        };

        const handleTimerUpdate = (data: { timeLeft: number; hint?: string }) => {
            setTimer(data.timeLeft);

            if (data.hint) {
                setHint(data.hint);
            }
        };

        const handleGuessResult = (data: Message) => {
            setMessages((prev) => [...prev, data]);

            if (data.leaderboard) {
                setLeaderboard(data.leaderboard);
            }

            if (
                data.correct &&
                data.playerName === localStorage.getItem("playerName")
            ) {
                toast.success(" You guessed correctly!");
            }
        };

        const handleChatMessage = (data: {
            playerId: string;
            playerName: string;
            text: string;
        }) => {
            setMessages((prev) => [
                ...prev,
                {
                    type: "chat",
                    playerName: data.playerName,
                    text: data.text,
                },
            ]);
        };

        const handleRoundEnd = (data: { word: string; leaderboard: Player[] }) => {
            setLeaderboard(data.leaderboard);

            toast.info(`Round Ended! Word was: ${data.word}`, {
                autoClose: 4000,
            });
        };

        const handleGameOver = (data: { winner: Player; leaderboard: Player[] }) => {

            console.log("GAME OVER RECEIVED:", data);
            toast.success(`🏆 Winner: ${data.winner.name}`);

            setTimeout(() => {
                navigate("/result", {
                    state: {
                        winner: data.winner,
                        leaderboard: data.leaderboard,
                    },
                });
            }, 1500);
        };

        socket.on("round_start", handleRoundStart);
        socket.on("word_selected", handleWordSelected);
        socket.on("word_options", handleWordOptions);
        socket.on("timer_update", handleTimerUpdate);
        socket.on("guess_result", handleGuessResult);
        socket.on("round_end", handleRoundEnd);
        socket.on("game_over", handleGameOver);
        socket.on("chat_message", handleChatMessage);
        socket.on("drawer_word", handleDrawerWord);
       

        return () => {
            socket.off("round_start", handleRoundStart);
            socket.off("word_selected", handleWordSelected);
            socket.off("word_options", handleWordOptions);
            socket.off("timer_update", handleTimerUpdate);
            socket.off("guess_result", handleGuessResult);
            socket.off("round_end", handleRoundEnd);
            socket.off("game_over", handleGameOver);
            socket.off("chat_message", handleChatMessage);
            socket.off("drawer_word", handleDrawerWord);
        };
    }, [navigate]);

    const chooseWord = (word: string) => {
        socket.emit(
            "word_chosen",
            { roomCode, word },
            (res: { success: boolean; message?: string }) => {
                if (!res.success) {
                    toast.error(res.message || "Failed to choose word");
                }
            }
        );
    };

    const sendGuess = () => {
        if (!guess.trim()) return;

        socket.emit(
            "guess",
            { roomCode, guess },
            (res: { success: boolean; message?: string }) => {
                if (!res.success) {
                    toast.error(res.message || "Failed to send guess");
                }
            }
        );

        setGuess("");
    };

    const sendChat = () => {
        if (!guess.trim()) return;

        socket.emit(
            "chat",
            {
                roomCode,
                text: guess,
            },
            (res: { success: boolean; message?: string }) => {
                if (!res.success) {
                    toast.error(res.message || "Failed to send chat");
                }
            }
        );

        setGuess("");
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-blue-400">
                        Room {roomCode}
                    </h1>

                    <div className="text-xl font-bold">Round {round}</div>

                    <div className="text-xl font-bold text-yellow-400">⏳ {timer}s</div>

                    <button
                        onClick={leaveGame}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl font-bold"
                    >
                        Leave Game
                    </button>

                    <button
                        onClick={() => setShowSettings(true)}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl text-2xl"
                    >
                        ⚙️
                    </button>
                </div>

                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 mb-6">
                    <p>
                        Drawer:
                        <span className="ml-2 text-blue-400 font-bold">{drawerName}</span>
                        {isDrawer && (
                            <span className="ml-3 text-green-400 font-bold">(You)</span>
                        )}
                    </p>

                    <h2 className="text-3xl mt-3 tracking-widest font-bold">
                        {isDrawer && drawerWord
                            ? `Your word: ${drawerWord}`
                            : hint || "Waiting for word..."}
                    </h2>
                </div>

                {isDrawer && wordOptions.length > 0 && (
                    <div className="bg-black/30 p-5 rounded-2xl mb-6">
                        <h2 className="mb-4 font-bold text-xl">Choose a Word</h2>

                        <div className="flex gap-4">
                            {wordOptions.map((word) => (
                                <button
                                    key={word}
                                    onClick={() => chooseWord(word)}
                                    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold"
                                >
                                    {word}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 game-grid">
                    <div className="col-span-3 bg-white/10 border border-white/20 rounded-2xl p-4">
                        <h2 className="text-xl font-bold text-blue-400 mb-4">
                            Leaderboard
                        </h2>

                        {leaderboard.length === 0 ? (
                            <p className="text-gray-400">No scores yet</p>
                        ) : (
                            leaderboard.map((player, index) => (
                                <div
                                    key={player.id}
                                    className="flex justify-between bg-black/30 p-3 rounded-xl mb-2"
                                >
                                    <span>
                                        #{index + 1} {player.name}
                                    </span>
                                    <span className="font-bold">{player.score}</span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="lg:col-span-6 game-panel">
                        <CanvasBoard roomCode={roomCode} isDrawer={isDrawer} />
                    </div>

                    <div className="col-span-3 bg-white/10 border border-white/20 rounded-2xl p-4">
                        <h2 className="text-xl font-bold text-blue-400 mb-3">Chat</h2>

                        <div className="h-[170px] overflow-y-auto bg-black/20 rounded-xl p-3 mb-4">
                            {messages
                                .filter((msg) => msg.type === "chat")
                                .map((msg, index) => (
                                    <div key={index} className="mb-2 text-sm text-cyan-300">
                                        💬 <span className="font-bold">{msg.playerName}</span>:{" "}
                                        {msg.text}
                                    </div>
                                ))}
                        </div>

                        <h2 className="text-xl font-bold text-blue-400 mb-3">
                            Guesses
                        </h2>

                        <div className="h-[170px] overflow-y-auto bg-black/20 rounded-xl p-3 mb-4">
                            {messages
                                .filter((msg) => msg.type !== "chat")
                                .map((msg, index) => (
                                    <div key={index} className="mb-2 text-sm">
                                        {msg.correct ? (
                                            <span className="text-green-400 font-bold">
                                                {msg.message || `${msg.playerName} guessed the word! ✅`}
                                            </span>
                                        ) : (
                                            <>
                                                <span className="font-bold">{msg.playerName}</span>:{" "}
                                                {msg.guess}
                                            </>
                                        )}
                                    </div>
                                ))}
                        </div>

                        {!isDrawer ? (
                            <div className="flex gap-2">
                                <input
                                    value={guess}
                                    onChange={(e) => setGuess(e.target.value)}
                                    placeholder="Type guess or chat..."
                                    className="flex-1 px-3 py-2 rounded-xl text-black"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") sendGuess();
                                    }}
                                />

                                <button
                                    onClick={sendGuess}
                                    className="bg-blue-600 hover:bg-blue-700 px-4 rounded-xl font-bold"
                                >
                                    Guess
                                </button>

                                <button
                                    onClick={sendChat}
                                    className="bg-white text-black hover:bg-gray-200 px-4 rounded-xl font-bold"
                                >
                                    Chat
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex gap-2">
                                    <input
                                        value={guess}
                                        onChange={(e) => setGuess(e.target.value)}
                                        placeholder="Type chat..."
                                        className="flex-1 px-3 py-2 rounded-xl text-black"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") sendChat();
                                        }}
                                    />

                                    <button
                                        onClick={sendChat}
                                        className="bg-white text-black hover:bg-gray-200 px-4 rounded-xl font-bold"
                                    >
                                        Chat
                                    </button>
                                </div>

                                <p className="text-gray-400 text-xs mt-2">
                                    You are drawing. Guessing is disabled.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <GameSettings
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />
        </div>
    );
};

export default Game;