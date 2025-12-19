
export enum Difficulty {
  EASY = 3,
  MEDIUM = 4,
  HARD = 5
}

export interface TileData {
  id: number;
  currentPos: number;
  correctPos: number;
  imageUrl: string;
}

export interface GameState {
  image: string | null;
  difficulty: Difficulty;
  tiles: TileData[];
  isStarted: boolean;
  isSolved: boolean;
  moves: number;
  startTime: number | null;
  elapsedTime: number;
}
