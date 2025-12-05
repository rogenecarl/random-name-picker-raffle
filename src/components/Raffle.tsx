"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Sheet } from "./Sheet";
import { WinnerDialog } from "./WinnerDialog";
import {
  getParticipants,
  addParticipants,
  deleteParticipant,
  clearAllParticipants,
  drawWinner,
} from "@/lib/actions";

interface Participant {
  id: number;
  name: string;
}

export function Raffle() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [namesInput, setNamesInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<string | null>(null);
  const [addMessage, setAddMessage] = useState<string | null>(null);
  const [drawDuration, setDrawDuration] = useState(3); // Duration in seconds
  const drawIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const idleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchParticipants = useCallback(async () => {
    const data = await getParticipants();
    setParticipants(data);
  }, []);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  // Idle shuffling - show random names when not drawing
  useEffect(() => {
    if (participants.length > 0 && !isDrawing && !showWinnerDialog) {
      // Start idle shuffle with unbiased randomness
      idleIntervalRef.current = setInterval(() => {
        const randomArray = new Uint32Array(1);
        crypto.getRandomValues(randomArray);
        const randomIndex = randomArray[0] % participants.length;
        setDisplayName(participants[randomIndex].name);
      }, 500);
    } else if (participants.length === 0) {
      setDisplayName(null);
    }

    return () => {
      if (idleIntervalRef.current) {
        clearInterval(idleIntervalRef.current);
      }
    };
  }, [participants, isDrawing, showWinnerDialog]);

  const handleAddNames = async () => {
    if (!namesInput.trim()) return;

    setIsLoading(true);
    setAddMessage(null);
    try {
      const result = await addParticipants(namesInput);

      if (result.error) {
        setAddMessage(result.error);
      } else {
        setNamesInput("");
        if (result.skipped && result.skipped > 0) {
          setAddMessage(`Added ${result.count} name${result.count !== 1 ? "s" : ""}. ${result.skipped} duplicate${result.skipped !== 1 ? "s" : ""} skipped.`);
        } else {
          setAddMessage(`Added ${result.count} name${result.count !== 1 ? "s" : ""}.`);
        }
        await fetchParticipants();

        // Clear message after 3 seconds
        setTimeout(() => setAddMessage(null), 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteParticipant = async (id: number) => {
    await deleteParticipant(id);
    await fetchParticipants();
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to remove all participants?")) return;
    await clearAllParticipants();
    await fetchParticipants();
  };

  const handleDraw = async () => {
    if (participants.length === 0) return;

    // Stop idle shuffle
    if (idleIntervalRef.current) {
      clearInterval(idleIntervalRef.current);
    }

    setIsDrawing(true);

    // Fast shuffle animation based on user-defined duration
    const intervalMs = 60; // Time between each name change
    const totalIterations = Math.floor((drawDuration * 1000) / intervalMs);
    let count = 0;
    const shuffleNames = [...participants];

    drawIntervalRef.current = setInterval(() => {
      // Use crypto.getRandomValues for unbiased randomness
      const randomArray = new Uint32Array(1);
      crypto.getRandomValues(randomArray);
      const randomIndex = randomArray[0] % shuffleNames.length;
      setDisplayName(shuffleNames[randomIndex].name);
      count++;

      if (count >= totalIterations) {
        if (drawIntervalRef.current) {
          clearInterval(drawIntervalRef.current);
        }
        performDraw();
      }
    }, intervalMs);
  };

  const performDraw = async () => {
    try {
      const result = await drawWinner();

      if (result.winner) {
        setDisplayName(result.winner);
        setCurrentWinner(result.winner);
        setShowWinnerDialog(true);
        await fetchParticipants();
      }
    } finally {
      setIsDrawing(false);
    }
  };

  const handleCloseWinnerDialog = () => {
    setShowWinnerDialog(false);
    setCurrentWinner(null);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Dual Gradient Overlay Background */}
      <div
        className="absolute inset-0 z-0 bg-white"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
            radial-gradient(circle 500px at 0% 20%, rgba(139,92,246,0.3), transparent),
            radial-gradient(circle 500px at 100% 0%, rgba(59,130,246,0.3), transparent)
          `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
        }}
      />
      {/* Header with hamburger menu */}
      <header className="fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between px-4 sm:px-6 h-16 sm:h-20">
          <button
            onClick={() => setIsSheetOpen(true)}
            className="p-2 sm:p-3 hover:bg-violet-50 rounded-xl transition-colors"
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6 sm:w-7 sm:h-7 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-cyan-700">
            CFC - Raffle
          </h1>
          <div className="w-10 sm:w-12" />
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center pt-20 sm:pt-24 px-4 sm:px-6">
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl py-8">
          {participants.length === 0 ? (
            /* Empty state */
            <div className="text-center">
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-8 rounded-full bg-violet-50 flex items-center justify-center">
                <svg
                  className="w-12 h-12 md:w-16 md:h-16 text-violet-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-700 mb-4">
                No Participants
              </h2>
              <p className="text-xl text-gray-500 mb-8">
                Add names to start the raffle
              </p>
              <button
                onClick={() => setIsSheetOpen(true)}
                className="px-8 py-4 bg-cyan-700 hover:bg-cyan-800 text-white text-xl font-bold rounded-2xl transition-all hover:scale-105 shadow-lg shadow-cyan-700/25"
              >
                Add Participants
              </button>
            </div>
          ) : (
            /* Raffle display */
            <div className="text-center w-full">
              {/* Name display - HUGE */}
              <div className="mb-8 md:mb-12 min-h-[150px] sm:min-h-[200px] md:min-h-[250px] flex items-center justify-center w-full">
                <h1
                  className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black transition-all duration-75 w-full text-center break-words px-2 ${
                    isDrawing
                      ? "text-cyan-700"
                      : "text-gray-800"
                  }`}
                >
                  {displayName || "?"}
                </h1>
              </div>

              {/* Draw button - BIG */}
              <button
                onClick={handleDraw}
                disabled={isDrawing || participants.length === 0}
                className={`px-10 sm:px-14 md:px-16 py-4 sm:py-5 md:py-6 text-xl sm:text-2xl md:text-3xl font-bold rounded-2xl md:rounded-3xl transition-all shadow-xl ${
                  isDrawing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-cyan-700 hover:bg-cyan-800 text-white hover:scale-105 hover:shadow-2xl shadow-cyan-700/25"
                }`}
              >
                {isDrawing ? "DRAWING..." : "DRAW"}
              </button>

              {/* Participant count */}
              <p className="mt-6 sm:mt-8 text-lg sm:text-xl md:text-2xl font-semibold text-gray-500">
                {participants.length} participant{participants.length !== 1 ? "s" : ""} remaining
              </p>
            </div>
          )}
        </div>

              </main>

      {/* Sheet for managing participants */}
      <Sheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
        <div className="p-6 space-y-6">
          {/* Add names section */}
          <div>
            <label className="block text-lg font-bold mb-3">
              Add Participants
            </label>
            <textarea
              value={namesInput}
              onChange={(e) => setNamesInput(e.target.value)}
              placeholder="Enter names (one per line)"
              className="w-full h-32 p-4 text-lg border-2 border-gray-200 rounded-xl bg-white resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <button
              onClick={handleAddNames}
              disabled={isLoading || !namesInput.trim()}
              className="mt-3 w-full py-4 bg-cyan-700 hover:bg-cyan-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-lg font-bold rounded-xl transition-all"
            >
              {isLoading ? "Adding..." : "Add Names"}
            </button>
            {addMessage && (
              <p className={`mt-2 text-sm font-medium ${addMessage.includes("error") || addMessage.includes("exist") ? "text-red-500" : "text-green-600"}`}>
                {addMessage}
              </p>
            )}
          </div>

          {/* Drawing duration setting */}
          <div>
            <label className="block text-lg font-bold mb-3">
              Drawing Duration
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={30}
                value={drawDuration}
                onChange={(e) => setDrawDuration(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                className="w-24 p-3 text-lg text-center border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <span className="text-lg text-gray-600">seconds</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              How long the names shuffle before revealing the winner (1-30 seconds)
            </p>
          </div>

          {/* Current participants list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">
                Participants ({participants.length})
              </h3>
              {participants.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm font-semibold text-red-500 hover:text-red-600"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Search input */}
            {participants.length > 0 && (
              <div className="relative mb-3">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search participants..."
                  className="w-full pl-10 pr-4 py-3 text-base border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {participants.length === 0 ? (
              <p className="text-lg text-zinc-500 py-8 text-center">
                No participants added yet
              </p>
            ) : (
              <>
                {participants.filter((p) =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 ? (
                  <p className="text-base text-zinc-500 py-6 text-center">
                    No participants found for "{searchQuery}"
                  </p>
                ) : (
                  <ul className="space-y-2 max-h-64 overflow-auto">
                    {participants
                      .filter((p) =>
                        p.name.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((p) => (
                        <li
                          key={p.id}
                          className="flex items-center justify-between p-4 bg-violet-50/50 hover:bg-violet-100/50 rounded-xl group transition-colors"
                        >
                          <span className="text-lg font-medium truncate">{p.name}</span>
                          <button
                            onClick={() => handleDeleteParticipant(p.id)}
                            className="p-2 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            aria-label={`Remove ${p.name}`}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </Sheet>

      {/* Winner Dialog */}
      <WinnerDialog
        winner={showWinnerDialog ? currentWinner : null}
        onClose={handleCloseWinnerDialog}
      />
    </div>
  );
}
