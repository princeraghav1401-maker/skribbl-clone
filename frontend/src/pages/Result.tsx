import { useLocation, useNavigate } from "react-router-dom";

type Player = {
    id: string;
    name: string;
    score: number;
};

const Result = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { winner, leaderboard } =
        (location.state as {
            winner?: Player;
            leaderboard?: Player[];
        }) || {};

    return (
        <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center overflow-hidden relative">
            <div className="absolute w-[450px] h-[450px] bg-blue-600/20 rounded-full blur-3xl top-[-120px] left-[-120px]" />
            <div className="absolute w-[350px] h-[350px] bg-yellow-400/10 rounded-full blur-3xl bottom-[-100px] right-[-80px]" />

            <div className="relative w-[560px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
                <div className="text-6xl mb-4">🏆</div>

                <h1 className="text-4xl font-extrabold text-yellow-400 mb-3">
                    Game Over
                </h1>

                <p className="text-gray-300 mb-6">Final leaderboard is ready</p>

                <div className="bg-black/30 rounded-2xl p-5 mb-6">
                    <p className="text-gray-400">Winner</p>
                    <h2 className="text-3xl font-bold text-blue-400 mt-1">
                        {winner?.name || "No winner"}
                    </h2>
                </div>

                <div className="space-y-3 mb-6">
                    {leaderboard?.map((player, index) => (
                        <div
                            key={player.id}
                            className="flex justify-between items-center bg-black/30 border border-white/10 rounded-xl p-4"
                        >
                            <span className="font-bold">
                                #{index + 1} {player.name}
                            </span>
                            <span className="text-yellow-400 font-bold">
                                {player.score} pts
                            </span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => {
                        localStorage.clear();
                        navigate("/");
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 transition py-3 rounded-xl font-bold"
                >
                    Play Again
                </button>
            </div>
        </div>
    );
};

export default Result;