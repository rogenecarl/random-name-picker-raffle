"use client";

import { useEffect } from "react";

interface WinnerDialogProps {
  winner: string | null;
  onClose: () => void;
}

export function WinnerDialog({ winner, onClose }: WinnerDialogProps) {
  useEffect(() => {
    if (winner) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [winner]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (winner) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [winner, onClose]);

  if (!winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Confetti effect - decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ["#06b6d4", "#0891b2", "#0e7490", "#155e75", "#0d9488"][i % 5],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
              opacity: 0.8,
            }}
          />
        ))}
      </div>

      {/* Dialog content */}
      <div className="relative z-10 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 mx-4 max-w-2xl w-full text-center shadow-2xl">
        {/* Winner label - BIG */}
        <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-700 mb-4 sm:mb-6 uppercase tracking-widest">
          Winner
        </p>

        {/* Winner name - HUGE */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-slate-800 mb-6 sm:mb-8 w-full text-center break-words px-2">
          {winner}
        </h1>

        {/* Congratulations text - BIG */}
        <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-500 mb-6 sm:mb-8">
          Congratulations!
        </p>

        {/* Close button */}
        <button
          onClick={onClose}
          className="px-10 sm:px-12 md:px-14 py-4 sm:py-5 bg-cyan-700 hover:bg-cyan-800 text-white text-lg sm:text-xl md:text-2xl font-bold rounded-2xl transition-all hover:scale-105 shadow-lg shadow-cyan-700/25"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
