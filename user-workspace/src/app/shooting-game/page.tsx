"use client";

import React, { useState, useEffect, useRef } from "react";

const TARGET_SIZE = 50;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const GAME_TIME = 30; // seconds

interface Target {
  id: number;
  x: number;
  y: number;
  hit: boolean;
}

export default function ShootingGame() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [gameOver, setGameOver] = useState(false);
  const targetId = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timeLeft === 0) {
      setGameOver(true);
      setTargets([]);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (gameOver) return;

    const spawnTarget = () => {
      const x = Math.random() * (GAME_WIDTH - TARGET_SIZE);
      const y = Math.random() * (GAME_HEIGHT - TARGET_SIZE);
      const newTarget: Target = {
        id: targetId.current++,
        x,
        y,
        hit: false,
      };
      setTargets((prev) => [...prev, newTarget]);
    };

    const spawnInterval = setInterval(() => {
      if (targets.length < 5) {
        spawnTarget();
      }
    }, 1000);

    return () => clearInterval(spawnInterval);
  }, [targets, gameOver]);

  const handleTargetClick = (id: number) => {
    setTargets((prev) =>
      prev.map((target) =>
        target.id === id ? { ...target, hit: true } : target
      )
    );
    setScore((prev) => prev + 1);
  };

  useEffect(() => {
    // Remove hit targets after animation duration
    const cleanup = setTimeout(() => {
      setTargets((prev) => prev.filter((target) => !target.hit));
    }, 500);
    return () => clearTimeout(cleanup);
  }, [targets]);

  const handleRestart = () => {
    setScore(0);
    setTimeLeft(GAME_TIME);
    setGameOver(false);
    setTargets([]);
    targetId.current = 0;
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-white text-black font-sans">
      <h1 className="text-4xl font-bold mb-6">Shooting Game</h1>
      <div
        ref={gameAreaRef}
        className="relative bg-gray-100 border border-black"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        {targets.map((target) => (
          <div
            key={target.id}
            onClick={() => !target.hit && handleTargetClick(target.id)}
            className={
              "absolute bg-black rounded-full cursor-pointer transition-transform duration-300 ease-in-out " +
              (target.hit ? "scale-0 opacity-0" : "scale-100 opacity-100")
            }
            style={{
              width: TARGET_SIZE,
              height: TARGET_SIZE,
              left: target.x,
              top: target.y,
            }}
            role="button"
            aria-label="Target"
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
              if (e.key === "Enter" || e.key === " ") {
                handleTargetClick(target.id);
              }
            }}
          />
        ))}
      </div>
      <div className="mt-4 flex gap-8 text-lg">
        <div>Score: {score}</div>
        <div>Time Left: {timeLeft}s</div>
      </div>
      {gameOver && (
        <div className="mt-6 text-center">
          <p className="text-2xl font-semibold mb-4">Game Over!</p>
          <button
            onClick={handleRestart}
            className="px-4 py-2 border border-black rounded hover:bg-black hover:text-white transition"
          >
            Restart
          </button>
        </div>
      )}
    </main>
  );
}
