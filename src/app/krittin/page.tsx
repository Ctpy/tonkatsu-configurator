import React, { useState, useEffect, useCallback, useMemo } from "react";

interface DetectionPoint {
  x: number;
  y: number;
  strength: number;
  age: number;
  detected: boolean;
  foodIcon: string;
}

interface RadarHistory {
  angle: number;
}

// Food emoji collection
const foodIcons = [
  "🍕",
  "🍔",
  "🍟",
  "🌭",
  "🍿",
  "🥓",
  "🥞",
  "🍳",
  "🧀",
  "🥪",
  "🌮",
  "🌯",
  "🥙",
  "🍗",
  "🍖",
  "🥩",
  "🍤",
  "🍝",
  "🍜",
  "🍲",
  "🍣",
  "🍱",
  "🥟",
  "🍚",
  "🍘",
  "🍥",
  "🥮",
  "🍡",
  "🍦",
  "🍧",
  "🍨",
  "🍩",
  "🍪",
  "🎂",
  "🍰",
  "🧁",
  "🥧",
  "🍫",
  "🍬",
  "🍭",
  "🍮",
  "🍯",
  "🍎",
  "🍏",
  "🍊",
  "🍋",
  "🍌",
  "🍉",
  "🍇",
  "🍓",
  "🍈",
  "🍒",
  "🍑",
  "🥭",
  "🍍",
  "🥝",
];

const SonarRadar: React.FC = () => {
  const [angle, setAngle] = useState<number>(0);
  const [detectionPoints, setDetectionPoints] = useState<DetectionPoint[]>([]);
  const [radarHistory, setRadarHistory] = useState<RadarHistory[]>([]);

  // Constants for radar display
  const size: number = 400;
  const centerX: number = size / 2;
  const centerY: number = size / 2;
  const maxRadius: number = size * 0.45;
  const lineLength: number = maxRadius * 0.9;

  // Generate a random detection point - memoized to avoid recreating in loops
  const generateRandomPoint = useCallback((): DetectionPoint => {
    const randomRadius: number = Math.random() * maxRadius * 0.9; // Keep away from edges
    const randomAngle: number = Math.random() * 2 * Math.PI;
    const x: number = centerX + randomRadius * Math.cos(randomAngle);
    const y: number = centerY + randomRadius * Math.sin(randomAngle);
    const strength: number = 0.3 + Math.random() * 0.7; // Stronger signals for better visibility
    const randomFoodIndex = Math.floor(Math.random() * foodIcons.length);

    return {
      x,
      y,
      strength,
      age: 0,
      detected: false,
      foodIcon: foodIcons[randomFoodIndex],
    };
  }, [maxRadius, centerX, centerY]);

  // Initialize with fewer random points for better performance
  useEffect(() => {
    const points: DetectionPoint[] = Array(8)
      .fill(null)
      .map(() => generateRandomPoint());
    setDetectionPoints(points);

    // Update radar with a smoother animation rate
    const intervalId: number = window.setInterval(() => {
      setAngle((prevAngle) => (prevAngle + 2) % 360);
    }, 40);

    // Generate new points less frequently for better performance
    const newPointsInterval: number = window.setInterval(() => {
      if (Math.random() > 0.5) {
        // Less chance of creating new points
        setDetectionPoints((prev) => {
          // Keep maximum number of points lower for better performance
          if (prev.length < 12) {
            return [...prev, generateRandomPoint()];
          }
          // Replace oldest point
          return [...prev.slice(1), generateRandomPoint()];
        });
      }
    }, 2000); // Longer interval between new points

    return () => {
      window.clearInterval(intervalId);
      window.clearInterval(newPointsInterval);
    };
  }, [generateRandomPoint]);

  // Update radar history and detect points - optimized with useCallback
  useEffect(() => {
    // Convert angle to radians
    const angleRad: number = (angle * Math.PI) / 180;

    // Update detection points with fewer calculations
    setDetectionPoints((prev) => {
      return prev
        .map((point) => {
          // Only calculate angles when needed, not on every point
          if (point.age > 150) return { ...point, age: point.age + 1 }; // Skip detection for old points

          // Calculate angle to the point from center
          const pointAngle: number = Math.atan2(
            point.y - centerY,
            point.x - centerX
          );

          // Normalize angles for comparison
          const normalizedPointAngle: number =
            pointAngle < 0 ? pointAngle + 2 * Math.PI : pointAngle;
          const normalizedRadarAngle: number =
            angleRad < 0 ? angleRad + 2 * Math.PI : angleRad;

          // Use a slightly wider detection angle for better visibility of detections
          const isDetected: boolean =
            Math.abs(normalizedPointAngle - normalizedRadarAngle) < 0.15;

          return {
            ...point,
            age: point.age + 1,
            detected: isDetected || point.detected,
          };
        })
        .filter((p) => p.age < 300); // Keep points longer on screen
    });

    // Add to radar history - less frequently for better performance
    if (angle % 15 === 0) {
      setRadarHistory((prev) => {
        const newHistory: RadarHistory[] = [...prev, { angle: angleRad }];
        // Keep fewer history items for better performance
        return newHistory.slice(-20);
      });
    }
  }, [angle, centerX, centerY]);

  // Calculate radar line end position - memoized
  const radarLineEnd = useMemo(() => {
    const angleRad = (angle * Math.PI) / 180;
    return {
      x: centerX + lineLength * Math.cos(angleRad),
      y: centerY + lineLength * Math.sin(angleRad),
    };
  }, [angle, centerX, centerY, lineLength]);

  // Render the radar circles - memoized
  const circles = useMemo(() => {
    return [0.33, 0.67, 1].map((ratio, index) => (
      <circle
        key={index}
        cx={centerX}
        cy={centerY}
        r={maxRadius * ratio}
        fill="none"
        stroke="#1a5c36"
        strokeWidth="1"
        opacity="0.5"
      />
    ));
  }, [centerX, centerY, maxRadius]);

  // Render the history traces - memoized for performance
  const historyTraces = useMemo(() => {
    return radarHistory.map((item, index) => {
      const opacity: number = 0.05 + (index / radarHistory.length) * 0.3; // Less opaque
      return (
        <line
          key={index}
          x1={centerX}
          y1={centerY}
          x2={centerX + lineLength * Math.cos(item.angle)}
          y2={centerY + lineLength * Math.sin(item.angle)}
          stroke="#0f0"
          strokeWidth="1"
          opacity={opacity}
        />
      );
    });
  }, [radarHistory, centerX, centerY, lineLength]);

  // Count detected items once
  const detectedCount = useMemo(() => {
    return detectionPoints.filter((p) => p.detected).length;
  }, [detectionPoints]);

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-xl font-bold mb-4">Krittin Food Radar</h2>
      <div className="border border-gray-300 rounded-lg p-2 bg-black">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background */}
          <rect width={size} height={size} fill="#001a00" />

          {/* Radar circles */}
          {circles}

          {/* Coordinate lines */}
          <line
            x1={centerX}
            y1={0}
            x2={centerX}
            y2={size}
            stroke="#1a5c36"
            strokeWidth="1"
            opacity="0.3"
          />
          <line
            x1={0}
            y1={centerY}
            x2={size}
            y2={centerY}
            stroke="#1a5c36"
            strokeWidth="1"
            opacity="0.3"
          />

          {/* History traces */}
          {historyTraces}

          {/* Detection points as food icons */}
          {detectionPoints.map((point, index) => {
            const pointOpacity = point.detected
              ? 0.3 + point.strength * 0.7
              : 0;
            const fontSize = 14 + point.strength * 10;

            return (
              <g key={index}>
                <text
                  x={point.x}
                  y={point.y}
                  fontSize={fontSize}
                  textAnchor="middle"
                  dominantBaseline="central"
                  opacity={pointOpacity}
                  style={{
                    filter: point.detected
                      ? "drop-shadow(0 0 3px #0f0)"
                      : "none",
                    transition: "opacity 0.3s ease-out",
                  }}
                >
                  {point.foodIcon}
                </text>
                {point.detected && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={fontSize}
                    fill="none"
                    stroke="#0f0"
                    strokeWidth="1"
                    opacity={pointOpacity * 0.3}
                  />
                )}
              </g>
            );
          })}

          {/* Radar sweep line */}
          <line
            x1={centerX}
            y1={centerY}
            x2={radarLineEnd.x}
            y2={radarLineEnd.y}
            stroke="#0f0"
            strokeWidth="2"
          />

          {/* Radar center point */}
          <circle cx={centerX} cy={centerY} r="3" fill="#0f0" />
        </svg>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>Detected food: {detectedCount}</p>
      </div>
    </div>
  );
};

export default SonarRadar;
