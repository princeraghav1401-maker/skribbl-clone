import { useState } from "react";

const howToPlaySteps = [
    {
        title: "CHOOSE A WORD!",
        drawing: "✏️ 🖼️ 🏠",
        text: "When it's your turn, choose a word you want to draw!",
    },
    {
        title: "DRAW IT!",
        drawing: "🏠 ✏️",
        text: "Try to draw your chosen word! No spelling!",
    },
    {
        title: "OTHERS GUESS!",
        drawing: "👥 🏠",
        text: "Let other players try to guess your drawn word!",
    },
    {
        title: "GUESS THE WORD!",
        drawing: "🍐 _ _ _ _",
        text: "When it's not your turn, try to guess what others are drawing!",
    },
    {
        title: "WINNER!",
        drawing: "🏆 #1",
        text: "Score the most points and be crowned the winner at the end!",
    },
];

const InfoFooter = () => {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <div className="w-full bg-[#063b9a] text-white py-14 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* About */}
                <div className="bg-blue-900/40 rounded-2xl p-6 shadow-xl">
                    <div className="text-4xl mb-3">❔</div>

                    <h2 className="text-3xl font-bold mb-6 text-center">
                        About
                    </h2>

                    <p className="text-lg leading-relaxed">
                        <span className="font-bold">skribbl.io clone</span> is a free online
                        multiplayer drawing and guessing pictionary game.
                    </p>

                    <p className="text-lg leading-relaxed mt-6">
                        A normal game consists of a few rounds, where every round one player
                        has to draw their chosen word and others have to guess it to gain
                        points.
                    </p>

                    <p className="text-lg leading-relaxed mt-6">
                        The person with the most points at the end of the game will be
                        crowned as the winner. Have fun!
                    </p>
                </div>

                {/* News */}
                <div className="bg-blue-900/40 rounded-2xl p-6 shadow-xl max-h-[470px] overflow-y-auto">
                    <div className="text-4xl mb-3">📰</div>

                    <h2 className="text-3xl font-bold mb-6 text-center">
                        News
                    </h2>

                    <div className="flex justify-between border-b border-white/50 pb-2 mb-4">
                        <h3 className="text-xl font-bold">Fresh paint</h3>
                        <span className="font-bold">2026</span>
                    </div>

                    <p className="text-lg mb-3">Hello!</p>

                    <ul className="list-disc list-inside space-y-2 text-base">
                        <li>Real-time multiplayer drawing</li>
                        <li>Private room invite links</li>
                        <li>Room code based joining</li>
                        <li>
                            Configurable room settings
                            <ul className="list-disc list-inside ml-5 mt-1 space-y-1 text-sm">
                                <li>Rounds from 2–10</li>
                                <li>Draw time from 15–240 seconds</li>
                                <li>Player count from 2–20</li>
                                <li>Words to choose from 1–5</li>
                            </ul>
                        </li>
                        <li>
                            Drawing tools
                            <ul className="list-disc list-inside ml-5 mt-1 space-y-1 text-sm">
                                <li>Brush colors</li>
                                <li>Brush size control</li>
                                <li>Eraser tool</li>
                                <li>Undo button</li>
                                <li>Clear canvas</li>
                            </ul>
                        </li>
                        <li>General chat system</li>
                        <li>Guessing and scoring system</li>
                        <li>Hint reveal over time</li>
                        <li>Leaderboard and winner screen</li>
                    </ul>

                    <p className="mt-6 text-lg">
                        Hope you enjoy it!
                    </p>
                </div>

                {/* How to Play */}
                <div className="bg-blue-900/40 rounded-2xl p-6 shadow-xl text-center">
                    <div className="text-4xl mb-3 text-left">🖍️</div>

                    <h2 className="text-3xl font-bold mb-6">
                        How to play
                    </h2>

                    <div className="min-h-[260px] flex flex-col items-center justify-center">
                        <h3 className="text-4xl font-extrabold mb-6 tracking-wide">
                            {howToPlaySteps[activeStep].title}
                        </h3>

                        <div className="text-7xl mb-6">
                            {howToPlaySteps[activeStep].drawing}
                        </div>

                        <p className="text-lg leading-relaxed max-w-[300px]">
                            {howToPlaySteps[activeStep].text}
                        </p>
                    </div>

                    <div className="flex justify-center gap-3 mt-6">
                        {howToPlaySteps.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveStep(index)}
                                className={`w-4 h-4 rounded-full transition ${activeStep === index
                                        ? "bg-white"
                                        : "bg-white/30 hover:bg-white/60"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="text-center mt-10 text-white/80 text-sm">
                <div className="flex justify-center gap-4 underline mb-2">
                    <span>Contact</span>
                    <span>Terms of Service</span>
                    <span>Credits</span>
                    <span>Privacy Settings</span>
                </div>

                <p>
                    This is a student project inspired by skribbl.io for internship assignment purposes.
                </p>
            </div>
        </div>
    );
};

export default InfoFooter;