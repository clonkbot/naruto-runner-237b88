import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface NarutoCharacterProps {
  position: [number, number, number];
  isRunning: boolean;
  isJumping: boolean;
}

export function NarutoCharacter({ position, isRunning, isJumping }: NarutoCharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const legLeftRef = useRef<THREE.Mesh>(null);
  const legRightRef = useRef<THREE.Mesh>(null);
  const armLeftRef = useRef<THREE.Mesh>(null);
  const armRightRef = useRef<THREE.Mesh>(null);
  const headbandTailRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    // Running animation
    if (isRunning && !isJumping) {
      const runSpeed = 12;
      const runAmplitude = 0.4;

      if (legLeftRef.current) {
        legLeftRef.current.rotation.x = Math.sin(time * runSpeed) * runAmplitude;
      }
      if (legRightRef.current) {
        legRightRef.current.rotation.x = Math.sin(time * runSpeed + Math.PI) * runAmplitude;
      }
      if (armLeftRef.current) {
        armLeftRef.current.rotation.x = Math.sin(time * runSpeed + Math.PI) * runAmplitude * 0.8;
      }
      if (armRightRef.current) {
        armRightRef.current.rotation.x = Math.sin(time * runSpeed) * runAmplitude * 0.8;
      }
      // Headband tails flowing
      if (headbandTailRef.current) {
        headbandTailRef.current.rotation.y = Math.sin(time * runSpeed * 0.5) * 0.3;
      }
    }

    // Jumping pose
    if (isJumping) {
      if (legLeftRef.current) legLeftRef.current.rotation.x = -0.3;
      if (legRightRef.current) legRightRef.current.rotation.x = 0.3;
      if (armLeftRef.current) armLeftRef.current.rotation.x = -0.5;
      if (armRightRef.current) armRightRef.current.rotation.x = -0.5;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body - Orange jacket */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.25]} />
        <meshStandardMaterial color="#FF6600" />
      </mesh>

      {/* Blue collar detail */}
      <mesh position={[0, 0.72, 0.08]}>
        <boxGeometry args={[0.35, 0.08, 0.15]} />
        <meshStandardMaterial color="#1a4d8c" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.35, 0.35, 0.3]} />
        <meshStandardMaterial color="#FFCC99" />
      </mesh>

      {/* Hair - spiky blonde */}
      <mesh position={[0, 1.15, 0]}>
        <coneGeometry args={[0.2, 0.15, 6]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      <mesh position={[0.1, 1.1, 0.05]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.08, 0.12, 4]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      <mesh position={[-0.1, 1.1, 0.05]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.08, 0.12, 4]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      <mesh position={[0, 1.08, 0.12]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.07, 0.1, 4]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>

      {/* Headband */}
      <mesh position={[0, 1.0, 0.13]}>
        <boxGeometry args={[0.38, 0.08, 0.05]} />
        <meshStandardMaterial color="#1a4d8c" />
      </mesh>
      {/* Metal plate */}
      <mesh position={[0, 1.0, 0.16]}>
        <boxGeometry args={[0.15, 0.06, 0.02]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Headband tails */}
      <mesh ref={headbandTailRef} position={[0, 0.98, -0.15]}>
        <boxGeometry args={[0.3, 0.05, 0.25]} />
        <meshStandardMaterial color="#1a4d8c" />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.08, 0.95, 0.15]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#3399FF" />
      </mesh>
      <mesh position={[-0.08, 0.95, 0.15]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#3399FF" />
      </mesh>

      {/* Whisker marks */}
      {[-0.03, 0, 0.03].map((y, i) => (
        <mesh key={`whisker-r-${i}`} position={[0.12, 0.88 + y, 0.14]}>
          <boxGeometry args={[0.06, 0.01, 0.01]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}
      {[-0.03, 0, 0.03].map((y, i) => (
        <mesh key={`whisker-l-${i}`} position={[-0.12, 0.88 + y, 0.14]}>
          <boxGeometry args={[0.06, 0.01, 0.01]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}

      {/* Arms - Orange sleeves */}
      <mesh ref={armLeftRef} position={[0.28, 0.55, 0]}>
        <boxGeometry args={[0.12, 0.4, 0.12]} />
        <meshStandardMaterial color="#FF6600" />
      </mesh>
      <mesh ref={armRightRef} position={[-0.28, 0.55, 0]}>
        <boxGeometry args={[0.12, 0.4, 0.12]} />
        <meshStandardMaterial color="#FF6600" />
      </mesh>

      {/* Hands */}
      <mesh position={[0.28, 0.32, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#FFCC99" />
      </mesh>
      <mesh position={[-0.28, 0.32, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#FFCC99" />
      </mesh>

      {/* Legs - Orange pants */}
      <mesh ref={legLeftRef} position={[0.1, 0.15, 0]}>
        <boxGeometry args={[0.14, 0.35, 0.14]} />
        <meshStandardMaterial color="#FF6600" />
      </mesh>
      <mesh ref={legRightRef} position={[-0.1, 0.15, 0]}>
        <boxGeometry args={[0.14, 0.35, 0.14]} />
        <meshStandardMaterial color="#FF6600" />
      </mesh>

      {/* Sandals */}
      <mesh position={[0.1, -0.02, 0.02]}>
        <boxGeometry args={[0.12, 0.06, 0.18]} />
        <meshStandardMaterial color="#1a4d8c" />
      </mesh>
      <mesh position={[-0.1, -0.02, 0.02]}>
        <boxGeometry args={[0.12, 0.06, 0.18]} />
        <meshStandardMaterial color="#1a4d8c" />
      </mesh>
    </group>
  );
}
