import { useGLTF } from '@react-three/drei';
import { useEffect } from 'react';

// Free anatomical models you can use:
// Option 1: https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/models/gltf/RobotExpressive/RobotExpressive.glb
// Option 2: Download from sites like Sketchfab (free models with CC license)
// Option 3: Use BioDigital Human API
// For demo, we'll create a more detailed procedural model

export function AnatomicalModel() {
  // For production, you would load a real model like this:
  // const { scene } = useGLTF('/models/human-anatomy.glb');
  // return <primitive object={scene} scale={1.5} position={[0, -1, 0]} />;

  // Enhanced procedural model with much more detail
  return (
    <group>
      {/* SKELETAL STRUCTURE */}
      
      {/* Skull - more detailed */}
      <group position={[0, 1.65, 0]}>
        <mesh>
          <sphereGeometry args={[0.13, 32, 32]} />
          <meshStandardMaterial color="#F5E6D3" roughness={0.9} metalness={0.0} />
        </mesh>
        {/* Eye sockets */}
        <mesh position={[-0.04, 0.02, 0.11]}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[0.04, 0.02, 0.11]}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        {/* Nose */}
        <mesh position={[0, -0.02, 0.13]}>
          <coneGeometry args={[0.015, 0.03, 8]} />
          <meshStandardMaterial color="#F5E6D3" />
        </mesh>
      </group>

      {/* Cervical Spine (Neck vertebrae) */}
      <mesh position={[0, 1.42, -0.03]}>
        <cylinderGeometry args={[0.03, 0.04, 0.2, 8]} />
        <meshStandardMaterial color="#E8DCC8" roughness={0.8} />
      </mesh>

      {/* MUSCULAR SYSTEM - Much more detailed */}
      
      {/* Sternocleidomastoid (neck muscles) */}
      <mesh position={[-0.03, 1.38, 0.02]} rotation={[0.2, 0.3, 0.1]}>
        <cylinderGeometry args={[0.015, 0.02, 0.18, 8]} />
        <meshStandardMaterial color="#C85A54" roughness={0.7} />
      </mesh>
      <mesh position={[0.03, 1.38, 0.02]} rotation={[0.2, -0.3, -0.1]}>
        <cylinderGeometry args={[0.015, 0.02, 0.18, 8]} />
        <meshStandardMaterial color="#C85A54" roughness={0.7} />
      </mesh>

      {/* Trapezius - upper back/shoulder muscles */}
      <mesh position={[0, 1.25, -0.05]}>
        <boxGeometry args={[0.42, 0.18, 0.12]} />
        <meshStandardMaterial color="#D86860" roughness={0.6} />
      </mesh>

      {/* Deltoids - shoulder caps */}
      <mesh position={[-0.26, 1.22, 0]} rotation={[0, 0, 0.4]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color="#C85A54" roughness={0.6} />
      </mesh>
      <mesh position={[0.26, 1.22, 0]} rotation={[0, 0, -0.4]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color="#C85A54" roughness={0.6} />
      </mesh>

      {/* Pectoralis Major - chest muscles */}
      <mesh position={[-0.08, 1.1, 0.08]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.15, 0.22, 0.08]} />
        <meshStandardMaterial color="#D86860" roughness={0.6} />
      </mesh>
      <mesh position={[0.08, 1.1, 0.08]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[0.15, 0.22, 0.08]} />
        <meshStandardMaterial color="#D86860" roughness={0.6} />
      </mesh>

      {/* Serratus Anterior - side ribs */}
      <mesh position={[-0.16, 1.0, 0.04]} rotation={[0, 0.3, 0.2]}>
        <boxGeometry args={[0.06, 0.25, 0.08]} />
        <meshStandardMaterial color="#C05850" roughness={0.7} />
      </mesh>
      <mesh position={[0.16, 1.0, 0.04]} rotation={[0, -0.3, -0.2]}>
        <boxGeometry args={[0.06, 0.25, 0.08]} />
        <meshStandardMaterial color="#C05850" roughness={0.7} />
      </mesh>

      {/* Rectus Abdominis - 6-pack abs with individual segments */}
      {[0, 1, 2].map((i) => (
        <group key={`abs-${i}`}>
          <mesh position={[-0.06, 0.85 - i * 0.12, 0.11]}>
            <boxGeometry args={[0.06, 0.08, 0.06]} />
            <meshStandardMaterial color="#D07068" roughness={0.5} />
          </mesh>
          <mesh position={[0.06, 0.85 - i * 0.12, 0.11]}>
            <boxGeometry args={[0.06, 0.08, 0.06]} />
            <meshStandardMaterial color="#D07068" roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* External Obliques - side abs */}
      <mesh position={[-0.15, 0.7, 0.06]} rotation={[0, 0.3, 0.3]}>
        <boxGeometry args={[0.08, 0.3, 0.1]} />
        <meshStandardMaterial color="#C86058" roughness={0.6} />
      </mesh>
      <mesh position={[0.15, 0.7, 0.06]} rotation={[0, -0.3, -0.3]}>
        <boxGeometry args={[0.08, 0.3, 0.1]} />
        <meshStandardMaterial color="#C86058" roughness={0.6} />
      </mesh>

      {/* Latissimus Dorsi - back muscles */}
      <mesh position={[0, 0.85, -0.08]}>
        <boxGeometry args={[0.38, 0.4, 0.12]} />
        <meshStandardMaterial color="#B85850" roughness={0.7} />
      </mesh>

      {/* Biceps Brachii - front upper arm */}
      <mesh position={[-0.28, 0.95, 0.02]}>
        <cylinderGeometry args={[0.045, 0.04, 0.28, 12]} />
        <meshStandardMaterial color="#C85A54" roughness={0.6} />
      </mesh>
      <mesh position={[0.28, 0.95, 0.02]}>
        <cylinderGeometry args={[0.045, 0.04, 0.28, 12]} />
        <meshStandardMaterial color="#C85A54" roughness={0.6} />
      </mesh>

      {/* Triceps - back upper arm */}
      <mesh position={[-0.28, 0.95, -0.04]}>
        <cylinderGeometry args={[0.04, 0.038, 0.28, 12]} />
        <meshStandardMaterial color="#B85850" roughness={0.6} />
      </mesh>
      <mesh position={[0.28, 0.95, -0.04]}>
        <cylinderGeometry args={[0.04, 0.038, 0.28, 12]} />
        <meshStandardMaterial color="#B85850" roughness={0.6} />
      </mesh>

      {/* Forearm muscles - Flexors and Extensors */}
      <mesh position={[-0.31, 0.6, 0.02]}>
        <cylinderGeometry args={[0.038, 0.032, 0.32, 12]} />
        <meshStandardMaterial color="#D07068" roughness={0.7} />
      </mesh>
      <mesh position={[0.31, 0.6, 0.02]}>
        <cylinderGeometry args={[0.038, 0.032, 0.32, 12]} />
        <meshStandardMaterial color="#D07068" roughness={0.7} />
      </mesh>

      {/* Hands with fingers */}
      <mesh position={[-0.33, 0.38, 0.02]}>
        <boxGeometry args={[0.04, 0.08, 0.02]} />
        <meshStandardMaterial color="#F5C8B8" roughness={0.9} />
      </mesh>
      <mesh position={[0.33, 0.38, 0.02]}>
        <boxGeometry args={[0.04, 0.08, 0.02]} />
        <meshStandardMaterial color="#F5C8B8" roughness={0.9} />
      </mesh>

      {/* Gluteus Maximus - buttocks */}
      <mesh position={[0, 0.35, -0.06]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#C05850" roughness={0.7} />
      </mesh>

      {/* Quadriceps Femoris - 4 muscles in front thigh */}
      <group>
        {/* Rectus Femoris */}
        <mesh position={[-0.09, 0.0, 0.06]}>
          <cylinderGeometry args={[0.055, 0.05, 0.48, 12]} />
          <meshStandardMaterial color="#D07068" roughness={0.6} />
        </mesh>
        <mesh position={[0.09, 0.0, 0.06]}>
          <cylinderGeometry args={[0.055, 0.05, 0.48, 12]} />
          <meshStandardMaterial color="#D07068" roughness={0.6} />
        </mesh>
        
        {/* Vastus Lateralis - outer thigh */}
        <mesh position={[-0.13, 0.0, 0.03]}>
          <cylinderGeometry args={[0.048, 0.045, 0.48, 12]} />
          <meshStandardMaterial color="#C86058" roughness={0.6} />
        </mesh>
        <mesh position={[0.13, 0.0, 0.03]}>
          <cylinderGeometry args={[0.048, 0.045, 0.48, 12]} />
          <meshStandardMaterial color="#C86058" roughness={0.6} />
        </mesh>
      </group>

      {/* Hamstrings - back of thigh */}
      <mesh position={[-0.10, 0.0, -0.04]}>
        <cylinderGeometry args={[0.048, 0.045, 0.48, 12]} />
        <meshStandardMaterial color="#B05048" roughness={0.7} />
      </mesh>
      <mesh position={[0.10, 0.0, -0.04]}>
        <cylinderGeometry args={[0.048, 0.045, 0.48, 12]} />
        <meshStandardMaterial color="#B05048" roughness={0.7} />
      </mesh>

      {/* Patella - kneecaps */}
      <mesh position={[-0.09, -0.28, 0.08]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color="#E8DCC8" roughness={0.8} />
      </mesh>
      <mesh position={[0.09, -0.28, 0.08]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color="#E8DCC8" roughness={0.8} />
      </mesh>

      {/* Gastrocnemius - calf muscles (2 heads each) */}
      <mesh position={[-0.09, -0.55, -0.02]}>
        <cylinderGeometry args={[0.045, 0.035, 0.35, 12]} />
        <meshStandardMaterial color="#C85A54" roughness={0.6} />
      </mesh>
      <mesh position={[0.09, -0.55, -0.02]}>
        <cylinderGeometry args={[0.045, 0.035, 0.35, 12]} />
        <meshStandardMaterial color="#C85A54" roughness={0.6} />
      </mesh>

      {/* Soleus - deeper calf muscle */}
      <mesh position={[-0.09, -0.58, -0.01]}>
        <cylinderGeometry args={[0.038, 0.032, 0.28, 12]} />
        <meshStandardMaterial color="#B05048" roughness={0.7} />
      </mesh>
      <mesh position={[0.09, -0.58, -0.01]}>
        <cylinderGeometry args={[0.038, 0.032, 0.28, 12]} />
        <meshStandardMaterial color="#B05048" roughness={0.7} />
      </mesh>

      {/* Tibialis Anterior - shin muscles */}
      <mesh position={[-0.09, -0.58, 0.04]}>
        <cylinderGeometry args={[0.025, 0.022, 0.32, 10]} />
        <meshStandardMaterial color="#C86860" roughness={0.7} />
      </mesh>
      <mesh position={[0.09, -0.58, 0.04]}>
        <cylinderGeometry args={[0.025, 0.022, 0.32, 10]} />
        <meshStandardMaterial color="#C86860" roughness={0.7} />
      </mesh>

      {/* Achilles tendon */}
      <mesh position={[-0.09, -0.80, -0.02]}>
        <cylinderGeometry args={[0.015, 0.018, 0.12, 8]} />
        <meshStandardMaterial color="#F5E6D3" roughness={0.9} />
      </mesh>
      <mesh position={[0.09, -0.80, -0.02]}>
        <cylinderGeometry args={[0.015, 0.018, 0.12, 8]} />
        <meshStandardMaterial color="#F5E6D3" roughness={0.9} />
      </mesh>

      {/* Feet with more detail */}
      <mesh position={[-0.09, -0.92, 0.05]}>
        <boxGeometry args={[0.07, 0.04, 0.16]} />
        <meshStandardMaterial color="#F5C8B8" roughness={0.9} />
      </mesh>
      <mesh position={[0.09, -0.92, 0.05]}>
        <boxGeometry args={[0.07, 0.04, 0.16]} />
        <meshStandardMaterial color="#F5C8B8" roughness={0.9} />
      </mesh>

      {/* INTERNAL ORGANS (visible through transparency option) */}
      
      {/* Heart */}
      <mesh position={[-0.03, 1.0, 0.05]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#8B0000" roughness={0.8} transparent opacity={0} />
      </mesh>

      {/* Lungs */}
      <mesh position={[-0.08, 1.05, 0.02]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#FFC0CB" roughness={0.8} transparent opacity={0} />
      </mesh>
      <mesh position={[0.08, 1.05, 0.02]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#FFC0CB" roughness={0.8} transparent opacity={0} />
      </mesh>
    </group>
  );
}
