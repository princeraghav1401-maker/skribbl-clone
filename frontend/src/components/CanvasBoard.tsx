import { useEffect, useRef, useState } from "react";
import { socket } from "../sockets/socket";

type Props = {
    roomCode: string;
    isDrawer: boolean;
};

type Point = {
    x: number;
    y: number;
    color: string;
    size: number;
};

type Stroke = Point[];

type DrawData = {
    type: "start" | "move" | "end";
    stroke?: Point;
};

const CanvasBoard = ({ roomCode, isDrawer }: Props) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDrawing = useRef(false);

    const strokesRef = useRef<Stroke[]>([]);
    const currentStrokeRef = useRef<Stroke>([]);

    const [color, setColor] = useState("#000000");
    const [size, setSize] = useState(4);
    const [isEraser, setIsEraser] = useState(false);

    const getContext = () => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        return canvas.getContext("2d");
    };

    const clearLocalCanvas = () => {
        const ctx = getContext();
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const drawPoint = (point: Point) => {
        const ctx = getContext();
        if (!ctx) return;

        ctx.fillStyle = point.color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fill();
    };

    const redrawCanvas = () => {
        clearLocalCanvas();

        strokesRef.current.forEach((stroke) => {
            stroke.forEach((point) => {
                drawPoint(point);
            });
        });
    };

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            color: isEraser ? "#ffffff" : color,
            size: isEraser ? size + 8 : size,
        };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawer) return;

        isDrawing.current = true;

        const point = getMousePos(e);
        currentStrokeRef.current = [point];

        drawPoint(point);

        socket.emit("draw_start", {
            roomCode,
            stroke: point,
        });
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawer) return;
        if (!isDrawing.current) return;

        const point = getMousePos(e);

        currentStrokeRef.current.push(point);
        drawPoint(point);

        socket.emit("draw_move", {
            roomCode,
            stroke: point,
        });
    };

    const stopDrawing = () => {
        if (!isDrawer) return;
        if (!isDrawing.current) return;

        isDrawing.current = false;

        if (currentStrokeRef.current.length > 0) {
            strokesRef.current.push(currentStrokeRef.current);
            currentStrokeRef.current = [];
        }

        socket.emit("draw_end", {
            roomCode,
        });
    };

    const undoCanvas = () => {
        if (!isDrawer) return;

        strokesRef.current.pop();
        redrawCanvas();

        socket.emit("draw_undo", {
            roomCode,
        });
    };

    const clearCanvas = () => {
        if (!isDrawer) return;

        strokesRef.current = [];
        currentStrokeRef.current = [];

        clearLocalCanvas();

        socket.emit("canvas_clear", {
            roomCode,
        });
    };

    useEffect(() => {
        const handleDrawData = (data: DrawData) => {
            if (!data.stroke) return;

            if (data.type === "start") {
                currentStrokeRef.current = [data.stroke];
                drawPoint(data.stroke);
            }

            if (data.type === "move") {
                currentStrokeRef.current.push(data.stroke);
                drawPoint(data.stroke);
            }

            if (data.type === "end") {
                if (currentStrokeRef.current.length > 0) {
                    strokesRef.current.push(currentStrokeRef.current);
                    currentStrokeRef.current = [];
                }
            }
        };

        const handleCanvasClear = () => {
            strokesRef.current = [];
            currentStrokeRef.current = [];
            clearLocalCanvas();
        };

        const handleDrawUndo = () => {
            strokesRef.current.pop();
            redrawCanvas();
        };

        socket.on("draw_data", handleDrawData);
        socket.on("canvas_clear", handleCanvasClear);
        socket.on("draw_undo", handleDrawUndo);

        return () => {
            socket.off("draw_data", handleDrawData);
            socket.off("canvas_clear", handleCanvasClear);
            socket.off("draw_undo", handleDrawUndo);
        };
    }, []);

    return (
        <div className="bg-white rounded-2xl p-4 relative  overflow-x-auto">
            <div className="flex gap-4 mb-4 items-center flex-wrap">
                {isDrawer ? (
                    <>
                        <input
                            type="color"
                            value={color}
                            disabled={isEraser}
                            onChange={(e) => setColor(e.target.value)}
                        />

                        <input
                            type="range"
                            min="2"
                            max="20"
                            value={size}
                            onChange={(e) => setSize(Number(e.target.value))}
                        />

                        <button
                            onClick={() => setIsEraser(false)}
                            className={`px-4 py-2 rounded-xl font-bold text-white ${!isEraser
                                    ? "bg-blue-600"
                                    : "bg-gray-500 hover:bg-gray-600"
                                }`}
                        >
                            Pen
                        </button>

                        <button
                            onClick={() => setIsEraser(true)}
                            className={`px-4 py-2 rounded-xl font-bold text-white ${isEraser
                                    ? "bg-purple-700"
                                    : "bg-purple-600 hover:bg-purple-700"
                                }`}
                        >
                            Eraser
                        </button>

                        <button
                            onClick={undoCanvas}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl font-bold"
                        >
                            Undo
                        </button>

                        <button
                            onClick={clearCanvas}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold"
                        >
                            Clear
                        </button>
                    </>
                ) : (
                    <p className="text-gray-600 font-semibold">
                        Waiting for drawer to draw...
                    </p>
                )}
            </div>

            <canvas
                ref={canvasRef}
                width={600}
                height={420}
                className={`border border-gray-300 rounded-xl bg-white ${isDrawer
                        ? isEraser
                            ? "cursor-cell"
                            : "cursor-crosshair"
                        : "cursor-not-allowed"
                    }`}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
            />
        </div>
    );
};

export default CanvasBoard;