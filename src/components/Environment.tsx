import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface EnvironmentProps {
  speed: number;
}

export function GameEnvironment({ speed }: EnvironmentProps) {
  const groundRef = useRef<THREE.Group>(null);
  const buildingsRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    // Scroll buildings
    if (buildingsRef.current) {
      buildingsRef.current.children.forEach((child) => {
        child.position.z += speed * delta;
        if (child.position.z > 10) {
          child.position.z = -50;
        }
      });
    }

    // Scroll clouds
    if (cloudsRef.current) {
      cloudsRef.current.children.forEach((child) => {
        child.position.z += speed * delta * 0.3;
        if (child.position.z > 20) {
          child.position.z = -40;
        }
      });
    }
  });

  return (
    <>
      {/* Sky gradient */}
      <mesh position={[0, 20, -50]}>
        <planeGeometry args={[200, 80]} />
        <meshBasicMaterial color="#87ceeb" />
      </mesh>

      {/* Ground - path to ramen shop */}
      <group ref={groundRef}>
        {/* Main path */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <planeGeometry args={[4, 100]} />
          <meshStandardMaterial color="#a0522d" />
        </mesh>
        {/* Path borders */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.2, -0.04, 0]}>
          <planeGeometry args={[0.4, 100]} />
          <meshStandardMaterial color="#228b22" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.2, -0.04, 0]}>
          <planeGeometry args={[0.4, 100]} />
          <meshStandardMaterial color="#228b22" />
        </mesh>
        {/* Grass */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5, -0.06, 0]}>
          <planeGeometry args={[6, 100]} />
          <meshStandardMaterial color="#2e8b57" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5, -0.06, 0]}>
          <planeGeometry args={[6, 100]} />
          <meshStandardMaterial color="#2e8b57" />
        </mesh>
      </group>

      {/* Buildings - Hidden Leaf Village style */}
      <group ref={buildingsRef}>
        {Array.from({ length: 12 }).map((_, i) => (
          <VillageBuilding
            key={i}
            position={[
              i % 2 === 0 ? -6 : 6,
              0,
              -i * 8 + 5,
            ]}
            side={i % 2 === 0 ? "left" : "right"}
            variant={i % 4}
          />
        ))}
      </group>

      {/* Clouds */}
      <group ref={cloudsRef}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Cloud
            key={i}
            position={[
              (Math.random() - 0.5) * 30,
              8 + Math.random() * 5,
              -i * 8,
            ]}
            scale={0.5 + Math.random() * 1}
          />
        ))}
      </group>

      {/* Distant Hokage Rock */}
      <HokageRock position={[0, 5, -60]} />

      {/* Ramen shop sign in distance */}
      <RamenShopSign position={[0, 3, -55]} />
    </>
  );
}

function VillageBuilding({
  position,
  side,
  variant,
}: {
  position: [number, number, number];
  side: "left" | "right";
  variant: number;
}) {
  const colors = ["#d4a574", "#c9a66b", "#b8956e", "#a67c52"];
  const roofColors = ["#8b0000", "#6b4423", "#2f4f4f", "#4a3728"];
  const height = 2 + variant * 0.5;

  return (
    <group position={position} rotation={[0, side === "left" ? 0.1 : -0.1, 0]}>
      {/* Building body */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[3, height, 2.5]} />
        <meshStandardMaterial color={colors[variant]} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, height + 0.4, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.5, 1, 4]} />
        <meshStandardMaterial color={roofColors[variant]} />
      </mesh>
      {/* Windows */}
      {Array.from({ length: Math.floor(height) }).map((_, i) => (
        <mesh
          key={i}
          position={[side === "left" ? 1.51 : -1.51, 1 + i * 0.8, 0]}
          rotation={[0, side === "left" ? 0 : Math.PI, 0]}
        >
          <planeGeometry args={[0.4, 0.5]} />
          <meshStandardMaterial color="#87ceeb" emissive="#ffeb3b" emissiveIntensity={0.1} />
        </mesh>
      ))}
      {/* Door */}
      <mesh position={[side === "left" ? 1.51 : -1.51, 0.6, 0]}>
        <planeGeometry args={[0.5, 1.2]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
    </group>
  );
}

function Cloud({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0.6, 0.1, 0]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
      <mesh position={[-0.5, 0, 0.2]}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function HokageRock({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Mountain base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[30, 12, 5]} />
        <meshStandardMaterial color="#6b6b6b" />
      </mesh>
      {/* Face carvings (simplified as rectangles) */}
      {[-9, -3, 3, 9].map((x, i) => (
        <mesh key={i} position={[x, 2, 2.6]}>
          <boxGeometry args={[4, 5, 0.3]} />
          <meshStandardMaterial color="#5a5a5a" />
        </mesh>
      ))}
    </group>
  );
}

function RamenShopSign({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Sign board */}
      <mesh>
        <boxGeometry args={[4, 1.5, 0.2]} />
        <meshStandardMaterial color="#cc0000" emissive="#ff0000" emissiveIntensity={0.2} />
      </mesh>
      {/* Lanterns */}
      <mesh position={[-2, -0.5, 0.3]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff9900" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[2, -0.5, 0.3]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff9900" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}
