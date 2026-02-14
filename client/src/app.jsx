import React, { useState, useEffect } from "react";
import { socket } from "./socket";

const generateUser = () => ({
  color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 60%)`,
  id: Math.random().toString(36).substr(2, 9),
});

const GRID_SIZE = 20;

function App() {
  const [grid, setGrid] = useState(Array(GRID_SIZE * GRID_SIZE).fill(null));
  const [onlineCount, setOnlineCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [user] = useState(generateUser());

  useEffect(() => {
    socket.on("init", (initialGrid) => setGrid(initialGrid));

    socket.on("pixel_update", ({ index, color, owner }) => {
      setGrid((prev) => {
        const newGrid = [...prev];
        newGrid[index] = { color, owner };
        return newGrid;
      });
    });

    socket.on("leaderboard_update", (topPlayers) => setLeaderboard(topPlayers));
    socket.on("online_count", (count) => setOnlineCount(count));

    return () => {
      socket.off("init");
      socket.off("pixel_update");
      socket.off("leaderboard_update");
      socket.off("online_count");
    };
  }, []);

  const handleCapture = (index) => {
    socket.emit("capture", { index, color: user.color });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 h-screen flex flex-col md:flex-row items-center justify-center gap-8">
        <div className="w-full md:w-80 flex flex-col gap-6 order-2 md:order-1">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
              PixelWars
            </h1>
            <div className="flex items-center gap-2 mt-2 text-slate-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {onlineCount} Players Online
            </div>

            <div className="mt-6 flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
              <div
                className="w-8 h-8 rounded-md shadow-inner"
                style={{ backgroundColor: user.color }}
              ></div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">
                  Your Color
                </p>
                <p className="text-sm font-mono font-bold text-white">PLAYER</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl flex-1 max-h-[400px] overflow-y-auto">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Top Conquerors
            </h2>
            <div className="space-y-3">
              {leaderboard.length === 0 ? (
                <p className="text-slate-600 text-sm italic">Map is empty...</p>
              ) : (
                leaderboard.map((player, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono text-sm w-4 ${
                          i < 3 ? "text-yellow-400" : "text-slate-500"
                        }`}
                      >
                        #{i + 1}
                      </span>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: player.color }}
                      ></div>
                      <span className="text-sm text-slate-200">
                        {player.id === socket.id
                          ? "YOU"
                          : `...${player.id.substr(0, 5)}`}
                      </span>
                    </div>
                    <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-slate-300">
                      {player.score} px
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="order-1 md:order-2">
          <div
            className="grid gap-px bg-slate-900 border border-white/10 p-2 rounded-xl shadow-2xl relative"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              width: "min(90vw, 650px)",
              height: "min(90vw, 650px)",
              boxShadow: "0 0 50px -12px rgba(124, 58, 237, 0.25)",
            }}
          >
            {grid.map((cell, index) => {
              const isLocked = cell && Date.now() - cell.capturedAt > 5000;

              return (
                <button
                  key={index}
                  onMouseDown={() => {
                    setIsPainting(true);
                    handleCapture(index);
                  }}
                  onMouseUp={() => setIsPainting(false)}
                  onMouseEnter={() => isPainting && handleCapture(index)}
                  className={`w-full h-full rounded-sm transition-all duration-200 focus:outline-none relative overflow-hidden ${
                    isLocked
                      ? "cursor-not-allowed opacity-80"
                      : "hover:brightness-125 cursor-pointer"
                  }`}
                  style={{
                    backgroundColor: cell ? cell.color : "#1e293b",

                    border: isLocked
                      ? "2px solid rgba(255, 215, 0, 0.5)"
                      : "none",
                  }}
                >
                  {isLocked && (
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] opacity-50">
                      🔒
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-center mt-4 text-slate-500 text-xs">
            Tip: Click and drag to capture multiple blocks
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
