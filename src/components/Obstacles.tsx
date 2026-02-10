import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type ObstacleType = "sasuke" | "sakura" | "hinata" | "kakashi" | "mission_scroll" | "kunai";

interface ObstacleProps {
  type: ObstacleType;
  position: [number, number, number];
  speed: number;
}

function SasukeObstacle({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body - Blue shirt */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.25]} />
        <meshStandardMaterial color="#1a237e" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.35, 0.35, 0.3]} />
        <meshStandardMaterial color="#FFCC99" />
      </mesh>
      {/* Dark spiky hair */}
      <mesh position={[0, 1.15, -0.05]}>
        <coneGeometry args={[0.22, 0.2, 6]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0.12, 1.08, 0]} rotation={[0, 0, 0.5]}>
        <coneGeometry args={[0.1, 0.18, 4]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[-0.12, 1.08, 0]} rotation={[0, 0, -0.5]}>
        <coneGeometry args={[0.1, 0.18, 4]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      {/* Sharingan eyes */}
      <mesh position={[0.08, 0.95, 0.15]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#cc0000" emissive="#ff0000" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-0.08, 0.95, 0.15]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#cc0000" emissive="#ff0000" emissiveIntensity={0.3} />
      </mesh>
      {/* Legs */}
      <mesh position={[0.1, 0.15, 0]}>
        <boxGeometry args={[0.14, 0.35, 0.14]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.1, 0.15, 0]}>
        <boxGeometry args={[0.14, 0.35, 0.14]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function SakuraObstacle({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Body - Red dress */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.35, 0.55, 0.22]} />
        <meshStandardMaterial color="#e91e63" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.32, 0.32, 0.28]} />
        <meshStandardMaterial color="#FFCC99" />
      </mesh>
      {/* Pink hair */}
      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color="#ff69b4" />
      </mesh>
      {/* Headband */}
      <mesh position={[0, 1.12, 0]}>
        <torusGeometry args={[0.18, 0.02, 8, 16]} />
        <meshStandardMaterial color="#cc0000" />
      </mesh>
      {/* Green eyes */}
      <mesh position={[0.07, 0.95, 0.13]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#4caf50" />
      </mesh>
      <mesh position={[-0.07, 0.95, 0.13]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#4caf50" />
      </mesh>
      {/* Legs */}
      <mesh position={[0.08, 0.12, 0]}>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#FFCC99" />
      </mesh>
      <mesh position={[-0.08, 0.12, 0]}>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#FFCC99" />
      </mesh>
    </group>
  );
}

function HinataObstacle({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Body - Lavender jacket */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.42, 0.55, 0.25]} />
        <meshStandardMaterial color="#9575cd" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.32, 0.32, 0.28]} />
        <meshStandardMaterial color="#FFCC99" />
      </mesh>
      {/* Dark blue hair */}
      <mesh position={[0, 1.0, -0.05]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial color="#1a237e" />
      </mesh>
      {/* Byakugan eyes */}
      <mesh position={[0.07, 0.95, 0.13]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#e8eaf6" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[-0.07, 0.95, 0.13]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#e8eaf6" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>
      {/* Legs - Navy pants */}
      <mesh position={[0.08, 0.12, 0]}>
        <boxGeometry args={[0.12, 0.3, 0.12]} />
        <meshStandardMaterial color="#1a237e" />
      </mesh>
      <mesh position={[-0.08, 0.12, 0]}>
        <boxGeometry args={[0.12, 0.3, 0.12]} />
        <meshStandardMaterial color="#1a237e" />
      </mesh>
    </group>
  );
}

function KakashiObstacle({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Body - Jonin vest */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.45, 0.55, 0.28]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      {/* Head with mask */}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.35, 0.35, 0.3]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      {/* Silver spiky hair */}
      <mesh position={[0, 1.18, -0.08]}>
        <coneGeometry args={[0.2, 0.25, 6]} />
        <meshStandardMaterial color="#c0c0c0" />
      </mesh>
      <mesh position={[0.1, 1.12, 0]} rotation={[0.2, 0, 0.4]}>
        <coneGeometry args={[0.08, 0.15, 4]} />
        <meshStandardMaterial color="#c0c0c0" />
      </mesh>
      {/* Headband covering eye */}
      <mesh position={[0, 1.0, 0.14]}>
        <boxGeometry args={[0.38, 0.1, 0.04]} />
        <meshStandardMaterial color="#1a237e" />
      </mesh>
      {/* One visible eye */}
      <mesh position={[-0.08, 0.92, 0.15]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Legs */}
      <mesh position={[0.1, 0.12, 0]}>
        <boxGeometry args={[0.14, 0.3, 0.14]} />
        <meshStandardMaterial color="#1a237e" />
      </mesh>
      <mesh position={[-0.1, 0.12, 0]}>
        <boxGeometry args={[0.14, 0.3, 0.14]} />
        <meshStandardMaterial color="#1a237e" />
      </mesh>
    </group>
  );
}

function MissionScrollObstacle({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 2;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Scroll body */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
        <meshStandardMaterial color="#f5deb3" />
      </mesh>
      {/* Scroll ends */}
      <mesh position={[0, 0, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.05, 16]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[0, 0, -0.42]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.05, 16]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      {/* "Mission" seal */}
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[0.1, 0.02, 0.3]} />
        <meshStandardMaterial color="#cc0000" />
      </mesh>
    </group>
  );
}

function KunaiObstacle({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 5;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Blade */}
      <mesh position={[0, 0.2, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.08, 0.4, 4]} />
        <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.25, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Ring */}
      <mesh position={[0, -0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.08, 0.02, 8, 16]} />
        <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

export function Obstacle({ type, position, speed }: ObstacleProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.position.z += speed * delta;
    }
  });

  const renderObstacle = () => {
    switch (type) {
      case "sasuke":
        return <SasukeObstacle position={[0, 0, 0]} />;
      case "sakura":
        return <SakuraObstacle position={[0, 0, 0]} />;
      case "hinata":
        return <HinataObstacle position={[0, 0, 0]} />;
      case "kakashi":
        return <KakashiObstacle position={[0, 0, 0]} />;
      case "mission_scroll":
        return <MissionScrollObstacle position={[0, 0.5, 0]} />;
      case "kunai":
        return <KunaiObstacle position={[0, 0.8, 0]} />;
      default:
        return null;
    }
  };

  return (
    <group ref={groupRef} position={position}>
      {renderObstacle()}
    </group>
  );
}
