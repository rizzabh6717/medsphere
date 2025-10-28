import { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { BodySystem, bodyParts, BodyPart } from '@/types/anatomy';
import { toast } from 'sonner';
import { AnatomicalModel } from './AnatomicalModel';

// Detailed anatomical body - creates a more realistic representation
function HumanBody() {
  // Using procedural geometry for detailed anatomy
  return (
    <group>
      {/* Head - more detailed */}
      <mesh position={[0, 1.65, 0]}>
        <sphereGeometry args={[0.13, 32, 32]} />
        <meshStandardMaterial 
          color="#FFC9A8" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Face details */}
      <mesh position={[0, 1.68, 0.11]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#FFB090" />
      </mesh>

      {/* Neck with muscles */}
      <mesh position={[0, 1.42, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.2, 16]} />
        <meshStandardMaterial color="#E8A080" roughness={0.7} />
      </mesh>

      {/* Trapezius muscles */}
      <mesh position={[0, 1.25, -0.02]}>
        <boxGeometry args={[0.38, 0.15, 0.15]} />
        <meshStandardMaterial color="#D88868" roughness={0.6} />
      </mesh>

      {/* Chest - Pectoralis muscles */}
      <mesh position={[0, 1.15, 0.06]}>
        <boxGeometry args={[0.36, 0.2, 0.18]} />
        <meshStandardMaterial color="#D88868" roughness={0.6} />
      </mesh>
      
      {/* Rib cage outline */}
      <mesh position={[0, 1.0, 0.02]}>
        <boxGeometry args={[0.34, 0.35, 0.22]} />
        <meshStandardMaterial color="#E89878" roughness={0.7} />
      </mesh>

      {/* Abdominal muscles */}
      <mesh position={[0, 0.65, 0.08]}>
        <boxGeometry args={[0.28, 0.35, 0.16]} />
        <meshStandardMaterial color="#E09070" roughness={0.6} />
      </mesh>

      {/* Obliques */}
      <mesh position={[-0.15, 0.65, 0.02]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.08, 0.3, 0.12]} />
        <meshStandardMaterial color="#D88060" roughness={0.6} />
      </mesh>
      <mesh position={[0.15, 0.65, 0.02]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[0.08, 0.3, 0.12]} />
        <meshStandardMaterial color="#D88060" roughness={0.6} />
      </mesh>

      {/* Pelvis */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.32, 0.18, 0.2]} />
        <meshStandardMaterial color="#E89878" roughness={0.7} />
      </mesh>

      {/* Deltoids (shoulders) */}
      <mesh position={[-0.24, 1.2, 0]} rotation={[0, 0, 0.3]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#D88868" roughness={0.6} />
      </mesh>
      <mesh position={[0.24, 1.2, 0]} rotation={[0, 0, -0.3]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#D88868" roughness={0.6} />
      </mesh>

      {/* Upper Arms - Biceps/Triceps */}
      <mesh position={[-0.28, 0.88, 0]}>
        <cylinderGeometry args={[0.055, 0.05, 0.35, 16]} />
        <meshStandardMaterial color="#D88060" roughness={0.6} />
      </mesh>
      <mesh position={[0.28, 0.88, 0]}>
        <cylinderGeometry args={[0.055, 0.05, 0.35, 16]} />
        <meshStandardMaterial color="#D88060" roughness={0.6} />
      </mesh>

      {/* Forearms */}
      <mesh position={[-0.30, 0.55, 0]}>
        <cylinderGeometry args={[0.045, 0.04, 0.35, 16]} />
        <meshStandardMaterial color="#E09070" roughness={0.7} />
      </mesh>
      <mesh position={[0.30, 0.55, 0]}>
        <cylinderGeometry args={[0.045, 0.04, 0.35, 16]} />
        <meshStandardMaterial color="#E09070" roughness={0.7} />
      </mesh>

      {/* Hands */}
      <mesh position={[-0.32, 0.32, 0]}>
        <boxGeometry args={[0.05, 0.1, 0.02]} />
        <meshStandardMaterial color="#FFC9A8" roughness={0.8} />
      </mesh>
      <mesh position={[0.32, 0.32, 0]}>
        <boxGeometry args={[0.05, 0.1, 0.02]} />
        <meshStandardMaterial color="#FFC9A8" roughness={0.8} />
      </mesh>

      {/* Quadriceps - front thigh */}
      <mesh position={[-0.10, -0.05, 0.04]}>
        <cylinderGeometry args={[0.075, 0.065, 0.5, 16]} />
        <meshStandardMaterial color="#D88060" roughness={0.6} />
      </mesh>
      <mesh position={[0.10, -0.05, 0.04]}>
        <cylinderGeometry args={[0.075, 0.065, 0.5, 16]} />
        <meshStandardMaterial color="#D88060" roughness={0.6} />
      </mesh>

      {/* Knees */}
      <mesh position={[-0.10, -0.35, 0.05]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#E89878" roughness={0.7} />
      </mesh>
      <mesh position={[0.10, -0.35, 0.05]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#E89878" roughness={0.7} />
      </mesh>

      {/* Calves */}
      <mesh position={[-0.10, -0.70, 0]}>
        <cylinderGeometry args={[0.055, 0.045, 0.5, 16]} />
        <meshStandardMaterial color="#E09070" roughness={0.7} />
      </mesh>
      <mesh position={[0.10, -0.70, 0]}>
        <cylinderGeometry args={[0.055, 0.045, 0.5, 16]} />
        <meshStandardMaterial color="#E09070" roughness={0.7} />
      </mesh>

      {/* Ankles */}
      <mesh position={[-0.10, -1.0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08, 16]} />
        <meshStandardMaterial color="#FFC9A8" roughness={0.8} />
      </mesh>
      <mesh position={[0.10, -1.0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08, 16]} />
        <meshStandardMaterial color="#FFC9A8" roughness={0.8} />
      </mesh>

      {/* Feet */}
      <mesh position={[-0.10, -1.08, 0.04]}>
        <boxGeometry args={[0.07, 0.04, 0.14]} />
        <meshStandardMaterial color="#FFC9A8" roughness={0.8} />
      </mesh>
      <mesh position={[0.10, -1.08, 0.04]}>
        <boxGeometry args={[0.07, 0.04, 0.14]} />
        <meshStandardMaterial color="#FFC9A8" roughness={0.8} />
      </mesh>
    </group>
  );
}

// 3D Arrow pointer component
function Arrow3D({ start, end, color }: { start: THREE.Vector3; end: THREE.Vector3; color: string }) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const arrowRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (arrowRef.current) {
      arrowRef.current.position.copy(start);
      arrowRef.current.lookAt(end);
    }
  }, [start, end]);

  return (
    <group ref={arrowRef}>
      {/* Arrow shaft */}
      <mesh position={[0, 0, length / 2]}>
        <cylinderGeometry args={[0.008, 0.008, length - 0.08, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Arrow head */}
      <mesh position={[0, 0, length - 0.04]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.025, 0.08, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// Highlight sphere for body parts
function BodyPartHighlight({ part }: { part: BodyPart }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.15;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={meshRef} position={[part.position3d.x, part.position3d.y, part.position3d.z]}>
      <sphereGeometry args={[0.04, 16, 16]} />
      <meshStandardMaterial
        color="#5B68EE"
        transparent
        opacity={0.6}
        emissive="#5B68EE"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

// 3D Pointer with arrow and label
function BodyPartPointer({ part, index }: { part: BodyPart; index: number }) {
  // Calculate offset position for the pointer label (to the side)
  const offsetDistance = 0.8;
  const angle = (index * (Math.PI * 2)) / 10 + Math.PI / 4; // Distribute around the body
  
  const labelPosition = new THREE.Vector3(
    part.position3d.x + Math.cos(angle) * offsetDistance,
    part.position3d.y,
    part.position3d.z + Math.sin(angle) * offsetDistance
  );

  const bodyPartPosition = new THREE.Vector3(
    part.position3d.x,
    part.position3d.y,
    part.position3d.z
  );

  return (
    <group>
      {/* Highlight on body part */}
      <BodyPartHighlight part={part} />

      {/* Arrow pointing from label to body part */}
      <Arrow3D start={labelPosition} end={bodyPartPosition} color="#5B68EE" />

      {/* Floating label with HTML */}
      <Html position={[labelPosition.x, labelPosition.y, labelPosition.z]} distanceFactor={10}>
        <div className="pointer-events-auto bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-xl px-3 py-2 min-w-[160px] animate-fade-in">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-card-foreground leading-tight">{part.name}</p>
              <p className="text-xs text-muted-foreground leading-tight mt-1">{part.description}</p>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

// Main 3D Scene
function Scene({ selectedParts }: { selectedParts: BodyPart[] }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />
      <pointLight position={[0, 2, 2]} intensity={0.5} />

      {/* Human Body Model */}
      <AnatomicalModel />

      {/* Body Part Pointers */}
      {selectedParts.map((part, index) => (
        <BodyPartPointer key={part.id} part={part} index={index} />
      ))}

      {/* Camera Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={6}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 4}
      />
    </>
  );
}

interface Anatomy3DViewerProps {
  searchQuery: string;
  activeSystem: BodySystem;
}

export const Anatomy3DViewer = ({ searchQuery, activeSystem }: Anatomy3DViewerProps) => {
  const [selectedParts, setSelectedParts] = useState<BodyPart[]>([]);

  // Filter body parts based on search query and active system
  const filteredParts = useMemo(() => {
    const parts = bodyParts.filter(part => part.system.includes(activeSystem));

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matches = parts.filter(
        part =>
          part.name.toLowerCase().includes(query) ||
          part.aliases.some(alias => alias.toLowerCase().includes(query))
      );

      if (matches.length > 0) {
        setSelectedParts(matches);
        if (matches.length === 1) {
          toast.success(`Found: ${matches[0].name}`, {
            description: matches[0].description,
          });
        } else {
          toast.success(`Found ${matches.length} matches`);
        }
        return matches;
      } else {
        setSelectedParts([]);
        toast.error('No body part found', {
          description: 'Try searching for: heart, brain, biceps, etc.',
        });
        return [];
      }
    }

    return [];
  }, [searchQuery, activeSystem]);

  return (
    <div className="relative w-full h-full min-h-[600px] bg-gradient-to-br from-background to-secondary/10 rounded-2xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 0.5, 3.5], fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <Scene selectedParts={filteredParts} />
      </Canvas>

      {/* Help text when no search */}
      {!searchQuery.trim() && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-border pointer-events-none">
          <p className="text-sm text-muted-foreground">
            Type a body part name to locate it • Drag to rotate • Scroll to zoom
          </p>
        </div>
      )}
    </div>
  );
};
