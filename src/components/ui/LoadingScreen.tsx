import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { Atom } from 'lucide-react';

export default function LoadingScreen() {
  const { active, progress } = useProgress();
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    // Si la carga de r3f se completa o el porcentaje llega a 100
    if (!active || progress === 100) {
      setIsFadingOut(true);
      // Dar tiempo para la animación de salida antes de desmontar
      setTimeout(() => setIsMounted(false), 800); 
    }
  }, [active, progress]);

  if (!isMounted) return null;

  return (
    <div 
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#030712] transition-opacity duration-700 ease-in-out ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          <Atom className="w-16 h-16 text-blue-500 animate-spin-slow opacity-80" />
          <div className="absolute inset-0 rounded-full border-t-2 border-blue-400 animate-spin" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-[-8px] rounded-full border-b-2 border-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-widest">
            NeoAtom
          </h1>
          
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
              style={{ width: `${Math.max(10, progress)}%` }}
            />
          </div>
          <span className="text-white/50 text-xs mt-1 font-mono tracking-widest">
             CARGANDO NÚCLEO... {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
}
