import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAtomStore, ParticleType } from '../../store/useAtomStore';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// Constantes visuales
const PARTICLE_SIZE = 0.4;
const NUCLEUS_RADIUS = 0.5;

function Nucleus({ protons, neutrons }: { protons: number, neutrons: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const totalParticles = protons + neutrons;
  const isPaused = useAtomStore(state => state.isPaused);
  const speedMultiplier = useAtomStore(state => state.speed);

  // Calculamos posiciones aleatorias agrupadas (Phyllotaxis esférica o Espiral Dorada 3D)
  const particles = useMemo(() => {
    const list = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    // Generar array interpolado de tipos para mezclarlos uniformemente
    const types: ParticleType[] = [];
    for(let i=0; i<protons; i++) types.push('proton');
    for(let i=0; i<neutrons; i++) types.push('neutron');
    // Fisher-Yates shuffle para mezclar neutrones y protones bien
    for (let i = types.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [types[i], types[j]] = [types[j], types[i]];
    }

    for (let i = 0; i < totalParticles; i++) {
        const y = 1 - (i / (totalParticles - 1 || 1)) * 2; // y goes from 1 to -1
        const radius = Math.sqrt(1 - y * y); // radius at y
        const theta = phi * i;

        // Scale to our target visual bounds
        const scale = NUCLEUS_RADIUS * Math.cbrt(totalParticles/2) * 0.8;
        
        list.push({
            type: types[i],
            position: new THREE.Vector3(
              Math.cos(theta) * radius * scale,
              y * scale,
              Math.sin(theta) * radius * scale
            )
        });
    }

    return list;
  }, [protons, neutrons, totalParticles]);

  useFrame((_state, delta) => {
    if (groupRef.current && !isPaused) {
      groupRef.current.rotation.y += delta * 0.2 * speedMultiplier;
      groupRef.current.rotation.x += delta * 0.1 * speedMultiplier;
    }
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={`nuc-${i}`} position={p.position}>
          {/* Reduced segments from 32x32 to 12x12 for 85% less geometry overhead */}
          <sphereGeometry args={[PARTICLE_SIZE, 12, 12]} />
          {/* Swapped from heavy PhysicalMaterial to StandardMaterial */}
          <meshStandardMaterial 
            color={p.type === 'proton' ? '#ef4444' : '#3b82f6'} 
            roughness={0.4}
            metalness={0.2}
            emissive={p.type === 'proton' ? '#450a0a' : '#172554'}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

function Electrons({ count }: { count: number }) {
    const shells = useMemo(() => {
        // Modelo simplificado (2, 8, 18, 32...)
        let remaining = count;
        const shellConfig = [];
        let n = 1;
        while(remaining > 0) {
            const maxInShell = 2 * (n * n);
            const inThisShell = Math.min(remaining, maxInShell);
            shellConfig.push({ n, count: inThisShell });
            remaining -= inThisShell;
            n++;
        }
        return shellConfig;
    }, [count]);

    return (
        <group>
            {shells.map((shell, shellIndex) => (
                <ElectronShell key={`shell-${shellIndex}`} shellIndex={shell.n} count={shell.count} />
            ))}
        </group>
    );
}

function ElectronShell({ shellIndex, count }: { shellIndex: number, count: number }) {
    const groupRef = useRef<THREE.Group>(null);
    const radius = 2.5 + shellIndex * 1.5;
    const baseSpeed = 1.5 / shellIndex; 
    const isPaused = useAtomStore(state => state.isPaused);
    const speedMultiplier = useAtomStore(state => state.speed);
    const flatOrbits = useAtomStore(state => state.flatOrbits);

    const electrons = useMemo(() => {
        const list = [];
        for(let i=0; i<count; i++) {
            const angle = (i / count) * Math.PI * 2;
            list.push({ angle });
        }
        return list;
    }, [count]);

    useFrame((_state, delta) => {
        if (groupRef.current) {
            if (!isPaused) {
              // Rotar la capa entera
              groupRef.current.rotation.y += delta * baseSpeed * speedMultiplier;
            }
            if (flatOrbits) {
              groupRef.current.rotation.x = 0;
              groupRef.current.rotation.z = 0;
            } else {
              // Inclinar un poco cada capa diferente (constante)
              groupRef.current.rotation.x = shellIndex * Math.PI / 4;
              groupRef.current.rotation.z = shellIndex * Math.PI / 6;
            }
        }
    });

    return (
        <group ref={groupRef}>
            {/* Anillo visual para la órbita */}
            <mesh rotation={[Math.PI/2, 0, 0]}>
                {/* Reduced from 16x100 to 4x48 segments */}
                <torusGeometry args={[radius, 0.02, 4, 48]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
            </mesh>

            {/* Los electrones */}
            {electrons.map((e, i) => (
                <mesh key={`el-${i}`} position={[Math.cos(e.angle) * radius, 0, Math.sin(e.angle) * radius]}>
                    {/* Reduced segments from 16x16 to 8x8 */}
                    <sphereGeometry args={[PARTICLE_SIZE * 0.6, 8, 8]} />
                    {/* Swapped from heavy PhysicalMaterial to StandardMaterial */}
                    <meshStandardMaterial 
                        color="#facc15" 
                        emissive="#facc15"
                        emissiveIntensity={2}
                        toneMapped={false}
                    />
                </mesh>
            ))}
        </group>
    );
}

export default function Scene() {
  const { protons, neutrons, electrons } = useAtomStore();

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} color="#4f46e5" intensity={0.5} />
      
      <group>
        <Nucleus protons={protons} neutrons={neutrons} />
        <Electrons count={electrons} />
      </group>

      <EffectComposer>
        {/* Switched to mipmapBlur for faster mobile bloom instead of fixed height */}
        <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} mipmapBlur intensity={1.5} />
      </EffectComposer>
    </>
  );
}
