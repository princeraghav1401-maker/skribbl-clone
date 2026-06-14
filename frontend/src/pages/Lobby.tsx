import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../sockets/socket";
import InfoFooter from "../components/InfoFooter";
import { toast } from "react-toastify";

type Player = {
    id: string;
    name: string;
    socketId: string;
    score: number;
    isHost: boolean;
    hasGuessed: boolean;
};

type RoomSettings = {
    rounds: number;
    drawTime: number;
    maxPlayers: number;
    wordCount: number;
    isPrivate: boolean;
};

const Lobby = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { roomCode, players, isHost, settings } =
        (location.state as {
            roomCode: string;
            players: Player[];
            isHost: boolean;
            settings?: RoomSettings;
        }) || {};

    const [playersList, setPlayersList] = useState<Player[]>(players || []);

    useEffect(() => {
        socket.on("player_joined", (data) => {
            setPlayersList(data.players);
        });

        socket.on("player_left", (data) => {
            setPlayersList(data.players);
        });

        socket.on("round_start", (data) => {
            if (!isHost) {
                navigate("/game", {
                    state: {
                        roomCode,
                        players: playersList,
                        isHost,
                        initialRoundData: data,
                    },
                });
            }
        });

        return () => {
            socket.off("player_joined");
            socket.off("player_left");
            socket.off("round_start");
        };
    }, [navigate, roomCode, playersList, isHost]);

    const [language, setLanguage] = useState("English");

    const languages = [
        "English",
        "German",
        "Bulgarian",
        "Czech",
        "Danish",
        "Dutch",
        "Finnish",
        "French",
        "Estonian",
        "Greek",
        "Hebrew",
        "Hungarian",
        "Italian",
        "Japanese",
        "Korean",
        "Latvian",
        "Macedonian",
        "Norwegian",
        "Portuguese",
        "Polish",
        "Romanian",
        "Russian",
        "Serbian",
        "Slovakian",
        "Spanish",
        "Swedish",
        "Tagalog",
        "Turkish",
    ];

    const startGame = () => {
        socket.emit(
            "start_game",
            { roomCode },
            (res: {
                success: boolean;
                message?: string;
                initialRoundData?: {
                    round: number;
                    drawerId: string;
                    drawerName: string;
                    drawTime: number;
                    wordOptions?: string[];
                };
            }) => {
                if (!res.success) {
                    toast.error(res.message || "Failed to start game");
                    return;
                }

                navigate("/game", {
                    state: {
                        roomCode,
                        players: playersList,
                        isHost,
                        initialRoundData: res.initialRoundData,
                    },
                });
            }
        );
    };

    const leaveRoom = () => {
        localStorage.clear();
        navigate("/");
    };

    const copyRoomCode = async () => {
        await navigator.clipboard.writeText(roomCode);
        toast.success("Room code copied!");
    };

    const copyInviteLink = async () => {
        const link = `${window.location.origin}/?room=${roomCode}`;
        await navigator.clipboard.writeText(link);
        toast.success("Invite link copied!");
    };

    return (
        <div className="bg-[#020617] text-white min-h-screen">
            <div className="min-h-screen flex items-center justify-center py-10 px-4">
                <div className="w-[560px] bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
                    <h1 className="text-3xl font-bold text-blue-400 mb-6">
                        Game Lobby
                    </h1>

                    <div className="bg-black/30 rounded-xl p-4 mb-4">
                        <span className="inline-block mb-3 bg-green-600/20 text-green-400 border border-green-500/40 px-3 py-1 rounded-full text-sm font-bold">
                            Private Room
                        </span>

                        <p className="text-gray-300">Room Code</p>

                        <h2 className="text-4xl font-extrabold tracking-widest">
                            {roomCode}
                        </h2>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <button
                                onClick={copyRoomCode}
                                className="bg-blue-600 hover:bg-blue-700 py-2 rounded-xl font-bold"
                            >
                                Copy Code
                            </button>

                            <button
                                onClick={copyInviteLink}
                                className="bg-white text-[#020617] hover:bg-gray-200 py-2 rounded-xl font-bold"
                            >
                                Copy Link
                            </button>
                        </div>
                    </div>

                    {settings && (
                        <div className="grid grid-cols-2 gap-3 bg-black/20 rounded-xl p-4 mb-6">
                            <div>
                                <p className="text-gray-400 text-sm">Rounds</p>
                                <p className="font-bold">{settings.rounds}</p>
                            </div>

                            <div>
                                <p className="text-gray-400 text-sm">Draw Time</p>
                                <p className="font-bold">{settings.drawTime}s</p>
                            </div>

                            <div>
                                <p className="text-gray-400 text-sm">Max Players</p>
                                <p className="font-bold">{settings.maxPlayers}</p>
                            </div>

                            <div>
                                <p className="text-gray-400 text-sm">Word Count</p>
                                <p className="font-bold">{settings.wordCount}</p>
                            </div>
                        </div>
                    )}

                    <div className="bg-black/20 rounded-xl p-4 mb-6">
                        <label className="block text-gray-300 text-sm mb-2">
                            Language
                        </label>

                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full bg-white text-[#020617] px-4 py-3 rounded-xl outline-none font-semibold"
                        >
                            {languages.map((lang) => (
                                <option key={lang} value={lang}>
                                    {lang}
                                </option>
                            ))}
                        </select>
                    </div>

                    <h2 className="text-xl font-semibold mb-3">
                        Players ({playersList.length})
                    </h2>

                    <div className="space-y-3">
                        {playersList.map((player) => (
                            <div
                                key={player.id}
                                className="bg-black/30 border border-white/10 p-3 rounded-xl flex justify-between items-center"
                            >
                                <span>{player.name}</span>

                                {player.isHost && (
                                    <span className="text-blue-400 font-bold">
                                        Host
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {isHost && (
                        <button
                            onClick={startGame}
                            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold"
                        >
                            Start Game
                        </button>
                    )}

                    <button
                        onClick={leaveRoom}
                        className="w-full mt-3 bg-red-600 hover:bg-red-700 py-3 rounded-xl font-bold"
                    >
                        Leave Room
                    </button>
                </div>
            </div>

            <InfoFooter />
        </div>
    );
};

export default Lobby;