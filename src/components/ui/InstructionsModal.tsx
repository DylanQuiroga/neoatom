import React from 'react';
import { X, MousePointer2, Move, Layout, EyeOff, Info, Mail } from 'lucide-react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Info className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Guía de NeoAtom</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">

          <InstructionSection
            icon={<MousePointer2 className="w-5 h-5 text-blue-400" />}
            title="Construye tu átomo"
            text="Usa los dispensadores de la parte inferior para agregar protones, neutrones y electrones. Puedes hacer clic en los botones + / - o arrastrar las partículas hacia el núcleo (en PC)."
          />

          <InstructionSection
            icon={<Move className="w-5 h-5 text-purple-400" />}
            title="Navegación 3D"
            text="Arrastra con el botón secundario (o un dedo) para rotar el átomo. Usa la rueda del ratón (o pellizca) para hacer zoom. El clic izquierdo está reservado para interactuar con la interfaz."
          />

          <InstructionSection
            icon={<Layout className="text-yellow-400 w-5 h-5" />}
            title="Explorar el universo"
            text="Usa la 'Lista de Átomos' en la esquina inferior izquierda para cargar preajustes de elementos reales y aprender sobre su estabilidad y propiedades."
          />

          <InstructionSection
            icon={<EyeOff className="text-red-400 w-5 h-5" />}
            title="Enfoque total"
            text="Puedes ocultar la interfaz completa usando el botón 'Ocultar UI' para apreciar el átomo sin distracciones. Haz doble clic o pulsa cualquier tecla para que vuelva."
          />

          <div className="mt-4 p-5 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm text-white/80 font-medium">¿Encontraste algún error o tienes una sugerencia?</span>
              <p className="text-xs text-white/50 leading-relaxed">
                Puedes contactarme a través del siguiente correo electrónico:
              </p>
            </div>

            <a
              href="mailto:djqa.dev@gmail.com"
              className="flex items-center gap-3 p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl text-blue-300 transition-all text-sm font-semibold group"
            >
              <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
              djqa.dev@gmail.com
            </a>
          </div>

          <div className="flex flex-col items-center justify-center py-4 border-t border-white/5">
            <span className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">
              2026 NEOATOM · TODOS LOS DERECHOS RESERVADOS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const InstructionSection = ({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) => (
  <div className="flex gap-4 p-4 hover:bg-white/[0.02] rounded-2xl transition-colors border border-transparent hover:border-white/5">
    <div className="shrink-0 mt-1">{icon}</div>
    <div className="flex flex-col gap-1">
      <h3 className="text-white font-semibold text-sm sm:text-base tracking-tight">{title}</h3>
      <p className="text-white/50 text-xs sm:text-sm leading-relaxed">{text}</p>
    </div>
  </div>
);

export default InstructionsModal;
