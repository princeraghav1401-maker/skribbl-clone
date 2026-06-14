import { useEffect, useState } from "react";

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

type Hotkeys = {
    brush: string;
    eraser: string;
    undo: string;
    clear: string;
    chat: string;
};

const defaultHotkeys: Hotkeys = {
    brush: "b",
    eraser: "e",
    undo: "u",
    clear: "c",
    chat: "Enter",
};

const GameSettings = ({ isOpen, onClose }: Props) => {
    const [volume, setVolume] = useState(() => {
        return Number(localStorage.getItem("volume") || 100);
    });

    const [hotkeys, setHotkeys] = useState<Hotkeys>(() => {
        const saved = localStorage.getItem("hotkeys");
        return saved ? JSON.parse(saved) : defaultHotkeys;
    });

    const [editingKey, setEditingKey] = useState<keyof Hotkeys | null>(null);

    const [mobileKeyboard, setMobileKeyboard] = useState(
        localStorage.getItem("mobileKeyboard") || "Disabled"
    );

    const [keyboardLanguage, setKeyboardLanguage] = useState(
        localStorage.getItem("keyboardLanguage") || "English"
    );

    const [chatInputLayout, setChatInputLayout] = useState(
        localStorage.getItem("chatInputLayout") || "Bottom"
    );

    const [brushPressure, setBrushPressure] = useState(
        localStorage.getItem("brushPressure") || "Off"
    );

    const [chatBubbles, setChatBubbles] = useState(
        localStorage.getItem("chatBubbles") || "Enabled"
    );

    useEffect(() => {
        localStorage.setItem("volume", String(volume));
    }, [volume]);

    useEffect(() => {
        localStorage.setItem("hotkeys", JSON.stringify(hotkeys));
    }, [hotkeys]);

    useEffect(() => {
        localStorage.setItem("mobileKeyboard", mobileKeyboard);
        localStorage.setItem("keyboardLanguage", keyboardLanguage);
        localStorage.setItem("chatInputLayout", chatInputLayout);
        localStorage.setItem("brushPressure", brushPressure);
        localStorage.setItem("chatBubbles", chatBubbles);
    }, [
        mobileKeyboard,
        keyboardLanguage,
        chatInputLayout,
        brushPressure,
        chatBubbles,
    ]);

    const captureKey = (
        e: React.KeyboardEvent<HTMLInputElement>,
        keyName: keyof Hotkeys
    ) => {
        e.preventDefault();

        let pressedKey = e.key;

        if (pressedKey === " ") pressedKey = "Space";

        setHotkeys((prev) => ({
            ...prev,
            [keyName]: pressedKey,
        }));

        setEditingKey(null);
    };

    const resetHotkeys = () => {
        setHotkeys(defaultHotkeys);
    };

    if (!isOpen) return null;

    return (
           <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 py-6 overflow-hidden">
            <div className="w-full max-w-[680px] max-h-[92vh] overflow-y-auto bg-[#233f93] rounded-3xl shadow-2xl p-6 md:p-8 border border-white/20">

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-4xl font-extrabold text-white">
                            Settings
                        </h2>
                        <p className="text-white/70 mt-1 text-sm">
                            Customize controls and gameplay preferences
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/10 text-white text-4xl font-bold hover:bg-red-500/30 hover:text-red-200 transition"
                    >
                        ×
                    </button>
                </div>

                <div className="bg-white/10 border border-white/10 rounded-2xl p-5 mb-8">
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="text-3xl font-bold text-white">
                            📜 Hotkeys
                        </h3>

                        <button
                            onClick={resetHotkeys}
                            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl font-bold transition"
                        >
                            Reset
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {[
                            ["brush", "Brush"],
                            ["eraser", "Eraser"],
                            ["undo", "Undo"],
                            ["clear", "Clear"],
                            ["chat", "Chat"],
                        ].map(([key, label]) => {
                            const hotkeyName = key as keyof Hotkeys;

                            return (
                                <div key={key}>
                                    <p className="text-white mb-2 font-semibold text-sm">
                                        {label}
                                    </p>

                                    <input
                                        value={
                                            editingKey === hotkeyName
                                                ? "Press key..."
                                                : hotkeys[hotkeyName]
                                        }
                                        readOnly
                                        onClick={() => setEditingKey(hotkeyName)}
                                        onKeyDown={(e) =>
                                            captureKey(e, hotkeyName)
                                        }
                                        className="w-full px-3 py-3 rounded-xl text-black font-bold cursor-pointer outline-none border-2 border-transparent focus:border-cyan-400"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white/10 border border-white/10 rounded-2xl p-5">
                    <h3 className="text-3xl font-bold mb-5 text-white">
                        ❔ Miscellaneous
                    </h3>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-white mb-2 font-semibold">
                                Mobile Keyboard (Experimental)
                            </label>

                            <select
                                value={mobileKeyboard}
                                onChange={(e) =>
                                    setMobileKeyboard(e.target.value)
                                }
                                className="w-full px-4 py-3 rounded-xl text-black text-lg font-semibold outline-none"
                            >
                                <option>Disabled</option>
                                <option>Enabled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-white mb-2 font-semibold">
                                Mobile Keyboard Language Layout
                            </label>

                            <select
                                value={keyboardLanguage}
                                onChange={(e) =>
                                    setKeyboardLanguage(e.target.value)
                                }
                                className="w-full px-4 py-3 rounded-xl text-black text-lg font-semibold outline-none"
                            >
                                <option>English</option>
                                <option>Hindi</option>
                                <option>German</option>
                                <option>Spanish</option>
                                <option>French</option>
                                <option>Japanese</option>
                                <option>Korean</option>
                                <option>Russian</option>
                                <option>Portuguese</option>
                                <option>Italian</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-white mb-2 font-semibold">
                                Mobile Chat Input Layout
                            </label>

                            <select
                                value={chatInputLayout}
                                onChange={(e) =>
                                    setChatInputLayout(e.target.value)
                                }
                                className="w-full px-4 py-3 rounded-xl text-black text-lg font-semibold outline-none"
                            >
                                <option>Bottom</option>
                                <option>Top</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-white mb-2 font-semibold">
                                Brush Pressure Sensitivity
                            </label>

                            <select
                                value={brushPressure}
                                onChange={(e) =>
                                    setBrushPressure(e.target.value)
                                }
                                className="w-full px-4 py-3 rounded-xl text-black text-lg font-semibold outline-none"
                            >
                                <option>On</option>
                                <option>Off</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-white mb-2 font-semibold">
                                Mobile Chat Bubbles
                            </label>

                            <select
                                value={chatBubbles}
                                onChange={(e) => setChatBubbles(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl text-black text-lg font-semibold outline-none"
                            >
                                <option>Enabled</option>
                                <option>Disabled</option>
                            </select>

                            <p className="text-white/60 text-xs mt-2">
                                Controls chat message bubbles on drawing board.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameSettings;