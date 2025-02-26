"use client";
// Background elements with more items for infinite scrolling
const backgroundItems = [
  // Buildings and structures - Layer 1
  { type: "🏯", x: 100, size: 60 },
  { type: "🗼", x: 250, size: 70 },
  { type: "⛩️", x: 450, size: 50 },
  { type: "🏙️", x: 650, size: 80 },
  { type: "🏯", x: 900, size: 65 },
  { type: "⛩️", x: 1100, size: 55 },
  { type: "🏙️", x: 1300, size: 75 },
  { type: "🗼", x: 1500, size: 65 },

  // Cherry blossoms - Layer 2
  { type: "🌸", x: 150, size: 30, top: 30 },
  { type: "🌸", x: 350, size: 20, top: 50 },
  { type: "🌸", x: 550, size: 25, top: 40 },
  { type: "🌸", x: 750, size: 30, top: 35 },
  { type: "🌸", x: 950, size: 20, top: 45 },
  { type: "🌸", x: 1150, size: 25, top: 55 },

  // Clouds - Layer 3 (slowest)
  { type: "☁️", x: 200, size: 40, top: 30 },
  { type: "☁️", x: 400, size: 30, top: 20 },
  { type: "☁️", x: 700, size: 50, top: 40 },
  { type: "☁️", x: 900, size: 35, top: 25 },
  { type: "☁️", x: 1200, size: 45, top: 35 },
  { type: "☁️", x: 1500, size: 30, top: 15 },

  // Trees - Layer 4 (fastest)
  { type: "🌳", x: 150, size: 40 },
  { type: "🌳", x: 300, size: 45 },
  { type: "🌳", x: 500, size: 42 },
  { type: "🌳", x: 700, size: 38 },
  { type: "🌳", x: 900, size: 43 },
  { type: "🌳", x: 1100, size: 40 },
  { type: "🌳", x: 1300, size: 44 },
  { type: "🌳", x: 1500, size: 39 },
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

  // Character states
  const [runnerPosition, setRunnerPosition] = useState<Position>({
    y: 0,
    jumping: false,
    velocity: 0,
  });
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);

  // Game settings
  const gameSpeed = useRef<number>(4); // Slower initial speed
  const gravity: number = 0.5; // Reduced gravity
  const jumpForce: number = 12; // Adjusted jump force
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
    height: 250,
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = (): void => {
      if (gameAreaRef.current) {
        setDimensions({
          width: Math.min(1000, window.innerWidth - 40),
          height: 250,
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
    gameSpeed.current = 5;
  }, [asianGuyFaces]);

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
    // Calculate character's actual position
    const runnerLeft: number = 50; // Runner's left edge x position
    const runnerRight: number = runnerLeft + runnerWidth * 0.7; // Reduce hitbox width
    const runnerBottom: number = dimensions.height - groundHeight;
    const runnerTop: number =
      runnerBottom - runnerHeight * 0.6 + runnerPosition.y; // Adjust hitbox height and account for jump height

    // Visual debug
    const isDebug: boolean = false; // Set to true to debug hitboxes
    if (isDebug && gameAreaRef.current) {
      // Remove old debug elements
      const oldDebug = gameAreaRef.current.querySelector(".debug-hitbox");
      if (oldDebug) {
        oldDebug.remove();
      }

      // Add runner hitbox visualization
      const debugElement = document.createElement("div");
      debugElement.className = "debug-hitbox";
      debugElement.style.position = "absolute";
      debugElement.style.left = `${runnerLeft}px`;
      debugElement.style.bottom = `${runnerBottom - runnerTop}px`;
      debugElement.style.width = `${runnerRight - runnerLeft}px`;
      debugElement.style.height = `${runnerBottom - runnerTop}px`;
      debugElement.style.border = "1px solid red";
      debugElement.style.zIndex = "1000";
      gameAreaRef.current.appendChild(debugElement);
    }

    for (const obstacle of obstacles) {
      // Calculate the actual obstacle hitbox
      const scaleFactor: number = 0.6; // Reduce obstacle hitbox by 40%
      const centerOffset: number = (obstacleWidth * (1 - scaleFactor)) / 2; // Center the smaller hitbox

      const obstacleLeft: number = obstacle.x + centerOffset;
      const obstacleRight: number = obstacle.x + obstacleWidth - centerOffset;
      // Give more generous vertical clearance
      const obstacleTop: number =
        dimensions.height - groundHeight - obstacle.height * 0.7;

      // Visual debug for obstacles
      if (isDebug && gameAreaRef.current) {
        const debugObstacle = document.createElement("div");
        debugObstacle.className = "debug-hitbox";
        debugObstacle.style.position = "absolute";
        debugObstacle.style.left = `${obstacleLeft}px`;
        debugObstacle.style.bottom = `${dimensions.height - obstacleTop}px`;
        debugObstacle.style.width = `${obstacleRight - obstacleLeft}px`;
        debugObstacle.style.height = `${
          obstacleTop - (dimensions.height - groundHeight)
        }px`;
        debugObstacle.style.border = "1px solid blue";
        debugObstacle.style.zIndex = "1000";
        gameAreaRef.current.appendChild(debugObstacle);
      }

      // Improved collision detection with smaller hitboxes
      if (
        runnerRight > obstacleLeft && // Runner right edge past obstacle left edge
        runnerLeft < obstacleRight && // Runner left edge before obstacle right edge
        runnerTop < obstacleTop // Runner top edge above obstacle top (is colliding)
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
    // Random height between 30 and 60
    const height: number = Math.floor(Math.random() * 30) + 30;

    // Random obstacle type
    const obstacleTypes: string[] = Object.keys(obstacleEmojis);
    const type: string =
      obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

    // Random distance between obstacles - make sure there's enough space to jump safely
    const minDistance = Math.max(minObstacleDistance, 200 * gameSpeed.current);
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
  }, [dimensions.width, minObstacleDistance, maxObstacleDistance]);

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
      if (frameCountRef.current % 1000 === 0 && gameSpeed.current < 10) {
        gameSpeed.current += 0.5;
      }

      // Generate new obstacles at a rate that depends on game speed
      const obstacleGenerationRate = Math.max(100 - gameSpeed.current * 5, 50);
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
          background: "linear-gradient(to bottom, #87CEEB 0%, #e0f7fa 100%)",
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
              <p className="text-2xl mb-6">Score: {score}</p>
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
