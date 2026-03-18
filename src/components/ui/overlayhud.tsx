import React, { useState, useEffect } from 'react';
import { useAtomStore, ParticleType } from '../../store/useAtomStore';
import { getElementData } from '../../utils/elements';
import { Atom, Play, Pause, List, ChevronUp, ChevronDown, Flame, Radiation, Skull, Droplet, EyeOff, Info } from 'lucide-react';
import atomsData from '../../data/atoms.json';
import periodicDataRawES from '../../data/periodic-table-lookup-es.json';
import periodicDataRawEN from '../../data/periodic-table-lookup-en.json';
import ElementDetailsModal from './ElementDetailsModal';
import InstructionsModal from './InstructionsModal';
import { useTranslation } from 'react-i18next';

const ParticleDispenser = ({ type, color, label, count, onAdd, onRemove }: { type: ParticleType, color: string, label: string, count: number, onAdd: () => void, onRemove: () => void }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('particleType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const shadowColor = {
    proton: 'hover:shadow-red-500/30',
    neutron: 'hover:shadow-blue-500/30',
    electron: 'hover:shadow-yellow-500/30'
  }[type];

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`pointer-events-auto flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 shadow-lg ${shadowColor} w-[85px] sm:w-[115px] mt-auto`}
    >
      <div
        onClick={onAdd}
        className={`w-5 h-5 sm:w-8 sm:h-8 rounded-full mb-2 sm:mb-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${color} border border-white/20 cursor-pointer active:scale-95 transition-all`}
      />
      <span className="text-white font-medium text-[10px] sm:text-xs tracking-wider uppercase">{label}</span>

      <div className="flex items-center justify-between w-full mt-2 bg-black/40 rounded-lg p-0.5 border border-white/5">
        <button
          onClick={onRemove}
          disabled={count <= 0}
          className={`w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-md font-bold text-base active:scale-95 transition-colors ${count > 0 ? 'text-white/70 hover:bg-white/10 hover:text-white cursor-pointer' : 'text-white/20 cursor-not-allowed'}`}
        >
          -
        </button>
        <span className="text-white/90 font-mono text-[10px] sm:text-xs">{count}</span>
        <button
          onClick={onAdd}
          className="w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white font-bold text-base cursor-pointer active:scale-95 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
};

const OverlayHUD = () => {
  const { protons, neutrons, electrons, addParticle, removeParticle, resetAtom, isPaused, togglePause, speed, setSpeed, viewMode, setViewMode, loadAtom, flatOrbits, toggleFlatOrbits } = useAtomStore();
  const [isListOpen, setIsListOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const periodicDataRaw = i18n.language === 'en' ? periodicDataRawEN : periodicDataRawES;

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  const baseElement = getElementData(protons);
  const elementKey = protons > 0 ? (periodicDataRaw.order as string[])[protons - 1] : undefined;
  const elementFromTable = elementKey ? (periodicDataRaw as any)[elementKey] : null;
  
  const element = baseElement ? {
    ...baseElement,
    name: elementFromTable?.name || baseElement.name,
    category: elementFromTable?.category || baseElement.category
  } : null;

  const massNumber = protons + neutrons;
  const netCharge = protons - electrons;

  const displayCharge = netCharge === 0 ? '0' : netCharge > 0 ? `+${netCharge}` : `${netCharge}`;

  const hazards = element?.hazards || [];

  const hazardConfig = [
    { id: 'Inflamable', label: t('hazards.inflamable'), Icon: Flame, activeClass: 'text-orange-400 bg-orange-500/20 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.4)]' },
    { id: 'Corrosivo', label: t('hazards.corrosivo'), Icon: Droplet, activeClass: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30 shadow-[0_0_15px_rgba(250,204,21,0.4)]' },
    { id: 'Tóxico', label: t('hazards.toxico'), Icon: Skull, activeClass: 'text-purple-400 bg-purple-500/20 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.4)]' },
    { id: 'Radioactivo', label: t('hazards.radiactivo'), Icon: Radiation, activeClass: 'text-green-400 bg-green-500/20 border-green-500/30 shadow-[0_0_15px_rgba(74,222,128,0.4)]' }
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
    // Solo registrar listeners de restauración si la UI está oculta
    if (isUiVisible) return;

    const handleRestoreUI = () => {
      setIsUiVisible(true);
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

  // No early return here to keep the component structure stable and avoid sibling issues.
  // We will handle the visibility inside the main return using CSS classes.

  const specialParticle = React.useMemo(() => {
    if (protons === 2 && neutrons === 2 && electrons === 0) return { name: t('particles.alpha'), category: t('particles.category.ionizing'), symbol: 'α' };
    if (protons === 0 && neutrons === 1 && electrons === 0) return { name: t('particles.free_neutron'), category: t('particles.category.neutronic'), symbol: 'n' };
    if (protons === 0 && neutrons === 0 && electrons === 1) return { name: t('particles.beta'), category: t('particles.category.beta'), symbol: 'β⁻' };
    if (protons === 1 && neutrons === 0 && electrons === 0) return { name: t('particles.proton'), category: t('particles.category.hydrogen'), symbol: 'H⁺' };
    if (protons === 1 && neutrons === 1 && electrons === 0) return { name: t('particles.deuteron'), category: t('particles.category.deuterium'), symbol: '²H⁺' };
    if (protons === 1 && neutrons === 2 && electrons === 0) return { name: t('particles.triton'), category: t('particles.category.tritium'), symbol: '³H⁺' };
    return null;
  }, [protons, neutrons, electrons, t]);

  return (
    <div className={`absolute inset-0 pointer-events-none z-[100] flex flex-col justify-between p-4 pb-12 sm:pb-8 sm:p-8 font-sans transition-all duration-500`}>
      {/* UI Hint (When hidden) */}
      {!isUiVisible && showUiHint && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full shadow-2xl animate-fade-in-out flex items-center gap-3 z-50">
          <Info className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-medium tracking-wide">
            {t('ui.restore_hint')}
          </span>
        </div>
      )}

      {/* Main HUD content (Hidable panels) */}
      <div className={`flex flex-col gap-4 w-full h-full justify-between transition-all duration-500 ${isUiVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none invisible'}`}>
        {/* Header Info Panel */}
        <div className="flex flex-col sm:flex-row justify-between items-start pointer-events-none gap-2 sm:gap-4 w-full">
          {/* Mobile Header Nav (Only visible on mobile) */}
          <div className="flex w-full justify-between sm:hidden pointer-events-auto gap-2">
            <button
              onClick={() => setIsInfoOpen(!isInfoOpen)}
              className="flex-1 flex items-center justify-center gap-2 p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-white/70 hover:text-white transition-colors"
            >
              <Atom className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold tracking-wider">{t('ui.info_button')}</span>
              {isInfoOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <button
              onClick={() => setIsControlsOpen(!isControlsOpen)}
              className="flex-1 flex items-center justify-center gap-2 p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-white/70 hover:text-white transition-colors"
            >
              <span className="text-xs font-semibold tracking-wider">{t('ui.settings_button')}</span>
              {isControlsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Info Panel Wrap */}
          <div className="flex flex-col gap-2 w-full sm:w-auto pointer-events-auto">
            <div className={`${isInfoOpen ? 'flex' : 'hidden sm:flex'} flex-col bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-6 text-white w-full sm:min-w-[300px] shadow-2xl flex-1 max-w-full sm:max-w-md transition-all`}>
              <div
                className="flex items-center justify-between mb-2 sm:mb-4 border-b border-white/10 pb-2 sm:pb-4 cursor-pointer group"
                onClick={() => setIsInfoOpen(!isInfoOpen)}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <Atom className="text-blue-400 w-5 h-5 sm:w-8 sm:h-8 group-hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.5)] transition-all" />
                  <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent leading-none">
                    {t('app_name')}
                  </h1>
                </div>
                <div className="hidden sm:block text-white/40 group-hover:text-white transition-colors">
                  {isInfoOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {isInfoOpen && (
                <>
                  <div className="flex items-end gap-2 sm:gap-4 mb-1 sm:mb-4">
                    <div className="text-4xl sm:text-7xl font-light tracking-tighter leading-none">
                      {specialParticle ? specialParticle.symbol : (element ? element.symbol : '?')}
                      {!specialParticle && netCharge !== 0 && (
                        <sup className="text-lg sm:text-2xl font-medium text-blue-300 ml-1">{displayCharge}</sup>
                      )}
                    </div>
                    <div className="flex flex-col mb-1 sm:mb-2 text-white/60">
                      <span className="text-xs sm:text-sm uppercase tracking-widest font-semibold">{massNumber}</span>
                      <span className="text-xs sm:text-sm uppercase tracking-widest font-semibold">{protons}</span>
                    </div>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-semibold mb-1">
                    {specialParticle ? specialParticle.name : (element ? element.name : (protons === 0 && neutrons === 0 && electrons === 0 ? t('ui.empty') : t('ui.unknown')))}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/50 mb-2 uppercase tracking-wider font-medium">
                    {specialParticle ? specialParticle.category : (element ? element.category : (protons === 0 && neutrons === 0 && electrons === 0 ? t('ui.start_hint') : t('ui.unstable_isotopes')))}
                  </p>

                  {element && (
                    <button
                      onClick={() => setIsDetailsOpen(true)}
                      className="flex items-center justify-center gap-2 mb-4 sm:mb-6 py-2 px-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-300 transition-colors text-xs font-semibold w-full sm:w-auto"
                    >
                      <Info className="w-4 h-4 cursor-pointer" />
                      {t('ui.view_detailed_info')}
                    </button>
                  )}

                  <div className="grid grid-cols-3 gap-2 sm:gap-4 border-t border-white/10 pt-4 sm:pt-6">
                    <div className="flex flex-col">
                      <span className="text-white/50 text-[10px] sm:text-xs tracking-wider mb-1">{t('ui.protons')}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-xl font-medium">{protons}</span>
                        {protons > 0 && (
                          <button onClick={() => removeParticle('proton')} className="text-white/30 hover:text-red-400 transition-colors cursor-pointer active:scale-95">-</button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white/50 text-[10px] sm:text-xs tracking-wider mb-1">{t('ui.neutrons')}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-xl font-medium">{neutrons}</span>
                        {neutrons > 0 && (
                          <button onClick={() => removeParticle('neutron')} className="text-white/30 hover:text-blue-400 transition-colors cursor-pointer active:scale-95">-</button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white/50 text-[10px] sm:text-xs tracking-wider mb-1">{t('ui.electrons')}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-xl font-medium">{electrons}</span>
                        {electrons > 0 && (
                          <button onClick={() => removeParticle('electron')} className="text-white/30 hover:text-yellow-400 transition-colors cursor-pointer active:scale-95">-</button>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsInstructionsOpen(true)}
                    className="mt-4 flex flex-col items-center justify-center p-2 sm:p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer group text-center"
                  >
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-400" />
                      <span className="text-xs sm:text-sm text-white/70 group-hover:text-white transition-colors">{t('ui.guide_contact')}</span>
                    </div>
                    <span className="text-[10px] sm:text-xs text-white/30 group-hover:text-blue-400 transition-colors mt-0.5 font-medium tracking-wide">{t('ui.instructions_report')}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Controls Panel Wrap */}
          <div className="flex flex-col gap-2 pointer-events-auto w-full sm:w-auto">

            <div className={`${isControlsOpen ? 'flex' : 'hidden sm:flex'} flex-col bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 text-white gap-4 shadow-2xl transition-all`}>
              <div
                className="hidden sm:flex justify-between items-center mb-1 border-b border-white/10 pb-2 cursor-pointer group"
                onClick={() => setIsControlsOpen(!isControlsOpen)}
              >
                <span className="text-xs uppercase tracking-widest font-semibold text-white/50 group-hover:text-white/80 transition-colors">{t('ui.controls')}</span>
                <div className="text-white/40 group-hover:text-white transition-colors">
                  {isControlsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {isControlsOpen && (
                <>
                  <div className="flex gap-2">
                    <button
                      onClick={togglePause}
                      className="flex-[0.5] p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all flex items-center justify-center cursor-pointer active:scale-95"
                      title={isPaused ? t('ui.resume') : t('ui.pause')}
                    >
                      {isPaused ? <Play className="w-5 h-5 text-green-400" /> : <Pause className="w-5 h-5 text-yellow-400" />}
                    </button>

                    <button
                      onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
                      className="flex-1 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all text-sm font-semibold tracking-wider cursor-pointer active:scale-95"
                      title={t('ui.switch_view')}
                    >
                      {viewMode === '3d' ? '2D' : '3D'}
                    </button>

                    <button
                      onClick={resetAtom}
                      className="flex-1 p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 hover:text-red-300 transition-all text-sm font-medium cursor-pointer active:scale-95"
                      title={t('ui.reset_atom')}
                    >
                      {t('ui.reset')}
                    </button>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs text-white/50 mb-1">
                      <span>{t('ui.speed')}</span>
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
                      <span>{t('ui.flat_orbits')}</span>
                      <input
                        type="checkbox"
                        checked={flatOrbits}
                        onChange={toggleFlatOrbits}
                        className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                      />
                    </label>
                  )}

                  <div className="flex items-center justify-between text-xs text-white/70 border-t border-white/10 pt-3 mt-1 group">
                    <span>Idioma / Language</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLanguage();
                      }}
                      className="px-2 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-md text-white transition-all text-[10px] font-bold uppercase tracking-widest active:scale-95"
                    >
                      {i18n.language === 'es' ? 'EN' : 'ES'}
                    </button>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHideUI();
                    }}
                    className="flex items-center justify-center gap-2 mt-2 p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 transition-all text-xs font-medium cursor-pointer"
                  >
                    <EyeOff className="w-4 h-4" />
                    <span>{t('ui.hide_ui')}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Layout Wrap (For Lists and Hazards) */}
        <div className="flex flex-col gap-4 sm:gap-8 mt-auto w-full pointer-events-none">
          {/* Particle Dispensers (Mobile Only - Above Footer) */}
          <div className="flex sm:hidden justify-center gap-2 pointer-events-none">
            <ParticleDispenser type="proton" color="bg-gradient-to-br from-red-500 to-rose-700" label="Protón" count={protons} onAdd={() => addParticle('proton')} onRemove={() => removeParticle('proton')} />
            <ParticleDispenser type="neutron" color="bg-gradient-to-br from-blue-500 to-indigo-700" label="Neutrón" count={neutrons} onAdd={() => addParticle('neutron')} onRemove={() => removeParticle('neutron')} />
            <ParticleDispenser type="electron" color="bg-gradient-to-br from-yellow-400 to-amber-600" label="Electrón" count={electrons} onAdd={() => addParticle('electron')} onRemove={() => removeParticle('electron')} />
          </div>

          {/* Footer Bar (Bottom Left & Right) */}
          <div className="flex justify-between items-end w-full pb-2 sm:pb-0">
            {/* Atom Presets List (Bottom Left) */}
            <div className="relative pointer-events-auto z-[200]">
              {/* Dropdown Menu */}
              {isListOpen && (
                <div className="absolute bottom-full left-0 mb-4 w-48 sm:w-64 max-h-[50vh] overflow-y-auto bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/20 rounded-2xl p-2 flex flex-col gap-1 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[200]">
                  <div className="text-[10px] text-blue-400 font-bold px-3 pb-2 mb-1 border-b border-white/10 uppercase tracking-[0.2em] sticky top-0 bg-[#0a0a0a]/50 backdrop-blur-md z-[210]">
                    {t('ui.select_element')}
                  </div>
                  {atomsData.map((atom) => (
                    <button
                      key={atom.id}
                      onClick={() => {
                        loadAtom(atom.protons, atom.neutrons, atom.electrons);
                        setIsListOpen(false);
                      }}
                      className="flex items-center justify-between text-left px-3 py-2 hover:bg-white/10 rounded-lg transition-all text-white text-sm active:scale-[0.98]"
                    >
                      <span className="font-medium">{atom.name}</span>
                      <span className="text-white/40 font-mono text-xs tracking-tighter">{atom.symbol}</span>
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
                  <span className="font-medium text-xs sm:text-sm hidden sm:inline">{t('ui.atom_list')}</span>
                  <span className="font-medium text-xs sm:hidden">{t('ui.elements')}</span>
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
                        {t('hazards.element_hazard', { label })}
                      </div>
                    )}
                    <div
                      onClick={() => isActive && setActiveTooltip(isTooltipVisible ? null : id)}
                      className={`flex flex-col items-center justify-center w-10 h-10 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl transition-all duration-500 backdrop-blur-md cursor-pointer ${isActive ? activeClass : 'bg-black/40 text-white/20 border border-white/5 opacity-50 grayscale'}`}
                      title={isActive ? t('hazards.danger', { label }) : t('hazards.inactive', { label })}
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
      </div>

      {/* Particle Dispensers (Desktop Only - Absolute Bottom Center) */}
      <div className={`hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 justify-center gap-4 pointer-events-none z-10 w-full max-w-none px-0 transition-opacity duration-300 ${isUiVisible ? 'opacity-100' : 'opacity-0 invisible'}`}>
        <ParticleDispenser type="proton" color="bg-gradient-to-br from-red-500 to-rose-700" label="Protón" count={protons} onAdd={() => addParticle('proton')} onRemove={() => removeParticle('proton')} />
        <ParticleDispenser type="neutron" color="bg-gradient-to-br from-blue-500 to-indigo-700" label="Neutrón" count={neutrons} onAdd={() => addParticle('neutron')} onRemove={() => removeParticle('neutron')} />
        <ParticleDispenser type="electron" color="bg-gradient-to-br from-yellow-400 to-amber-600" label="Electrón" count={electrons} onAdd={() => addParticle('electron')} onRemove={() => removeParticle('electron')} />
      </div>

      <ElementDetailsModal
        isOpen={isDetailsOpen && isUiVisible}
        onClose={() => setIsDetailsOpen(false)}
        data={periodicDataRaw}
        atomicNumber={protons}
      />

      <InstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />
    </div>
  );
};

export default OverlayHUD;
