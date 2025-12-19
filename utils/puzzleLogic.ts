
import { Difficulty, TileData } from '../types';

export const createTiles = async (
  imageSrc: string,
  gridSize: number
): Promise<TileData[]> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const tiles: TileData[] = [];
      const tileSize = img.width / gridSize;
      const tileHeight = img.height / gridSize;

      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const canvas = document.createElement('canvas');
          canvas.width = 300; // Normalizing display size
          canvas.height = 300;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Draw specific part of original image into a fixed-size tile canvas
            ctx.drawImage(
              img,
              x * tileSize,
              y * tileHeight,
              tileSize,
              tileHeight,
              0,
              0,
              300,
              300
            );
          }

          const pos = y * gridSize + x;
          tiles.push({
            id: pos,
            currentPos: pos,
            correctPos: pos,
            imageUrl: canvas.toDataURL(),
          });
        }
      }
      resolve(tiles);
    };
  });
};

export const shuffleTiles = (tiles: TileData[]): TileData[] => {
  const shuffled = [...tiles];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i].currentPos, shuffled[j].currentPos] = [
      shuffled[j].currentPos,
      shuffled[i].currentPos,
    ];
  }
  return shuffled;
};

export const isPuzzleSolved = (tiles: TileData[]): boolean => {
  return tiles.every((tile) => tile.currentPos === tile.correctPos);
};
