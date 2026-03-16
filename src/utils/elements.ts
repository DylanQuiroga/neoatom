import elementsData from '../data/elementsData.json';

export interface ElementData {
  atomicNumber: number;
  symbol: string;
  name: string;
  category: string;
  hazards?: string[];
}

export const getElementData = (protons: number): ElementData | null => {
  if (protons === 0) return null;
  const data = (elementsData as Record<string, ElementData>)[protons.toString()];
  return data || { atomicNumber: protons, symbol: '?', name: 'Elemento desconocido', category: 'Desconocido' };
};
