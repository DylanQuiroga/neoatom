import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useAtomStore, ParticleType } from '../../store/useAtomStore';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { PerformanceMonitor } from '@react-three/drei';

// Constantes visuales
const PARTICLE_SIZE = 0.4;
const NUCLEUS_RADIUS = 0.5;

// Geometrías compartidas para evitar recreación
const sphereGeom = new THREE.SphereGeometry(PARTICLE_SIZE, 12, 12);
const electronGeom = new THREE.SphereGeometry(PARTICLE_SIZE * 0.6, 8, 8);
const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

function Nucleus({ protons, neutrons }: { protons: number, neutrons: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const totalParticles = protons + neutrons;
  const isPaused = useAtomStore(state => state.isPaused);
  const speedMultiplier = useAtomStore(state => state.speed);

  const particles = useMemo(() => {
    const list = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    const types: ParticleType[] = [];
    for(let i=0; i<protons; i++) types.push('proton');
    for(let i=0; i<neutrons; i++) types.push('neutron');
    
    for (let i = types.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [types[i], types[j]] = [types[j], types[i]];
    }

    const scale = NUCLEUS_RADIUS * Math.cbrt(totalParticles/2) * 0.8;

    for (let i = 0; i < totalParticles; i++) {
        const y = 1 - (i / (totalParticles - 1 || 1)) * 2;
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = phi * i;
        
        list.push({
            type: types[i],
            pos: [
              Math.cos(theta) * radiusAtY * scale,
              y * scale,
              Math.sin(theta) * radiusAtY * scale
            ]
        });
    }
    return list;
  }, [protons, neutrons, totalParticles]);

  const rotationXRef = useRef(0);
  const rotationYRef = useRef(0);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    if (!isPaused) {
      rotationYRef.current += delta * 0.2 * speedMultiplier;
      rotationXRef.current += delta * 0.1 * speedMultiplier;
      meshRef.current.rotation.y = rotationYRef.current;
      meshRef.current.rotation.x = rotationXRef.current;
    }

    particles.forEach((p, i) => {
      tempObject.position.set(p.pos[0], p.pos[1], p.pos[2]);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
      
      const color = p.type === 'proton' ? '#ef4444' : '#3b82f6';
      tempColor.set(color);
      meshRef.current!.setColorAt(i, tempColor);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[sphereGeom, undefined, totalParticles]}>
      <meshStandardMaterial 
        roughness={0.4}
        metalness={0.2}
        emissive="#111111"
        emissiveIntensity={0.5}
      />
    </instancedMesh>
  );
}

function ElectronShell({ shellIndex, count }: { shellIndex: number, count: number }) {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const radius = 2.5 + shellIndex * 1.5;
    const baseSpeed = 1.5 / shellIndex; 
    const isPaused = useAtomStore(state => state.isPaused);
    const speedMultiplier = useAtomStore(state => state.speed);
    const flatOrbits = useAtomStore(state => state.flatOrbits);

    useEffect(() => {
        if (!meshRef.current) return;
        for(let i=0; i<count; i++) {
            const angle = (i / count) * Math.PI * 2;
            tempObject.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
            tempObject.updateMatrix();
            meshRef.current.setMatrixAt(i, tempObject.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [count, radius]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        if (!isPaused) {
            // Usamos elapsedTime para una rotación perfectamente suave y constante
            const time = state.clock.getElapsedTime();
            groupRef.current.rotation.y = time * baseSpeed * speedMultiplier;
        }

        // Determinar ángulos objetivo
        const targetX = flatOrbits ? 0 : shellIndex * Math.PI / 4;
        const targetZ = flatOrbits ? 0 : shellIndex * Math.PI / 6;

        // Interpolar suavemente hacia los ángulos objetivo (lerp)
        const lerpFactor = 5 * delta; // Ajusta este valor para más rápido o lento
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, lerpFactor);
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetZ, lerpFactor);
    });

    return (
        <group ref={groupRef}>
            <mesh rotation={[Math.PI/2, 0, 0]}>
                {/* Aumentamos segmentos para que se vea circular */}
                <torusGeometry args={[radius, 0.015, 16, 128]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
            </mesh>
            
            <instancedMesh ref={meshRef} args={[electronGeom, undefined, count]}>
                <meshStandardMaterial 
                    color="#facc15" 
                    emissive="#facc15"
                    emissiveIntensity={1.2}
                    toneMapped={false}
                />
            </instancedMesh>
        </group>
    );
}

function Electrons({ count }: { count: number }) {
    const shells = useMemo(() => {
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

export default function Scene() {
  const { protons, neutrons, electrons } = useAtomStore();
  const [highQuality, setHighQuality] = useState(true);
  const { setDpr } = useThree();

  return (
    <>
      <PerformanceMonitor 
        onDecline={() => {
          setHighQuality(false);
          setDpr(1);
        }} 
        onIncline={() => {
          setHighQuality(true);
          setDpr(1.5);
        }}
      />

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} color="#4f46e5" intensity={0.5} />
      
      <group>
        <Nucleus protons={protons} neutrons={neutrons} />
        <Electrons count={electrons} />
      </group>

      <EffectComposer enableNormalPass={false}>
        {highQuality ? (
          <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} mipmapBlur intensity={1.5} />
        ) : (
          <></>
        )}
      </EffectComposer>
    </>
  );
}
