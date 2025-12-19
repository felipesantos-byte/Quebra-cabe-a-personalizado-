
import React from 'react';
import { TileData } from '../types';

interface TileProps {
  tile: TileData;
  gridSize: number;
  onClick: () => void;
  isSelected: boolean;
  isCorrect: boolean;
}

const Tile: React.FC<TileProps> = ({ tile, gridSize, onClick, isSelected, isCorrect }) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative aspect-square cursor-pointer overflow-hidden transition-all duration-300
        ${isSelected ? 'scale-95 ring-4 ring-blue-500 z-10' : 'hover:scale-[1.02]'}
        ${isCorrect && !isSelected ? 'opacity-100 ring-1 ring-green-300' : 'opacity-90'}
        rounded-sm shadow-md
      `}
    >
      <img
        src={tile.imageUrl}
        alt={`Peça ${tile.id}`}
        className="w-full h-full object-cover select-none pointer-events-none"
      />
      <div className="absolute top-1 left-1 bg-black/30 text-white text-[10px] px-1 rounded">
        #{tile.id + 1}
      </div>
      {isCorrect && (
        <div className="absolute bottom-1 right-1 bg-green-500/80 rounded-full p-0.5">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default Tile;
