"use client";
interface DifficultyLevel {
  name: string;
  initialSpeed: number;
  speedIncrease: number;
  obstacleFrequency: number;
  maxSpeed: number;
  jumpForce: number;
  gravity: number;
  obstacleTypes: string[];
  backgroundColor: string;
  description: string;
}

const difficultyLevels: DifficultyLevel[] = [
  {
    name: "Easy",
    initialSpeed: 4,
    speedIncrease: 0.3,
    obstacleFrequency: 100,
    maxSpeed: 8,
    jumpForce: 12,
    gravity: 0.5,
    obstacleTypes: ["boba", "dumpling", "sushi"],
    backgroundColor: "linear-gradient(to bottom, #87CEEB 0%, #e0f7fa 100%)",
    description: "Slower obstacles and bigger jumps. Perfect for beginners!",
  },
  {
    name: "Medium",
    initialSpeed: 5,
    speedIncrease: 0.4,
    obstacleFrequency: 80,
    maxSpeed: 10,
    jumpForce: 12,
    gravity: 0.55,
    obstacleTypes: ["boba", "ramen", "dumpling", "sushi", "takoyaki"],
    backgroundColor: "linear-gradient(to bottom, #ffb347 0%, #ffcc33 100%)",
    description: "Balanced gameplay with all obstacle types. A good challenge!",
  },
  {
    name: "Asian",
    initialSpeed: 6,
    speedIncrease: 0.5,
    obstacleFrequency: 60,
    maxSpeed: 12,
    jumpForce: 12,
    gravity: 0.6,
    obstacleTypes: ["ramen", "takoyaki"],
    backgroundColor: "linear-gradient(to bottom, #ff7e5f 0%, #feb47b 100%)",
    description:
      "Fast-paced with harder obstacles. Only for the elite runners!",
  },
];

// Current difficulty level
// Default to Medium  // Background elements with more items for infinite scrolling
const backgroundItems = [
  // Buildings and structures - Layer 1
  { type: "🏯", x: 100, size: 80 },
  { type: "🗼", x: 250, size: 90 },
  { type: "⛩️", x: 450, size: 70 },
  { type: "🏙️", x: 650, size: 100 },
  { type: "🏯", x: 900, size: 85 },
  { type: "⛩️", x: 1100, size: 75 },
  { type: "🏙️", x: 1300, size: 95 },
  { type: "🗼", x: 1500, size: 85 },

  // Cherry blossoms - Layer 2
  { type: "🌸", x: 150, size: 40, top: 80 },
  { type: "🌸", x: 350, size: 30, top: 120 },
  { type: "🌸", x: 550, size: 35, top: 90 },
  { type: "🌸", x: 750, size: 45, top: 150 },
  { type: "🌸", x: 950, size: 30, top: 110 },
  { type: "🌸", x: 1150, size: 40, top: 140 },

  // Clouds - Layer 3 (slowest)
  { type: "☁️", x: 200, size: 60, top: 200 },
  { type: "☁️", x: 400, size: 50, top: 180 },
  { type: "☁️", x: 700, size: 70, top: 220 },
  { type: "☁️", x: 900, size: 55, top: 160 },
  { type: "☁️", x: 1200, size: 65, top: 190 },
  { type: "☁️", x: 1500, size: 50, top: 170 },

  // Trees - Layer 4 (fastest)
  { type: "🌳", x: 150, size: 60 },
  { type: "🌳", x: 300, size: 65 },
  { type: "🌳", x: 500, size: 62 },
  { type: "🌳", x: 700, size: 58 },
  { type: "🌳", x: 900, size: 63 },
  { type: "🌳", x: 1100, size: 60 },
  { type: "🌳", x: 1300, size: 64 },
  { type: "🌳", x: 1500, size: 59 },
];
import React, { useState, useEffect, useRef, useCallback } from "react";

// TypeScript interfaces
interface Position {
  y: number;
  jumping: boolean;
  velocity: number;
}

interface Obstacle {
  x: number;
  height: number;
  type: string;
}

interface Dimensions {
  width: number;
  height: number;
}

const AsianGuyRunner: React.FC = () => {
  // Game states
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [currentDifficulty, setCurrentDifficulty] = useState<number>(1);

  // Character states
  const [runnerPosition, setRunnerPosition] = useState<Position>({
    y: 0,
    jumping: false,
    velocity: 0,
  });
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);

  // Game settings
  const gameSpeed = useRef<number>(
    difficultyLevels[currentDifficulty].initialSpeed
  );
  const gravity: number = difficultyLevels[currentDifficulty].gravity;
  const jumpForce: number = difficultyLevels[currentDifficulty].jumpForce;
  const runnerHeight: number = 60;
  const runnerWidth: number = 40;
  const groundHeight: number = 24;
  const obstacleWidth: number = 30;
  const minObstacleDistance: number = 600; // Increased minimum distance
  const maxObstacleDistance: number = 1200; // Increased maximum distance

  const gameLoopRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);
  const gameAreaRef = useRef<HTMLDivElement | null>(null);

  // Asian guy expressions
  const asianGuyFaces: string[] = ["😁", "😆", "😅", "😂", "🤣", "😊", "😎"];
  const [currentFace, setCurrentFace] = useState<string>("😎");
  const jumpFace: string = "😱";
  const deadFace: string = "😵";

  // Obstacle types
  const obstacleEmojis: Record<string, string> = {
    boba: "🧋",
    ramen: "🍜",
    dumpling: "🥟",
    takoyaki: "🐙",
    sushi: "🍣",
  };

  // Initialize the game area dimensions
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 1000,
    height: 350,
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = (): void => {
      if (gameAreaRef.current) {
        setDimensions({
          width: Math.min(1000, window.innerWidth - 40),
          height: 350,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Initialize runner position
  useEffect(() => {
    setRunnerPosition({
      y: 0,
      jumping: false,
      velocity: 0,
    });
  }, [dimensions.height]);

  // Reset game
  const resetGame = useCallback((): void => {
    setGameOver(false);
    setScore(0);
    setObstacles([]);
    setRunnerPosition({
      y: 0,
      jumping: false,
      velocity: 0,
    });
    setCurrentFace(
      asianGuyFaces[Math.floor(Math.random() * asianGuyFaces.length)]
    );
    frameCountRef.current = 0;
    gameSpeed.current = difficultyLevels[currentDifficulty].initialSpeed;
  }, [asianGuyFaces, currentDifficulty]);

  // Jump function
  const jump = useCallback((): void => {
    if (!runnerPosition.jumping && !gameOver) {
      setRunnerPosition((prev) => ({
        ...prev,
        jumping: true,
        velocity: jumpForce,
      }));
      setCurrentFace(jumpFace);

      // Debug - log jump height for testing
      const maxJumpHeight = (jumpForce * jumpForce) / (2 * gravity);
      console.log(`Jump height: ${maxJumpHeight}`);
    }
  }, [runnerPosition.jumping, gameOver, jumpForce, gravity]);

  // Handle keyboard and touch events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.code === "Space" || e.key === "ArrowUp") && !gameOver) {
        if (!gameStarted) {
          setGameStarted(true);
        } else {
          jump();
        }
        e.preventDefault();
      } else if (e.key === "Enter" && gameOver) {
        resetGame();
        setGameStarted(true);
      }
    };

    const handleTouchStart = (): void => {
      if (!gameOver) {
        if (!gameStarted) {
          setGameStarted(true);
        } else {
          jump();
        }
      } else {
        resetGame();
        setGameStarted(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    if (gameAreaRef.current) {
      gameAreaRef.current.addEventListener("touchstart", handleTouchStart);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (gameAreaRef.current) {
        gameAreaRef.current.removeEventListener("touchstart", handleTouchStart);
      }
    };
  }, [gameStarted, gameOver, jump, resetGame]);

  // Check for collisions
  const checkCollision = useCallback((): boolean => {
    // Get the runner's bounding box - with a bit smaller hitbox for fairness
    const runnerLeft: number = 50; // x position of runner
    const runnerRight: number = runnerLeft + runnerWidth * 0.6; // slightly smaller hitbox width
    const runnerTop: number =
      dimensions.height - groundHeight - runnerHeight + runnerPosition.y + 15; // Adjusted to account for the visible character
    const runnerBottom: number = dimensions.height - groundHeight - 6; // Slightly raised from ground

    // Debug rendering of hitbox
    const isDebug: boolean = false;
    if (isDebug && gameAreaRef.current) {
      // Remove old debug elements
      const oldDebug = gameAreaRef.current.querySelector(
        ".debug-hitbox-runner"
      );
      if (oldDebug) {
        oldDebug.remove();
      }

      // Add runner hitbox visualization
      const debugElement = document.createElement("div");
      debugElement.className = "debug-hitbox-runner";
      debugElement.style.position = "absolute";
      debugElement.style.left = `${runnerLeft}px`;
      debugElement.style.top = `${runnerTop}px`;
      debugElement.style.width = `${runnerRight - runnerLeft}px`;
      debugElement.style.height = `${runnerBottom - runnerTop}px`;
      debugElement.style.border = "2px solid red";
      debugElement.style.zIndex = "100";
      gameAreaRef.current.appendChild(debugElement);
    }

    for (const obstacle of obstacles) {
      // Calculate the actual obstacle hitbox - with slight adjustments for fairness
      const obstacleLeft: number = obstacle.x + 5; // Smaller hitbox than visual
      const obstacleRight: number = obstacle.x + obstacleWidth - 5;
      // Make the hitbox height appropriate for the emoji
      const obstacleTop: number =
        dimensions.height - groundHeight - obstacle.height + 5;
      const obstacleBottom: number = dimensions.height - groundHeight - 5;

      // Debug rendering of obstacle hitbox
      if (isDebug && gameAreaRef.current) {
        const obstacleDebug = document.createElement("div");
        obstacleDebug.className = "debug-hitbox-obstacle";
        obstacleDebug.style.position = "absolute";
        obstacleDebug.style.left = `${obstacleLeft}px`;
        obstacleDebug.style.top = `${obstacleTop}px`;
        obstacleDebug.style.width = `${obstacleRight - obstacleLeft}px`;
        obstacleDebug.style.height = `${obstacleBottom - obstacleTop}px`;
        obstacleDebug.style.border = "2px solid blue";
        obstacleDebug.style.zIndex = "100";
        gameAreaRef.current.appendChild(obstacleDebug);
      }

      // AABB Collision detection (Axis-Aligned Bounding Box)
      if (
        runnerRight > obstacleLeft && // Runner's right edge is past obstacle's left edge
        runnerLeft < obstacleRight && // Runner's left edge is before obstacle's right edge
        runnerBottom > obstacleTop && // Runner's bottom edge is below obstacle's top edge
        runnerTop < obstacleBottom // Runner's top edge is above obstacle's bottom edge
      ) {
        return true;
      }
    }

    return false;
  }, [
    obstacles,
    runnerPosition.y,
    dimensions.height,
    runnerHeight,
    runnerWidth,
    groundHeight,
    obstacleWidth,
  ]);

  // Generate new obstacles
  const generateObstacle = useCallback((): void => {
    // Get available obstacle types from current difficulty
    const availableTypes = difficultyLevels[currentDifficulty].obstacleTypes;
    const type: string =
      availableTypes[Math.floor(Math.random() * availableTypes.length)];

    // Random height between 30 and 60 - higher on harder difficulties
    const heightBonus = currentDifficulty * 5;
    const height: number = Math.floor(Math.random() * 30) + 30 + heightBonus;

    // Random distance between obstacles - shorter on harder difficulties
    const distanceReduction = currentDifficulty * 50;
    const minDistance = Math.max(
      minObstacleDistance - distanceReduction,
      200 * gameSpeed.current
    );
    const distance: number = Math.floor(
      Math.random() * (maxObstacleDistance - minDistance) + minDistance
    );

    // Don't allow obstacles to be too close together based on current game speed
    const minSpaceBetween = 120 + gameSpeed.current * 10;

    setObstacles((prev) => {
      // If there's already an obstacle close to where we'd put the new one, don't add it
      const lastObstacle = prev[prev.length - 1];
      if (lastObstacle && dimensions.width - lastObstacle.x < minSpaceBetween) {
        return prev;
      }

      return [
        ...prev,
        {
          x: dimensions.width + distance,
          height,
          type,
        },
      ];
    });
  }, [
    dimensions.width,
    minObstacleDistance,
    maxObstacleDistance,
    currentDifficulty,
  ]);

  // Game loop
  useEffect(() => {
    if (!gameStarted) return;

    const gameLoop = (): void => {
      frameCountRef.current += 1;

      // Update score
      if (frameCountRef.current % 6 === 0) {
        setScore((prev) => prev + 1);
      }

      // Increase game speed gradually but cap it
      const currentDifficultySettings = difficultyLevels[currentDifficulty];
      if (
        frameCountRef.current % 1000 === 0 &&
        gameSpeed.current < currentDifficultySettings.maxSpeed
      ) {
        gameSpeed.current += currentDifficultySettings.speedIncrease;
      }

      // Generate new obstacles at a rate that depends on game speed and difficulty
      const obstacleGenerationRate = Math.max(
        currentDifficultySettings.obstacleFrequency - gameSpeed.current * 5,
        30
      );
      if (
        frameCountRef.current % Math.floor(obstacleGenerationRate) === 0 ||
        obstacles.length === 0
      ) {
        generateObstacle();
      }

      // Update obstacles position
      setObstacles((prev) =>
        prev
          .filter((obstacle) => obstacle.x > -obstacleWidth)
          .map((obstacle) => ({
            ...obstacle,
            x: obstacle.x - gameSpeed.current,
          }))
      );

      // Update runner position (jumping physics)
      setRunnerPosition((prev) => {
        // If the runner is on the ground and not jumping
        if (prev.y === 0 && !prev.jumping) {
          return prev;
        }

        let velocity: number = prev.velocity;
        let y: number = prev.y + velocity;
        velocity -= gravity;

        // If runner lands on ground
        if (y <= 0) {
          y = 0;
          velocity = 0;

          // Change face back to running face when landing
          if (prev.jumping) {
            setCurrentFace(
              asianGuyFaces[Math.floor(Math.random() * asianGuyFaces.length)]
            );
          }

          return { y, jumping: false, velocity };
        }

        return { y, jumping: true, velocity };
      });

      // Check for collision
      if (checkCollision()) {
        setGameOver(true);
        setCurrentFace(deadFace);
        setHighScore((prev) => Math.max(prev, score));
        return;
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [
    gameStarted,
    gameOver,
    generateObstacle,
    checkCollision,
    score,
    obstacles.length,
    asianGuyFaces,
    gravity,
    currentDifficulty,
  ]);

  // Handle game over
  useEffect(() => {
    if (gameOver && gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  }, [gameOver]);

  // Runner animation (running)
  const [runnerFrame, setRunnerFrame] = useState<number>(0);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      // Change expression occasionally while running
      const faceInterval = setInterval(() => {
        if (!runnerPosition.jumping) {
          setCurrentFace(
            asianGuyFaces[Math.floor(Math.random() * asianGuyFaces.length)]
          );
        }
      }, 3000);

      // Running animation
      const animationInterval = setInterval(() => {
        setRunnerFrame((prev) => (prev === 0 ? 1 : 0));
      }, 100);

      return () => {
        clearInterval(animationInterval);
        clearInterval(faceInterval);
      };
    }
  }, [gameStarted, gameOver, runnerPosition.jumping, asianGuyFaces]);

  // Draw game elements
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className="mb-4 flex justify-between w-full"
        style={{ maxWidth: dimensions.width }}
      >
        <div className="text-lg font-bold">Score: {score}</div>
        <div className="text-lg">High Score: {highScore}</div>
      </div>

      <div
        ref={gameAreaRef}
        className="border-2 border-gray-300 rounded-md relative overflow-hidden"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          background: difficultyLevels[currentDifficulty].backgroundColor,
        }}
      >
        {/* Background Elements with different layers for parallax */}
        {backgroundItems.map((item, index) => {
          // Determine speed based on item type - closer items move faster
          let speedMultiplier = 1.0;
          let zIndex = 2;

          if (
            item.type === "🏯" ||
            item.type === "🗼" ||
            item.type === "⛩️" ||
            item.type === "🏙️"
          ) {
            speedMultiplier = 2.0; // Buildings move faster
            zIndex = 2;
          } else if (item.type === "🌳") {
            speedMultiplier = 3.0; // Trees move even faster
            zIndex = 4; // Trees are in front
          } else if (item.type === "☁️") {
            speedMultiplier = 0.6; // Clouds move slower
            zIndex = 1; // Clouds are furthest back
          } else if (item.type === "🌸") {
            speedMultiplier = 1.5; // Cherry blossoms move at medium speed
            zIndex = 3; // Cherry blossoms are in middle
          }

          // Calculate position with proper wrapping
          const baseX = item.x;
          const movement =
            (score * speedMultiplier * gameSpeed.current) %
            (dimensions.width * 3);
          let positionX = baseX - movement;

          // If item has moved off-screen to the left, wrap it around (but make it invisible during transition)
          const isWrapping = positionX < -100;
          if (isWrapping) {
            positionX += dimensions.width * 3;
          }

          return (
            <div
              key={`bg-${index}`}
              className="absolute text-center"
              style={{
                left: `${positionX}px`,
                bottom: item.top
                  ? dimensions.height - item.top - item.size
                  : groundHeight,
                fontSize: `${item.size}px`,
                opacity: isWrapping ? 0 : item.type === "☁️" ? 0.8 : 1,
                transition: isWrapping
                  ? "none"
                  : "left 0.1s linear, opacity 0.3s ease",
                zIndex: zIndex,
              }}
            >
              {item.type}
            </div>
          );
        })}
        {/* Game elements */}

        {/* Ground */}
        <div
          className="absolute bottom-0 w-full border-t-2 border-gray-400"
          style={{
            height: groundHeight,
            background: "linear-gradient(to bottom, #8B4513 0%, #A0522D 100%)",
            zIndex: 20, // Ground should be in front of everything
          }}
        >
          {/* Ground texture */}
          <div
            className="absolute w-full h-4 bottom-0"
            style={{
              background:
                "linear-gradient(to bottom, #A0522D 0%, #8B4513 100%)",
            }}
          ></div>

          {/* Ground details - small grass tufts */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`grass-${i}`}
              className="absolute bottom-3"
              style={{
                left: `${i * 5}%`,
                fontSize: "8px",
                color: "#228B22",
              }}
            >
              ᐱ
            </div>
          ))}
        </div>

        {/* Asian Guy Runner */}
        <div
          className="absolute left-12 flex flex-col items-center justify-center"
          style={{
            bottom: groundHeight + runnerPosition.y,
            width: runnerWidth,
            height: runnerHeight,
            transition: runnerPosition.jumping ? "none" : "bottom 0.1s",
            zIndex: 15, // Make sure runner is in front of everything
          }}
        >
          {/* Face */}
          <div className="text-4xl z-10 transform translate-y-2">
            {currentFace}
          </div>

          {/* Body */}
          <div className="relative">
            {/* Shirt */}
            <div className="bg-blue-500 w-8 h-10 rounded-t-md rounded-b-sm relative">
              {/* Arms */}
              {runnerPosition.jumping ? (
                <>
                  <div className="absolute -left-4 top-0 w-4 h-2 bg-blue-500 rounded-l-md"></div>
                  <div className="absolute -right-4 top-0 w-4 h-2 bg-blue-500 rounded-r-md"></div>
                </>
              ) : runnerFrame === 0 ? (
                <>
                  <div className="absolute -left-3 top-2 w-3 h-2 bg-blue-500 rounded-l-md"></div>
                  <div className="absolute -right-3 top-1 w-3 h-2 bg-blue-500 rounded-r-md"></div>
                </>
              ) : (
                <>
                  <div className="absolute -left-3 top-1 w-3 h-2 bg-blue-500 rounded-l-md"></div>
                  <div className="absolute -right-3 top-2 w-3 h-2 bg-blue-500 rounded-r-md"></div>
                </>
              )}
            </div>

            {/* Legs */}
            <div className="flex justify-between -mt-0">
              {runnerPosition.jumping ? (
                <>
                  <div className="w-3 h-6 bg-gray-700 rounded-b-md ml-1 transform translate-y-0"></div>
                  <div className="w-3 h-6 bg-gray-700 rounded-b-md mr-1 transform translate-y-0"></div>
                </>
              ) : runnerFrame === 0 ? (
                <>
                  <div className="w-3 h-6 bg-gray-700 rounded-b-md ml-1 transform -rotate-15 translate-y-0"></div>
                  <div className="w-3 h-6 bg-gray-700 rounded-b-md mr-1 transform rotate-15 translate-y-0"></div>
                </>
              ) : (
                <>
                  <div className="w-3 h-6 bg-gray-700 rounded-b-md ml-1 transform rotate-15 translate-y-0"></div>
                  <div className="w-3 h-6 bg-gray-700 rounded-b-md mr-1 transform -rotate-15 translate-y-0"></div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Obstacles - Food Items */}
        {obstacles.map((obstacle, index) => (
          <div
            key={index}
            className="absolute bottom-0 flex flex-col items-center justify-center"
            style={{
              left: obstacle.x,
              width: obstacleWidth,
              height: obstacle.height + groundHeight,
              zIndex: 10, // Ensure food is above all background elements
            }}
          >
            <div
              className="text-4xl"
              style={{
                marginBottom: groundHeight,
                fontSize: `${Math.max(40, obstacle.height)}px`,
              }}
            >
              {obstacleEmojis[obstacle.type]}
            </div>
          </div>
        ))}

        {/* Game messages */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center bg-white bg-opacity-80 p-6 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold text-gray-700 mb-4">
                ASIAN GUY RUNNER 🏃‍♂️
              </h2>

              {/* Difficulty Selection */}
              <div className="mb-6">
                <p className="mb-2 text-lg">Select Difficulty:</p>
                <div className="flex justify-center gap-3">
                  {difficultyLevels.map((level, index) => (
                    <button
                      key={index}
                      className={`px-4 py-2 rounded-md ${
                        currentDifficulty === index
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                      onClick={() => setCurrentDifficulty(index)}
                    >
                      {level.name}
                    </button>
                  ))}
                </div>
                <p className="text-sm mt-2 text-gray-500">
                  {difficultyLevels[currentDifficulty].description}
                </p>
              </div>

              <p className="mb-2 text-lg">
                Press SPACE, UP ARROW or TAP to start and jump
              </p>
              <p className="mb-2 text-lg">Avoid the flying Asian foods!</p>
              <div className="text-5xl mt-6 animate-bounce">👆</div>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <h2 className="text-3xl font-bold text-gray-700 mb-4">
                GAME OVER
              </h2>
              <p className="text-6xl mb-4">{deadFace}</p>
              <p className="text-xl mb-2">You got hit by Asian food!</p>
              <p className="text-2xl mb-4">Score: {score}</p>
              <p className="text-md mb-6">
                Difficulty: {difficultyLevels[currentDifficulty].name}
              </p>

              {/* Difficulty Selection for Retry */}
              <div className="mb-6">
                <p className="mb-2">Change Difficulty:</p>
                <div className="flex justify-center gap-2">
                  {difficultyLevels.map((level, index) => (
                    <button
                      key={index}
                      className={`px-3 py-1 rounded-md text-sm ${
                        currentDifficulty === index
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                      onClick={() => setCurrentDifficulty(index)}
                    >
                      {level.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="bg-blue-500 text-white px-6 py-3 text-lg rounded-lg hover:bg-blue-600 transition-colors"
                onClick={() => {
                  resetGame();
                  setGameStarted(true);
                }}
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className="mt-4 text-sm text-gray-600 text-center"
        style={{ maxWidth: dimensions.width }}
      >
        <p className="mb-1">
          Use SPACE or UP ARROW key to jump, or tap the game area on mobile
          devices.
        </p>
        <p>Avoid the flying boba tea, ramen, dumplings, takoyaki, and sushi!</p>
      </div>
    </div>
  );
};

export default AsianGuyRunner;
