import { useAtomStore } from '../../store/useAtomStore';
import { useMemo, useState } from 'react';

export default function Atom2D() {
  const { protons, neutrons, electrons, isPaused, speed } = useAtomStore();
  const [zoom, setZoom] = useState(1);

  const totalParticles = protons + neutrons;
  const nucleusRadius = Math.max(20, Math.min(50, totalParticles * 2));

  // Determine electron shells
  const shells = useMemo(() => {
    let remaining = electrons;
    const config = [];
    let n = 1;
    while(remaining > 0) {
      const maxInShell = 2 * (n * n);
      const inThisShell = Math.min(remaining, maxInShell);
      config.push({ n, count: inThisShell, radius: 60 + n * 40 });
      remaining -= inThisShell;
      n++;
    }
    return config;
  }, [electrons]);

  const cx = 250;
  const cy = 250;

  const handleWheel = (e: React.WheelEvent) => {
    // Si deltaY es positivo (hacia abajo), alejamos (menor zoom). Si es negativo, acercamos (mayor zoom).
    setZoom((prev) => Math.min(Math.max(0.3, prev - e.deltaY * 0.002), 5));
  };

  const viewBoxSize = 500 / zoom;
  const viewBoxOffset = 250 - viewBoxSize / 2;

  return (
    <div 
      className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-auto"
      onWheel={handleWheel}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`${viewBoxOffset} ${viewBoxOffset} ${viewBoxSize} ${viewBoxSize}`} 
        className="overflow-visible"
      >
        {/* Capas y Electrones agrupados por shell para sincronía */}
        {shells.map((shell) => (
          <g 
            key={`shell-${shell.n}`} 
            style={!isPaused ? { transformOrigin: `${cx}px ${cy}px`, animation: `spin ${10 / (speed * shell.n)}s linear infinite` } : {}}
          >
            {/* Órbita */}
            <circle 
              cx={cx} 
              cy={cy} 
              r={shell.radius} 
              fill="none" 
              stroke="rgba(255,255,255,0.15)" 
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            {/* Electrones de esta capa */}
            {Array.from({ length: shell.count }).map((_, j) => {
              const angle = (j / shell.count) * Math.PI * 2;
              return (
                <circle 
                  key={`el-${shell.n}-${j}`}
                  cx={cx + Math.cos(angle) * shell.radius} 
                  cy={cy + Math.sin(angle) * shell.radius} 
                  r={5} 
                  fill="#facc15" 
                  className="drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]"
                />
              );
            })}
          </g>
        ))}

        {/* Núcleo (Agrupamos 2D de forma aproximada) */}
        <g>
            {/* Fondo simulado o partículas individuales si no son muchas */}
            {totalParticles <= 50 ? (
                Array.from({ length: totalParticles }).map((_, i) => {
                    // Randomizamos usando el índice para generar una distribución en espiral de phyllotaxis 2D
                    const c = 5;
                    const index = i + 1;
                    const a = index * 137.5 * (Math.PI / 180);
                    const r = c * Math.sqrt(index) * 0.8;
                    const type = i < protons ? 'proton' : 'neutron';
                    const color = type === 'proton' ? '#ef4444' : '#3b82f6';
                    
                    return (
                        <circle 
                          key={`nuc-${i}`} 
                          cx={cx + r * Math.cos(a)} 
                          cy={cy + r * Math.sin(a)} 
                          r={6} 
                          fill={color} 
                          className="drop-shadow-lg"
                        />
                    );
                })
            ) : (
                <>
                    {/* Si son demasiadas partículas, dibujar una masa consolidada para no laggear SVG */}
                    <circle cx={cx} cy={cy} r={nucleusRadius} fill="url(#nucleus-grad)" />
                    <text x={cx} y={cy} textAnchor="middle" dy=".3em" fill="white" fontSize="12px" fontWeight="bold">
                        {protons}p {neutrons}n
                    </text>
                </>
            )}
        </g>
        
        {/* Defs */}
        <defs>
          <radialGradient id="nucleus-grad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>
        </defs>
      </svg>
      {/* Estilos dinámicos para el spin, para que funcione bien la base de la animación */}
      <style>{`
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
