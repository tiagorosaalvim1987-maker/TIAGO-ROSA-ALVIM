

import React from 'react';
import type { MapaRisco } from './types';

// Icon Components
export const PlusIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
);

export const TrashIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
);

export const EditIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
);

export const DownloadIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
);

export const EyeIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
);

export const MenuIcon: React.FC = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
);

export const XIcon: React.FC = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
);

// RiskMap Component
interface RiskMapProps {
  mapa: MapaRisco;
  setMapa: (mapa: MapaRisco) => void;
  disabled?: boolean;
}

export const RiskMap: React.FC<RiskMapProps> = ({ mapa, setMapa, disabled = false }) => {
  const handleChange = (quadrante: keyof MapaRisco, value: string) => {
    setMapa({ ...mapa, [quadrante]: value });
  };

  return (
    <div className="w-full max-w-sm mx-auto my-4">
      <div className="grid grid-cols-3 grid-rows-3 gap-1 h-48 md:h-64">
        {/* Top Label */}
        <div className="col-start-2 flex items-center justify-center text-sm font-semibold">Atrás / Acima</div>
        {/* Left Label */}
        <div className="row-start-2 flex items-center justify-center text-sm font-semibold -rotate-90">Esquerda</div>
        {/* Center Circle */}
        <div className="row-start-2 col-start-2 bg-gray-700 text-white rounded-full flex items-center justify-center">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
        </div>
        {/* Right Label */}
        <div className="row-start-2 col-start-3 flex items-center justify-center text-sm font-semibold rotate-90">Direita</div>
        {/* Bottom Label */}
        <div className="row-start-3 col-start-2 flex items-center justify-center text-sm font-semibold">Frente / Abaixo</div>
        
        {/* Quadrants for Input */}
        <textarea
          value={mapa.atras}
          onChange={(e) => handleChange('atras', e.target.value)}
          disabled={disabled}
          className="col-start-1 row-start-1 bg-white border border-gray-300 rounded-lg p-1 text-xs resize-none disabled:bg-gray-100"
          placeholder="Riscos..."
        />
        <textarea
          value={mapa.direita}
          onChange={(e) => handleChange('direita', e.target.value)}
          disabled={disabled}
          className="col-start-3 row-start-1 bg-white border border-gray-300 rounded-lg p-1 text-xs resize-none disabled:bg-gray-100"
          placeholder="Riscos..."
        />
        <textarea
          value={mapa.esquerda}
          onChange={(e) => handleChange('esquerda', e.target.value)}
          disabled={disabled}
          className="col-start-1 row-start-3 bg-white border border-gray-300 rounded-lg p-1 text-xs resize-none disabled:bg-gray-100"
          placeholder="Riscos..."
        />
        <textarea
          value={mapa.frente}
          onChange={(e) => handleChange('frente', e.target.value)}
          disabled={disabled}
          className="col-start-3 row-start-3 bg-white border border-gray-300 rounded-lg p-1 text-xs resize-none disabled:bg-gray-100"
          placeholder="Riscos..."
        />
      </div>
    </div>
  );
};
