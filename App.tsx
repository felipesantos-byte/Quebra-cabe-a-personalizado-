
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Difficulty, GameState, TileData } from './types';
import { createTiles, shuffleTiles, isPuzzleSolved } from './utils/puzzleLogic';
import Tile from './components/Tile';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    image: null,
    difficulty: Difficulty.EASY,
    tiles: [],
    isStarted: false,
    isSolved: false,
    moves: 0,
    startTime: null,
    elapsedTime: 0,
  });

  const [selectedTileId, setSelectedTileId] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setState((prev) => ({
          ...prev,
          image: event.target?.result as string,
          isStarted: false,
          isSolved: false,
          tiles: [],
          moves: 0,
          elapsedTime: 0,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Start Game
  const startGame = async () => {
    if (!state.image) return;

    const newTiles = await createTiles(state.image, state.difficulty);
    const shuffled = shuffleTiles(newTiles);

    setState((prev) => ({
      ...prev,
      tiles: shuffled,
      isStarted: true,
      isSolved: false,
      moves: 0,
      startTime: Date.now(),
      elapsedTime: 0,
    }));
    setSelectedTileId(null);
  };

  // Handle Tile Click (Swap Logic)
  const handleTileClick = (tileId: number) => {
    if (!state.isStarted || state.isSolved) return;

    if (selectedTileId === null) {
      setSelectedTileId(tileId);
    } else if (selectedTileId === tileId) {
      setSelectedTileId(null);
    } else {
      // Swap tiles
      const newTiles = [...state.tiles];
      const idx1 = newTiles.findIndex((t) => t.id === selectedTileId);
      const idx2 = newTiles.findIndex((t) => t.id === tileId);

      const tempPos = newTiles[idx1].currentPos;
      newTiles[idx1].currentPos = newTiles[idx2].currentPos;
      newTiles[idx2].currentPos = tempPos;

      const solved = isPuzzleSolved(newTiles);

      setState((prev) => ({
        ...prev,
        tiles: newTiles,
        moves: prev.moves + 1,
        isSolved: solved,
        isStarted: !solved,
      }));

      setSelectedTileId(null);
    }
  };

  // Timer Effect
  useEffect(() => {
    if (state.isStarted && !state.isSolved) {
      timerRef.current = window.setInterval(() => {
        setState((prev) => ({
          ...prev,
          elapsedTime: prev.startTime ? Math.floor((Date.now() - prev.startTime) / 1000) : 0,
        }));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isStarted, state.isSolved]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4 md:p-8 flex flex-col items-center">
      <header className="max-w-4xl w-full text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-900 mb-2">
          Puzzle Master
        </h1>
        <p className="text-slate-600">Transforme suas memórias em desafios divertidos!</p>
      </header>

      <main className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings & Controls */}
        <section className="bg-white rounded-3xl shadow-xl p-6 h-fit space-y-6 border border-white/50">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-black">1</span>
              Escolha sua Imagem
            </h2>
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50 group-hover:bg-slate-100 transition-all hover:border-indigo-400 overflow-hidden"
              >
                {state.image ? (
                  <img src={state.image} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="flex flex-col items-center p-4">
                    <svg className="w-10 h-10 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-sm text-slate-500 font-medium">Clique para carregar foto</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-black">2</span>
              Dificuldade
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Fácil', val: Difficulty.EASY, grid: '3x3' },
                { label: 'Médio', val: Difficulty.MEDIUM, grid: '4x4' },
                { label: 'Difícil', val: Difficulty.HARD, grid: '5x5' },
              ].map((d) => (
                <button
                  key={d.val}
                  onClick={() => !state.isStarted && setState(p => ({ ...p, difficulty: d.val }))}
                  disabled={state.isStarted && !state.isSolved}
                  className={`
                    p-3 rounded-xl flex flex-col items-center transition-all
                    ${state.difficulty === d.val 
                      ? 'bg-indigo-600 text-white shadow-lg scale-105' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                    ${state.isStarted && !state.isSolved ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <span className="text-sm font-bold">{d.label}</span>
                  <span className="text-[10px] uppercase opacity-70">{d.grid}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={startGame}
              disabled={!state.image}
              className={`
                w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all transform
                ${!state.image 
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'}
              `}
            >
              {state.isStarted ? 'Recomeçar Jogo' : 'Começar Desafio'}
            </button>
          </div>
        </section>

        {/* Puzzle Area */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/40">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Tempo</span>
                <span className="text-2xl font-mono text-indigo-600 font-black">{formatTime(state.elapsedTime)}</span>
              </div>
              <div className="w-px h-8 bg-slate-300"></div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Movimentos</span>
                <span className="text-2xl font-mono text-indigo-600 font-black">{state.moves}</span>
              </div>
            </div>
            {state.isSolved && (
              <div className="animate-bounce bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                Concluído! 🎉
              </div>
            )}
          </div>

          <div className="relative aspect-square max-w-[600px] mx-auto bg-slate-200 rounded-3xl p-2 shadow-2xl border-4 border-white/50">
            {!state.isStarted && !state.isSolved ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <svg className="w-24 h-24 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium">Configure seu quebra-cabeça e clique em "Começar"</p>
              </div>
            ) : (
              <div 
                className="grid gap-1 h-full w-full"
                style={{
                  gridTemplateColumns: `repeat(${state.difficulty}, 1fr)`,
                }}
              >
                {state.tiles
                  .sort((a, b) => a.currentPos - b.currentPos)
                  .map((tile) => (
                    <Tile
                      key={tile.id}
                      tile={tile}
                      gridSize={state.difficulty}
                      onClick={() => handleTileClick(tile.id)}
                      isSelected={selectedTileId === tile.id}
                      isCorrect={tile.currentPos === tile.correctPos}
                    />
                  ))}
              </div>
            )}
            
            {state.isSolved && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl animate-in fade-in duration-500">
                <div className="bg-white p-8 rounded-3xl shadow-2xl text-center border-4 border-indigo-500 scale-110">
                  <h3 className="text-3xl font-black text-indigo-900 mb-2">Incrível!</h3>
                  <p className="text-slate-600 mb-6">
                    Você resolveu o nível <span className="font-bold">{state.difficulty === 3 ? 'Fácil' : state.difficulty === 4 ? 'Médio' : 'Difícil'}</span> em:
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-indigo-50 p-4 rounded-2xl">
                      <span className="block text-xs uppercase text-indigo-400 font-bold">Tempo</span>
                      <span className="text-2xl font-black text-indigo-600">{formatTime(state.elapsedTime)}</span>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-2xl">
                      <span className="block text-xs uppercase text-indigo-400 font-bold">Movimentos</span>
                      <span className="text-2xl font-black text-indigo-600">{state.moves}</span>
                    </div>
                  </div>
                  <button
                    onClick={startGame}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg"
                  >
                    Jogar Novamente
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-center text-slate-400 text-sm italic">
            Dica: Clique em uma peça e depois em outra para trocá-las de lugar. Peças com borda verde estão na posição correta!
          </div>
        </section>
      </main>

      <footer className="mt-12 text-slate-400 text-sm pb-8">
        &copy; {new Date().getFullYear()} Puzzle Master AI - Feito com ❤️ para você
      </footer>
    </div>
  );
};

export default App;
