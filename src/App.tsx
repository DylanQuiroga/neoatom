import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Scene from './components/3d/scene';
import OverlayHUD from './components/ui/overlayhud';
import Atom2D from './components/ui/Atom2D';
import LoadingScreen from './components/ui/LoadingScreen';
import { useAtomStore, ParticleType } from './store/useAtomStore';

function App() {
  const addParticle = useAtomStore((state) => state.addParticle);
  const viewMode = useAtomStore((state) => state.viewMode);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necesario para permitir el drop
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('particleType') as ParticleType;
    if (type === 'proton' || type === 'neutron' || type === 'electron') {
      addParticle(type);
    }
  };

  return (
    <div 
      className="w-screen h-[100dvh] bg-gray-950 relative overflow-hidden flex"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Pantalla de Carga Global */}
      <LoadingScreen />

      {/* Condicional de Vista */}
      {viewMode === '2d' ? (
        <Atom2D />
      ) : (
        <div className="absolute inset-0 w-full h-full">
            <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 12] }}>
              <color attach="background" args={['#030712']} />
              <OrbitControls 
                enablePan={false}  // Deshabilitar pan evitará que el left-click (mapeado a Pan) haga algo
                enableZoom={true} 
                enableRotate={true}
                /* Hacemos que RIGHT click haga ROTATE (orbitar) y dejamos LEFT mapeado a Pan (desactivado) */
                mouseButtons={{
                  LEFT: 2, // 2 = pan, como está deshabilitado no hace nada
                  MIDDLE: 1, // 1 = zoom
                  RIGHT: 0 // 0 = rotate
                }}
              />
              <Suspense fallback={null}>
                <Scene />
              </Suspense>
            </Canvas>
        </div>
      )}

      {/* Capa 2D: Interfaz de Usuario y HUD principal (Al final para estar encima) */}
      <OverlayHUD />
    </div>
  )
}

export default App