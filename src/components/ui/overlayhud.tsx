import React, { useState, useEffect } from 'react';
import { useAtomStore, ParticleType } from '../../store/useAtomStore';
import { getElementData } from '../../utils/elements';
import { Atom, Play, Pause, List, ChevronUp, ChevronDown, Flame, Radiation, Skull, Droplet, EyeOff, Info } from 'lucide-react';
import atomsData from '../../data/atoms.json';

const ParticleDispenser = ({ type, color, label, onClick }: { type: ParticleType, color: string, label: string, onClick: () => void }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('particleType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl cursor-pointer active:scale-95 backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 shadow-lg hover:shadow-${color}-500/20 max-w-[85px] sm:max-w-[120px] w-full mt-auto`}
    >
      <div className={`w-6 h-6 sm:w-10 sm:h-10 rounded-full mb-1 sm:mb-3 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${color} border border-white/20`} />
      <span className="text-white font-medium text-[10px] sm:text-sm tracking-wider uppercase">{label}</span>
      <span className="text-white/50 text-[8px] sm:text-xs mt-1 text-center leading-tight hidden sm:block">Tocar o Arrastrar</span>
      <span className="text-white/50 text-[8px] sm:text-xs mt-1 text-center leading-tight sm:hidden">+ 1</span>
    </div>
  );
};

const OverlayHUD = () => {
  const { protons, neutrons, electrons, addParticle, removeParticle, resetAtom, isPaused, togglePause, speed, setSpeed, viewMode, setViewMode, loadAtom, flatOrbits, toggleFlatOrbits } = useAtomStore();
  const [isListOpen, setIsListOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(true);
  const [isControlsOpen, setIsControlsOpen] = useState(true);

  const element = getElementData(protons);
  const massNumber = protons + neutrons;
  const netCharge = protons - electrons;

  const displayCharge = netCharge === 0 ? '0' : netCharge > 0 ? `+${netCharge}` : `${netCharge}`;

  const hazards = element?.hazards || [];

  const hazardConfig = [
    { id: 'Inflamable', label: 'Inflamable', Icon: Flame, activeClass: 'text-orange-400 bg-orange-500/20 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.4)]' },
    { id: 'Corrosivo', label: 'Corrosivo', Icon: Droplet, activeClass: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30 shadow-[0_0_15px_rgba(250,204,21,0.4)]' },
    { id: 'Tóxico', label: 'Tóxico', Icon: Skull, activeClass: 'text-purple-400 bg-purple-500/20 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.4)]' },
    { id: 'Radioactivo', label: 'Radiactivo', Icon: Radiation, activeClass: 'text-green-400 bg-green-500/20 border-green-500/30 shadow-[0_0_15px_rgba(74,222,128,0.4)]' }
  ];

  const [isUiVisible, setIsUiVisible] = useState(true);
  const [showUiHint, setShowUiHint] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (showUiHint) {
      timeout = setTimeout(() => setShowUiHint(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showUiHint]);

  useEffect(() => {
    let tooltipTimeout: ReturnType<typeof setTimeout>;
    if (activeTooltip) {
      tooltipTimeout = setTimeout(() => setActiveTooltip(null), 2500);
    }
    return () => clearTimeout(tooltipTimeout);
  }, [activeTooltip]);

  useEffect(() => {
    const handleRestoreUI = () => {
      if (!isUiVisible) {
        setIsUiVisible(true);
      }
    };

    window.addEventListener('keydown', handleRestoreUI);
    window.addEventListener('dblclick', handleRestoreUI);
    // Para touch (doble tap)
    let lastTap = 0;
    const handleTouchEnd = (e: TouchEvent) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 500 && tapLength > 0) {
        handleRestoreUI();
        e.preventDefault();
      }
      lastTap = currentTime;
    };
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleRestoreUI);
      window.removeEventListener('dblclick', handleRestoreUI);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isUiVisible]);

  const handleHideUI = () => {
    setIsUiVisible(false);
    setShowUiHint(true);
  };

  if (!isUiVisible) {
    return (
      <div className="absolute inset-0 pointer-events-none z-50 flex items-start justify-center p-8">
        {showUiHint && (
          <div className="bg-black/80 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full shadow-2xl animate-fade-in-out flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium tracking-wide">
              Mueve el ratón o presiona cualquier tecla (Doble toque en móvil) para volver.
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 pb-12 sm:pb-8 sm:p-8 font-sans animate-in fade-in duration-300">
      {/* Header Info Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start pointer-events-none gap-2 sm:gap-4 w-full">
        {/* Mobile Header Nav (Only visible on mobile) */}
        <div className="flex w-full justify-between sm:hidden pointer-events-auto gap-2">
          <button
            onClick={() => setIsInfoOpen(!isInfoOpen)}
            className="flex-1 flex items-center justify-center gap-2 p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-white/70 hover:text-white transition-colors"
          >
            <Atom className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold tracking-wider">Info del elemento</span>
            {isInfoOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={() => setIsControlsOpen(!isControlsOpen)}
            className="flex-1 flex items-center justify-center gap-2 p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-white/70 hover:text-white transition-colors"
          >
            <span className="text-xs font-semibold tracking-wider">Ajustes</span>
            {isControlsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Info Panel Wrap */}
        <div className="flex flex-col gap-2 w-full sm:w-auto pointer-events-auto">
          <div className={`${isInfoOpen ? 'flex' : 'hidden sm:flex'} flex-col bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-6 text-white w-full sm:min-w-[300px] shadow-2xl flex-1 max-w-full sm:max-w-md transition-all`}>
            <div className="flex items-center justify-between mb-2 sm:mb-4 border-b border-white/10 pb-2 sm:pb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <Atom className="text-blue-400 w-5 h-5 sm:w-8 sm:h-8" />
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent leading-none">
                  NeoAtom
                </h1>
              </div>
              <button onClick={() => setIsInfoOpen(!isInfoOpen)} className="hidden sm:block text-white/40 hover:text-white">
                {isInfoOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            {isInfoOpen && (
              <>
                <div className="flex items-end gap-2 sm:gap-4 mb-1 sm:mb-4">
                  <div className="text-4xl sm:text-7xl font-light tracking-tighter leading-none">
                    {element ? element.symbol : '?'}
                    {netCharge !== 0 && (
                      <sup className="text-lg sm:text-2xl font-medium text-blue-300 ml-1">{displayCharge}</sup>
                    )}
                  </div>
                  <div className="flex flex-col mb-1 sm:mb-2 text-white/60">
                    <span className="text-xs sm:text-sm uppercase tracking-widest font-semibold">{massNumber}</span>
                    <span className="text-xs sm:text-sm uppercase tracking-widest font-semibold">{protons}</span>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-semibold mb-1">{element ? element.name : 'Vacio'}</h2>
                <p className="text-xs sm:text-sm text-white/50 mb-4 sm:mb-6 uppercase tracking-wider font-medium">
                  {element ? element.category : 'Agrega protones para empezar'}
                </p>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 border-t border-white/10 pt-4 sm:pt-6">
                  <div className="flex flex-col">
                    <span className="text-white/50 text-[10px] sm:text-xs tracking-wider mb-1">PROTONES</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg sm:text-xl font-medium">{protons}</span>
                      {protons > 0 && (
                        <button onClick={() => removeParticle('proton')} className="text-white/30 hover:text-red-400 transition-colors cursor-pointer active:scale-95">-</button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white/50 text-[10px] sm:text-xs tracking-wider mb-1">NEUTRONES</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg sm:text-xl font-medium">{neutrons}</span>
                      {neutrons > 0 && (
                        <button onClick={() => removeParticle('neutron')} className="text-white/30 hover:text-blue-400 transition-colors cursor-pointer active:scale-95">-</button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white/50 text-[10px] sm:text-xs tracking-wider mb-1">ELECTRONES</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg sm:text-xl font-medium">{electrons}</span>
                      {electrons > 0 && (
                        <button onClick={() => removeParticle('electron')} className="text-white/30 hover:text-yellow-400 transition-colors cursor-pointer active:scale-95">-</button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Controls Panel Wrap */}
        <div className="flex flex-col gap-2 pointer-events-auto w-full sm:w-auto">

          <div className={`${isControlsOpen ? 'flex' : 'hidden sm:flex'} flex-col bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 text-white gap-4 shadow-2xl transition-all`}>
            <div className="hidden sm:flex justify-between items-center mb-1 border-b border-white/10 pb-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-white/50">Controles</span>
              <button onClick={() => setIsControlsOpen(!isControlsOpen)} className="text-white/40 hover:text-white">
                {isControlsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {isControlsOpen && (
              <>
                <div className="flex gap-2">
                  <button
                    onClick={togglePause}
                    className="flex-[0.5] p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all flex items-center justify-center cursor-pointer active:scale-95"
                    title={isPaused ? "Reanudar" : "Pausar"}
                  >
                    {isPaused ? <Play className="w-5 h-5 text-green-400" /> : <Pause className="w-5 h-5 text-yellow-400" />}
                  </button>

                  <button
                    onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
                    className="flex-1 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all text-sm font-semibold tracking-wider cursor-pointer active:scale-95"
                    title="Cambiar Vista Automática"
                  >
                    {viewMode === '3d' ? '2D' : '3D'}
                  </button>

                  <button
                    onClick={resetAtom}
                    className="flex-1 p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 hover:text-red-300 transition-all text-sm font-medium cursor-pointer active:scale-95"
                    title="Resetear Átomo"
                  >
                    Reset
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs text-white/50 mb-1">
                    <span>Velocidad</span>
                    <span className="font-mono text-[10px] bg-white/10 px-1 rounded">{speed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {viewMode === '3d' && (
                  <label className="flex items-center justify-between text-xs text-white/70 cursor-pointer group hover:text-white transition-colors border-t border-white/10 pt-3 mt-1">
                    <span>Órbitas planas</span>
                    <input
                      type="checkbox"
                      checked={flatOrbits}
                      onChange={toggleFlatOrbits}
                      className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                    />
                  </label>
                )}

                <button
                  onClick={handleHideUI}
                  className="flex items-center justify-center gap-2 mt-2 p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 transition-all text-xs font-medium cursor-pointer"
                >
                  <EyeOff className="w-4 h-4" />
                  <span>Ocultar UI</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Layout Wrap (For Lists and Hazards) */}
      <div className="flex flex-col gap-4 sm:gap-8 mt-auto w-full pointer-events-none">
        {/* Particle Dispensers (Mobile Only - Above Footer) */}
        <div className="flex sm:hidden justify-center gap-2 pointer-events-auto">
          <ParticleDispenser type="proton" color="bg-gradient-to-br from-red-500 to-rose-700" label="Protón" onClick={() => addParticle('proton')} />
          <ParticleDispenser type="neutron" color="bg-gradient-to-br from-blue-500 to-indigo-700" label="Neutrón" onClick={() => addParticle('neutron')} />
          <ParticleDispenser type="electron" color="bg-gradient-to-br from-yellow-400 to-amber-600" label="Electrón" onClick={() => addParticle('electron')} />
        </div>

        {/* Footer Bar (Bottom Left & Right) */}
        <div className="flex justify-between items-end w-full pb-4 sm:pb-0">
          {/* Atom Presets List (Bottom Left) */}
          <div className="relative pointer-events-auto z-20">
            {/* Dropdown Menu */}
            {isListOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-48 sm:w-64 max-h-[40vh] overflow-y-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-2 flex flex-col gap-1 shadow-2xl">
                <div className="text-xs text-white/50 font-semibold px-2 pb-2 mb-1 border-b border-white/10 uppercase tracking-widest sticky top-0 bg-black/60 backdrop-blur-xl z-10">
                  Seleccionar Elemento
                </div>
                {atomsData.map((atom) => (
                  <button
                    key={atom.id}
                    onClick={() => {
                      loadAtom(atom.protons, atom.neutrons, atom.electrons);
                      setIsListOpen(false);
                    }}
                    className="flex items-center justify-between text-left px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-white text-sm"
                  >
                    <span className="font-medium">{atom.name}</span>
                    <span className="text-white/40 font-mono text-xs">{atom.symbol}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Toggle Button */}
            <button
              onClick={() => setIsListOpen(!isListOpen)}
              className="flex items-center justify-between gap-1 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all backdrop-blur-md shadow-lg w-auto sm:w-64"
            >
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                <span className="font-medium text-xs sm:text-sm hidden sm:inline">Lista de Átomos</span>
                <span className="font-medium text-xs sm:hidden">Elementos</span>
              </div>
              {isListOpen ? <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-white/50 ml-1" /> : <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-white/50 ml-1" />}
            </button>
          </div>

          {/* Hazards Panel (Bottom Right) */}
          <div className="flex gap-1 sm:gap-2 pointer-events-auto">
            {hazardConfig.map(({ id, label, Icon, activeClass }) => {
              const isActive = hazards.includes(id);
              const isTooltipVisible = activeTooltip === id;
              
              return (
                <div key={id} className="relative">
                  {/* Tooltip superpuesto para móvil */}
                  {isTooltipVisible && isActive && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] sm:text-xs px-2 py-1 rounded whitespace-nowrap z-50 animate-in fade-in duration-200">
                      Elemento {label}
                    </div>
                  )}
                  <div
                    onClick={() => isActive && setActiveTooltip(isTooltipVisible ? null : id)}
                    className={`flex flex-col items-center justify-center w-10 h-10 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl transition-all duration-500 backdrop-blur-md cursor-pointer ${isActive ? activeClass : 'bg-black/40 text-white/20 border border-white/5 opacity-50 grayscale'}`}
                    title={isActive ? `Peligro: ${label}` : `${label} (Inactivo)`}
                  >
                    <Icon className="w-4 h-4 sm:w-6 sm:h-6 sm:mb-1" strokeWidth={isActive ? 2.5 : 1.5} />
                    <span className="text-[6px] sm:text-[9px] uppercase font-bold tracking-wider hidden sm:block">{label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Particle Dispensers (Desktop Only - Absolute Bottom Center) */}
      <div className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 justify-center gap-6 pointer-events-auto z-10 w-full max-w-none px-0">
        <ParticleDispenser type="proton" color="bg-gradient-to-br from-red-500 to-rose-700" label="Protón" onClick={() => addParticle('proton')} />
        <ParticleDispenser type="neutron" color="bg-gradient-to-br from-blue-500 to-indigo-700" label="Neutrón" onClick={() => addParticle('neutron')} />
        <ParticleDispenser type="electron" color="bg-gradient-to-br from-yellow-400 to-amber-600" label="Electrón" onClick={() => addParticle('electron')} />
      </div>
    </div>
  );
};

export default OverlayHUD;
