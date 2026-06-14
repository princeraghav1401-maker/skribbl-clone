import { useState } from "react";
import { socket } from "../sockets/socket";
import { useNavigate } from "react-router-dom";
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

type CreateRoomResponse = {
  success: boolean;
  roomCode?: string;
  players?: Player[];
  settings?: RoomSettings;
  message?: string;
};

const Home = () => {
  const navigate = useNavigate();

  const [playerName, setPlayerName] = useState("");

  const [roomCode, setRoomCode] = useState(() => {
    const roomFromUrl = new URLSearchParams(window.location.search).get("room");
    return roomFromUrl ? roomFromUrl.toUpperCase() : "";
  });

  const [rounds, setRounds] = useState(3);
  const [drawTime, setDrawTime] = useState(60);
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [wordCount, setWordCount] = useState(3);

  const createRoom = () => {
    if (!playerName.trim()) {
      toast.warning("Please enter your name");
      return;
    }

    const safeRounds = Math.min(Math.max(rounds, 2), 10);
    const safeDrawTime = Math.min(Math.max(drawTime, 15), 240);
    const safeMaxPlayers = Math.min(Math.max(maxPlayers, 2), 20);
    const safeWordCount = Math.min(Math.max(wordCount, 1), 5);

    socket.emit(
      "create_room",
      {
        playerName,
        settings: {
          rounds: safeRounds,
          drawTime: safeDrawTime,
          maxPlayers: safeMaxPlayers,
          wordCount: safeWordCount,
          isPrivate: true,
        },
      },
      (res: CreateRoomResponse) => {
        if (res.success) {
          localStorage.setItem("playerName", playerName);
          localStorage.setItem("roomCode", res.roomCode || "");
          localStorage.setItem("isHost", "true");

          navigate("/lobby", {
            state: {
              roomCode: res.roomCode,
              players: res.players,
              settings: res.settings,
              currentPlayerName: playerName,
              isHost: true,
            },
          });
        } else {
          toast.error(res.message || "Failed to create room");
        }
      }
    );
  };

  const joinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) {
      toast.warning("Please enter name and room code");
      return;
    }

    socket.emit(
      "join_room",
      { playerName, roomCode },
      (res: CreateRoomResponse) => {
        if (res.success) {
          localStorage.setItem("playerName", playerName);
          localStorage.setItem("roomCode", res.roomCode || "");
          localStorage.setItem("isHost", "false");

          navigate("/lobby", {
            state: {
              roomCode: res.roomCode,
              players: res.players,
              settings: res.settings,
              currentPlayerName: playerName,
              isHost: false,
            },
          });
        } else {
          toast.error(res.message || "Failed to join room");
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center overflow-hidden relative py-8">
      <div className="absolute w-[450px] h-[450px] bg-blue-600/20 rounded-full blur-3xl top-[-120px] left-[-120px] animate-pulse" />
      <div className="absolute w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-3xl bottom-[-100px] right-[-80px] animate-pulse" />

      <div className="relative w-[480px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 animate-[fadeIn_0.7s_ease-out]">
        <div className="text-center mb-7">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 animate-bounce">
            🎨
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight">
            Skribbl <span className="text-blue-400">Clone</span>
          </h1>

          <p className="text-gray-300 mt-2 text-sm">
            Real-time multiplayer drawing & guessing game
          </p>
        </div>

        <input
          type="text"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full bg-black/30 border border-white/20 text-white placeholder:text-gray-400 px-4 py-3 rounded-xl mb-4 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/40 transition"
        />

        <input
          type="text"
          placeholder="Enter room code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          className="w-full bg-black/30 border border-white/20 text-white placeholder:text-gray-400 px-4 py-3 rounded-xl mb-4 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/40 transition"
        />

        <div className="bg-black/20 border border-white/10 rounded-2xl p-4 mb-4">
          <h2 className="text-blue-400 font-bold mb-3">Room Settings</h2>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-gray-300">
              Rounds (2-10)
              <input
                type="number"
                min={2}
                max={10}
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
                className="mt-1 w-full bg-black/30 border border-white/20 text-white px-3 py-2 rounded-xl outline-none focus:border-blue-400"
              />
            </label>

            <label className="text-sm text-gray-300">
              Draw Time (15-240s)
              <input
                type="number"
                min={15}
                max={240}
                value={drawTime}
                onChange={(e) => setDrawTime(Number(e.target.value))}
                className="mt-1 w-full bg-black/30 border border-white/20 text-white px-3 py-2 rounded-xl outline-none focus:border-blue-400"
              />
            </label>

            <label className="text-sm text-gray-300">
              Max Players (2-20)
              <input
                type="number"
                min={2}
                max={20}
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="mt-1 w-full bg-black/30 border border-white/20 text-white px-3 py-2 rounded-xl outline-none focus:border-blue-400"
              />
            </label>

            <label className="text-sm text-gray-300">
              Word Count (1-5)
              <input
                type="number"
                min={1}
                max={5}
                value={wordCount}
                onChange={(e) => setWordCount(Number(e.target.value))}
                className="mt-1 w-full bg-black/30 border border-white/20 text-white px-3 py-2 rounded-xl outline-none focus:border-blue-400"
              />
            </label>
          </div>
        </div>

        <button
          onClick={createRoom}
          className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all duration-200 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/30 mb-3"
        >
          Create Room
        </button>

        <button
          onClick={joinRoom}
          className="w-full bg-white text-[#020617] hover:bg-gray-200 active:scale-95 transition-all duration-200 py-3 rounded-xl font-bold"
        >
          Join Room
        </button>
      </div>
    </div>
  );
};

export default Home;