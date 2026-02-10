import { useRef, useState, useEffect, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { NarutoCharacter } from "./NarutoCharacter";
import { Obstacle, ObstacleType } from "./Obstacles";
import { GameEnvironment } from "./Environment";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface GameProps {
  onGameOver: (score: number, duration: number, obstaclesAvoided: number) => void;
  gameId: Id<"liveGames"> | null;
}

interface ObstacleData {
  id: number;
  type: ObstacleType;
  position: [number, number, number];
  lane: number;
}

const LANES = [-1.2, 0, 1.2];
const OBSTACLE_TYPES: ObstacleType[] = ["sasuke", "sakura", "hinata", "kakashi", "mission_scroll", "kunai"];

function GameScene({ onGameOver, gameId }: GameProps) {
  const [playerLane, setPlayerLane] = useState(1);
  const [isJumping, setIsJumping] = useState(false);
  const [jumpHeight, setJumpHeight] = useState(0);
  const [obstacles, setObstacles] = useState<ObstacleData[]>([]);
  const [score, setScore] = useState(0);
  const [obstaclesAvoided, setObstaclesAvoided] = useState(0);
  const [gameStartTime] = useState(Date.now());
  const [isGameOver, setIsGameOver] = useState(false);

  const obstacleIdRef = useRef(0);
  const lastSpawnTimeRef = useRef(0);
  const playerRef = useRef<THREE.Vector3>(new THREE.Vector3(LANES[1], 0, 5));

  const updateLiveScore = useMutation(api.liveGames.updateLiveScore);

  const speed = 8 + Math.floor(score / 500) * 2;
  const spawnInterval = Math.max(800 - Math.floor(score / 200) * 50, 400);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;

      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          setPlayerLane((prev) => Math.max(0, prev - 1));
          break;
        case "ArrowRight":
        case "d":
        case "D":
          setPlayerLane((prev) => Math.min(2, prev + 1));
          break;
        case " ":
        case "ArrowUp":
        case "w":
        case "W":
          if (!isJumping) {
            setIsJumping(true);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isJumping, isGameOver]);

  // Touch controls for mobile
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isGameOver) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 50) {
          setPlayerLane((prev) => Math.min(2, prev + 1));
        } else if (deltaX < -50) {
          setPlayerLane((prev) => Math.max(0, prev - 1));
        }
      } else if (deltaY < -50 && !isJumping) {
        setIsJumping(true);
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isJumping, isGameOver]);

  // Spawn obstacles
  const spawnObstacle = useCallback(() => {
    const lane = Math.floor(Math.random() * 3);
    const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];

    const newObstacle: ObstacleData = {
      id: obstacleIdRef.current++,
      type,
      position: [LANES[lane], 0, -30],
      lane,
    };

    setObstacles((prev) => [...prev, newObstacle]);
  }, []);

  // Game loop
  useFrame((state, delta) => {
    if (isGameOver) return;

    // Update score
    setScore((prev) => {
      const newScore = prev + Math.floor(delta * 100);
      // Update live score every 500 points
      if (gameId && Math.floor(newScore / 500) > Math.floor(prev / 500)) {
        updateLiveScore({ gameId, score: newScore });
      }
      return newScore;
    });

    // Spawn obstacles
    const now = Date.now();
    if (now - lastSpawnTimeRef.current > spawnInterval) {
      spawnObstacle();
      lastSpawnTimeRef.current = now;
    }

    // Update jump
    if (isJumping) {
      setJumpHeight((prev) => {
        const newHeight = prev + delta * 8;
        if (newHeight >= 2) {
          return 2;
        }
        return newHeight;
      });
    } else if (jumpHeight > 0) {
      setJumpHeight((prev) => {
        const newHeight = prev - delta * 10;
        if (newHeight <= 0) {
          return 0;
        }
        return newHeight;
      });
    }

    if (jumpHeight >= 2 && isJumping) {
      setIsJumping(false);
    }

    // Update player position
    playerRef.current.x = THREE.MathUtils.lerp(
      playerRef.current.x,
      LANES[playerLane],
      delta * 10
    );
    playerRef.current.y = jumpHeight;

    // Update obstacles and check collisions
    setObstacles((prev) => {
      const updated: ObstacleData[] = [];
      let avoided = 0;

      for (const obstacle of prev) {
        const newZ = obstacle.position[2] + speed * delta;

        if (newZ > 10) {
          avoided++;
          continue;
        }

        // Collision detection
        const obstacleX = LANES[obstacle.lane];
        const playerX = playerRef.current.x;
        const playerY = playerRef.current.y;

        const isInSameLane = Math.abs(obstacleX - playerX) < 0.8;
        const isAtPlayerZ = newZ > 4 && newZ < 6;
        const isGroundObstacle = obstacle.type !== "kunai" && obstacle.type !== "mission_scroll";
        const isFlyingObstacle = obstacle.type === "kunai" || obstacle.type === "mission_scroll";

        if (isInSameLane && isAtPlayerZ) {
          if (isGroundObstacle && playerY < 1.2) {
            // Hit ground obstacle
            setIsGameOver(true);
            const duration = (Date.now() - gameStartTime) / 1000;
            onGameOver(score, duration, obstaclesAvoided + avoided);
            return prev;
          }
          if (isFlyingObstacle && playerY > 0.3 && playerY < 1.5) {
            // Hit flying obstacle
            setIsGameOver(true);
            const duration = (Date.now() - gameStartTime) / 1000;
            onGameOver(score, duration, obstaclesAvoided + avoided);
            return prev;
          }
        }

        updated.push({
          ...obstacle,
          position: [obstacle.position[0], obstacle.position[1], newZ],
        });
      }

      if (avoided > 0) {
        setObstaclesAvoided((prev) => prev + avoided);
      }

      return updated;
    });
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <hemisphereLight args={["#87ceeb", "#228b22", 0.4]} />

      {/* Environment */}
      <GameEnvironment speed={speed} />

      {/* Player */}
      <NarutoCharacter
        position={[playerRef.current.x, jumpHeight, 5]}
        isRunning={!isGameOver}
        isJumping={isJumping || jumpHeight > 0.1}
      />

      {/* Obstacles */}
      {obstacles.map((obstacle) => (
        <Obstacle
          key={obstacle.id}
          type={obstacle.type}
          position={obstacle.position}
          speed={0}
        />
      ))}

      {/* Camera */}
      <CameraRig />
    </>
  );
}

function CameraRig() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 4, 12);
    camera.lookAt(0, 1, 0);
  }, [camera]);

  return null;
}

interface GameCanvasProps {
  onGameOver: (score: number, duration: number, obstaclesAvoided: number) => void;
  score: number;
  setScore: (score: number) => void;
  gameId: Id<"liveGames"> | null;
}

export function GameCanvas({ onGameOver, score, setScore, gameId }: GameCanvasProps) {
  return (
    <div className="relative w-full h-full">
      {/* Score overlay */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-orange-500/50">
          <div className="text-orange-400 text-sm font-medium">SCORE</div>
          <div className="text-white text-2xl md:text-3xl font-bold tracking-wider">{score.toLocaleString()}</div>
        </div>
      </div>

      {/* Difficulty indicator */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-red-500/50">
          <div className="text-red-400 text-sm font-medium">DIFFICULTY</div>
          <div className="text-white text-xl md:text-2xl font-bold">
            {Math.floor(score / 500) + 1}
          </div>
        </div>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
          <div className="text-white/70 text-xs md:text-sm">
            <span className="hidden md:inline">← → or A/D to move • SPACE to jump</span>
            <span className="md:hidden">Swipe ← → to move • Swipe ↑ to jump</span>
          </div>
        </div>
      </div>

      <Canvas shadows>
        <Suspense fallback={null}>
          <GameSceneWrapper onGameOver={onGameOver} setScore={setScore} gameId={gameId} />
        </Suspense>
      </Canvas>
    </div>
  );
}

function GameSceneWrapper({
  onGameOver,
  setScore,
  gameId,
}: {
  onGameOver: (score: number, duration: number, obstaclesAvoided: number) => void;
  setScore: (score: number) => void;
  gameId: Id<"liveGames"> | null;
}) {
  const scoreRef = useRef(0);

  useFrame(() => {
    setScore(scoreRef.current);
  });

  return (
    <GameSceneWithScore
      onGameOver={onGameOver}
      scoreRef={scoreRef}
      gameId={gameId}
    />
  );
}

function GameSceneWithScore({
  onGameOver,
  scoreRef,
  gameId,
}: {
  onGameOver: (score: number, duration: number, obstaclesAvoided: number) => void;
  scoreRef: React.MutableRefObject<number>;
  gameId: Id<"liveGames"> | null;
}) {
  const [internalScore, setInternalScore] = useState(0);

  useEffect(() => {
    scoreRef.current = internalScore;
  }, [internalScore, scoreRef]);

  return (
    <GameSceneInternal
      onGameOver={onGameOver}
      score={internalScore}
      setScore={setInternalScore}
      gameId={gameId}
    />
  );
}

function GameSceneInternal({
  onGameOver,
  score,
  setScore,
  gameId,
}: {
  onGameOver: (score: number, duration: number, obstaclesAvoided: number) => void;
  score: number;
  setScore: (score: number) => void;
  gameId: Id<"liveGames"> | null;
}) {
  const [playerLane, setPlayerLane] = useState(1);
  const [isJumping, setIsJumping] = useState(false);
  const [jumpHeight, setJumpHeight] = useState(0);
  const [obstacles, setObstacles] = useState<ObstacleData[]>([]);
  const [obstaclesAvoided, setObstaclesAvoided] = useState(0);
  const [gameStartTime] = useState(Date.now());
  const [isGameOver, setIsGameOver] = useState(false);

  const obstacleIdRef = useRef(0);
  const lastSpawnTimeRef = useRef(0);
  const playerRef = useRef<THREE.Vector3>(new THREE.Vector3(LANES[1], 0, 5));

  const updateLiveScore = useMutation(api.liveGames.updateLiveScore);

  const speed = 8 + Math.floor(score / 500) * 2;
  const spawnInterval = Math.max(800 - Math.floor(score / 200) * 50, 400);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;

      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          setPlayerLane((prev) => Math.max(0, prev - 1));
          break;
        case "ArrowRight":
        case "d":
        case "D":
          setPlayerLane((prev) => Math.min(2, prev + 1));
          break;
        case " ":
        case "ArrowUp":
        case "w":
        case "W":
          if (!isJumping) {
            setIsJumping(true);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isJumping, isGameOver]);

  // Touch controls for mobile
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isGameOver) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 50) {
          setPlayerLane((prev) => Math.min(2, prev + 1));
        } else if (deltaX < -50) {
          setPlayerLane((prev) => Math.max(0, prev - 1));
        }
      } else if (deltaY < -50 && !isJumping) {
        setIsJumping(true);
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isJumping, isGameOver]);

  // Spawn obstacles
  const spawnObstacle = useCallback(() => {
    const lane = Math.floor(Math.random() * 3);
    const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];

    const newObstacle: ObstacleData = {
      id: obstacleIdRef.current++,
      type,
      position: [LANES[lane], 0, -30],
      lane,
    };

    setObstacles((prev) => [...prev, newObstacle]);
  }, []);

  // Game loop
  useFrame((state, delta) => {
    if (isGameOver) return;

    // Update score
    const newScore = score + Math.floor(delta * 100);
    // Update live score every 500 points
    if (gameId && Math.floor(newScore / 500) > Math.floor(score / 500)) {
      updateLiveScore({ gameId, score: newScore });
    }
    setScore(newScore);

    // Spawn obstacles
    const now = Date.now();
    if (now - lastSpawnTimeRef.current > spawnInterval) {
      spawnObstacle();
      lastSpawnTimeRef.current = now;
    }

    // Update jump
    if (isJumping) {
      setJumpHeight((prev) => {
        const newHeight = prev + delta * 8;
        if (newHeight >= 2) {
          return 2;
        }
        return newHeight;
      });
    } else if (jumpHeight > 0) {
      setJumpHeight((prev) => {
        const newHeight = prev - delta * 10;
        if (newHeight <= 0) {
          return 0;
        }
        return newHeight;
      });
    }

    if (jumpHeight >= 2 && isJumping) {
      setIsJumping(false);
    }

    // Update player position
    playerRef.current.x = THREE.MathUtils.lerp(
      playerRef.current.x,
      LANES[playerLane],
      delta * 10
    );
    playerRef.current.y = jumpHeight;

    // Update obstacles and check collisions
    setObstacles((prev) => {
      const updated: ObstacleData[] = [];
      let avoided = 0;

      for (const obstacle of prev) {
        const newZ = obstacle.position[2] + speed * delta;

        if (newZ > 10) {
          avoided++;
          continue;
        }

        // Collision detection
        const obstacleX = LANES[obstacle.lane];
        const playerX = playerRef.current.x;
        const playerY = playerRef.current.y;

        const isInSameLane = Math.abs(obstacleX - playerX) < 0.8;
        const isAtPlayerZ = newZ > 4 && newZ < 6;
        const isGroundObstacle = obstacle.type !== "kunai" && obstacle.type !== "mission_scroll";
        const isFlyingObstacle = obstacle.type === "kunai" || obstacle.type === "mission_scroll";

        if (isInSameLane && isAtPlayerZ) {
          if (isGroundObstacle && playerY < 1.2) {
            // Hit ground obstacle
            setIsGameOver(true);
            const duration = (Date.now() - gameStartTime) / 1000;
            onGameOver(score, duration, obstaclesAvoided + avoided);
            return prev;
          }
          if (isFlyingObstacle && playerY > 0.3 && playerY < 1.5) {
            // Hit flying obstacle
            setIsGameOver(true);
            const duration = (Date.now() - gameStartTime) / 1000;
            onGameOver(score, duration, obstaclesAvoided + avoided);
            return prev;
          }
        }

        updated.push({
          ...obstacle,
          position: [obstacle.position[0], obstacle.position[1], newZ],
        });
      }

      if (avoided > 0) {
        setObstaclesAvoided((prev) => prev + avoided);
      }

      return updated;
    });
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <hemisphereLight args={["#87ceeb", "#228b22", 0.4]} />

      {/* Environment */}
      <GameEnvironment speed={speed} />

      {/* Player */}
      <NarutoCharacter
        position={[playerRef.current.x, jumpHeight, 5]}
        isRunning={!isGameOver}
        isJumping={isJumping || jumpHeight > 0.1}
      />

      {/* Obstacles */}
      {obstacles.map((obstacle) => (
        <Obstacle
          key={obstacle.id}
          type={obstacle.type}
          position={obstacle.position}
          speed={0}
        />
      ))}

      {/* Camera */}
      <CameraRig />
    </>
  );
}
