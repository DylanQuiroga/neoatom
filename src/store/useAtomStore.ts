import { create } from 'zustand';

export type ParticleType = 'proton' | 'neutron' | 'electron';
export type ViewMode = '2d' | '3d';

interface AtomState {
  protons: number;
  neutrons: number;
  electrons: number;
  isPaused: boolean;
  speed: number;
  viewMode: ViewMode;
  flatOrbits: boolean;
  addParticle: (type: ParticleType) => void;
  removeParticle: (type: ParticleType) => void;
  togglePause: () => void;
  setSpeed: (speed: number) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleFlatOrbits: () => void;
  loadAtom: (protons: number, neutrons: number, electrons: number) => void;
  resetAtom: () => void;
}

export const useAtomStore = create<AtomState>((set) => ({
  protons: 0,
  neutrons: 0,
  electrons: 0,
  isPaused: false,
  speed: 1,
  viewMode: '3d',
  flatOrbits: false,
  
  addParticle: (type: ParticleType) => set((state) => {
    switch (type) {
      case 'proton': return { protons: state.protons + 1 };
      case 'neutron': return { neutrons: state.neutrons + 1 };
      case 'electron': return { electrons: state.electrons + 1 };
      default: return state;
    }
  }),
  
  removeParticle: (type: ParticleType) => set((state) => {
    switch (type) {
      case 'proton': return { protons: Math.max(0, state.protons - 1) };
      case 'neutron': return { neutrons: Math.max(0, state.neutrons - 1) };
      case 'electron': return { electrons: Math.max(0, state.electrons - 1) };
      default: return state;
    }
  }),

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  
  setSpeed: (speed: number) => set({ speed }),

  setViewMode: (viewMode: ViewMode) => set({ viewMode }),

  toggleFlatOrbits: () => set((state) => ({ flatOrbits: !state.flatOrbits })),

  loadAtom: (protons: number, neutrons: number, electrons: number) => set({ protons, neutrons, electrons, isPaused: false }),

  resetAtom: () => set({ protons: 0, neutrons: 0, electrons: 0, isPaused: false, speed: 1, flatOrbits: false }),
}));
