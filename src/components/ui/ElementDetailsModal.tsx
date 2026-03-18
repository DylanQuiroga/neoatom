import React from 'react';
import { X, ExternalLink, Activity, Thermometer, Weight, TestTube, Zap } from 'lucide-react';

interface ElementDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // We pass the raw periodicData object and the current atomic number
  data: any;
  atomicNumber: number;
}

const ElementDetailsModal: React.FC<ElementDetailsModalProps> = ({ isOpen, onClose, data, atomicNumber }) => {
  if (!isOpen || atomicNumber < 1 || !data.order) return null;

  const elementKey = data.order[atomicNumber - 1];
  const element = data[elementKey];

  const formatTemp = (k: number | null) => {
    if (k === null || k === undefined) return 'N/A';
    const c = k - 273.15;
    const f = (k - 273.15) * 9/5 + 32;
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-white font-medium">{k} K</span>
        <span className="text-white/60 text-[10px] font-mono leading-none">{c.toFixed(1)}°C | {f.toFixed(1)}°F</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto">
      <div 
        className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-400">{element.symbol}</span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white capitalize">{element.name}</h2>
              <p className="text-sm font-medium text-white/50 uppercase tracking-widest">{element.category}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Scroll Area */}
        <div className="overflow-y-auto p-4 sm:p-6 flex flex-col gap-6 custom-scrollbar">
          
          {/* Element Image Section */}
          {element.image && element.image.url && (
            <div className="relative group overflow-hidden rounded-xl bg-black/40 border border-white/10 aspect-video flex-shrink-0 flex items-center justify-center">
              {/* Blurred background for a premium look */}
              <img 
                src={element.image.url} 
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 saturate-150 scale-110 pointer-events-none"
              />
              
              {/* Main image shown in full (contained, not squashed) */}
              <img 
                src={element.image.url} 
                alt={element.image.title || element.name}
                className="relative z-10 max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105"
              />
              
              <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-[10px] text-white/70 italic leading-tight">
                  {element.image.attribution}
                </p>
              </div>
              {element.image.title && (
                <div className="absolute top-3 left-3 z-30 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white/80 border border-white/10">
                  {element.image.title}
                </div>
              )}
            </div>
          )}

          {/* Summary section */}
          <div className="bg-white/5 border border-white/5 rounded-xl p-4 sm:p-5 text-white/80 text-sm sm:text-base leading-relaxed flex-shrink-0">
            {element.summary}
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 flex-shrink-0">
            <StatCard icon={<Weight className="text-purple-400 w-4 h-4" />} label="Masa Atómica" value={`${element.atomic_mass.toFixed(3)} u`} />
            <StatCard icon={<Activity className="text-green-400 w-4 h-4" />} label="Densidad" value={element.density ? `${element.density} g/cm³` : 'N/A'} />
            <StatCard icon={<Zap className="text-yellow-400 w-4 h-4" />} label="E. Negatividad" value={element.electronegativity_pauling || 'N/A'} />
            <StatCard icon={<Thermometer className="text-red-400 w-4 h-4" />} label="Fusión" value={formatTemp(element.melt)} />
            <StatCard icon={<Thermometer className="text-orange-400 w-4 h-4" />} label="Ebullición" value={formatTemp(element.ebullition || element.boil)} />
            <StatCard icon={<TestTube className="text-blue-400 w-4 h-4" />} label="Fase (R.T.)" value={element.phase || 'N/A'} />
          </div>

          {/* Details & Config */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-shrink-0">
            <div className="flex flex-col gap-1 p-4 bg-black/20 rounded-xl border border-white/5">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">Configuración Electrónica</span>
              <span className="font-mono text-white/90 text-sm">{element.electron_configuration_semantic || element.electron_configuration}</span>
            </div>
            
            <div className="flex flex-col gap-1 p-4 bg-black/20 rounded-xl border border-white/5">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">Descubierto por</span>
              <span className="text-white/90 text-sm font-medium">{element.discovered_by || 'Antigüedad'}</span>
            </div>

            <div className="flex flex-col gap-1 p-4 bg-black/20 rounded-xl border border-white/5 sm:col-span-2">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">Apariencia</span>
              <span className="text-white/90 text-sm">
                {(element.appearance || 'Desconocida').charAt(0).toUpperCase() + (element.appearance || 'Desconocida').slice(1)}
              </span>
            </div>
          </div>

          {/* Source Link */}
          {element.source && (
            <a 
              href={element.source} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-white/60 hover:text-white text-sm font-medium flex-shrink-0"
            >
              <span>Leer más en Wikipedia</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
  <div className="flex flex-col p-3 bg-white/5 rounded-xl border border-white/10">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">{label}</span>
    </div>
    <div className="text-white truncate">{value}</div>
  </div>
);

export default ElementDetailsModal;
