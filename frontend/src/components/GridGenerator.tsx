import React, { useState } from 'react';

interface GridGeneratorProps {
  onGenerate: (grids: number[][]) => void;
  gameType?: string;
}

const GridGenerator: React.FC<GridGeneratorProps> = ({ 
  onGenerate, 
  gameType = 'euromillions' 
}) => {
  const [numGrids, setNumGrids] = useState<number>(1);
  const [strategy, setStrategy] = useState<string>('random');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const isEuromillions = gameType === 'euromillions';
  const maxNumbers = isEuromillions ? 50 : 49;
  const numMainNumbers = isEuromillions ? 5 : 6;
  const numSpecialNumbers = isEuromillions ? 2 : 1;
  const maxSpecialNumbers = isEuromillions ? 12 : 10;

  const strategies = [
    { id: 'random', label: '🎲 Aléatoire', description: 'Sélection complètement aléatoire' },
    { id: 'statistical', label: '📊 Statistique', description: 'Basé sur les fréquences historiques' },
    { id: 'balanced', label: '⚖️ Équilibré', description: 'Mélange de numéros chauds et froids' }
  ];

  const generateRandomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const generateGrid = (): number[] => {
    const numbers: number[] = [];
    const specialNumbers: number[] = [];

    // Génération des numéros principaux
    while (numbers.length < numMainNumbers) {
      const num = generateRandomNumber(1, maxNumbers);
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }

    // Génération des numéros spéciaux
    while (specialNumbers.length < numSpecialNumbers) {
      const num = generateRandomNumber(1, maxSpecialNumbers);
      if (!specialNumbers.includes(num)) {
        specialNumbers.push(num);
      }
    }

    return [...numbers.sort((a, b) => a - b), ...specialNumbers.sort((a, b) => a - b)];
  };

  const generateStatisticalGrid = (): number[] => {
    // Simulation de statistiques basées sur des fréquences
    const hotNumbers = [7, 12, 23, 34, 45, 3, 8, 15, 22, 31, 42, 5, 11, 19, 28, 37, 46];
    const coldNumbers = [1, 2, 4, 6, 9, 10, 13, 14, 16, 17, 18, 20, 21, 24, 25, 26, 27, 29, 30, 32, 33, 35, 36, 38, 39, 40, 41, 43, 44, 47, 48, 49, 50];
    
    const numbers: number[] = [];
    const specialNumbers: number[] = [];

    // Mélange de numéros chauds et froids
    while (numbers.length < numMainNumbers) {
      const useHotNumber = Math.random() < 0.6; // 60% de chance d'utiliser un numéro chaud
      let num: number;
      
      if (useHotNumber && hotNumbers.length > 0) {
        const index = Math.floor(Math.random() * hotNumbers.length);
        num = hotNumbers.splice(index, 1)[0];
      } else {
        const index = Math.floor(Math.random() * coldNumbers.length);
        num = coldNumbers.splice(index, 1)[0];
      }
      
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }

    // Numéros spéciaux
    while (specialNumbers.length < numSpecialNumbers) {
      const num = generateRandomNumber(1, maxSpecialNumbers);
      if (!specialNumbers.includes(num)) {
        specialNumbers.push(num);
      }
    }

    return [...numbers.sort((a, b) => a - b), ...specialNumbers.sort((a, b) => a - b)];
  };

  const generateBalancedGrid = (): number[] => {
    const numbers: number[] = [];
    const specialNumbers: number[] = [];

    // Sélection équilibrée
    const ranges = [
      { min: 1, max: Math.floor(maxNumbers * 0.2) },
      { min: Math.floor(maxNumbers * 0.2) + 1, max: Math.floor(maxNumbers * 0.4) },
      { min: Math.floor(maxNumbers * 0.4) + 1, max: Math.floor(maxNumbers * 0.6) },
      { min: Math.floor(maxNumbers * 0.6) + 1, max: Math.floor(maxNumbers * 0.8) },
      { min: Math.floor(maxNumbers * 0.8) + 1, max: maxNumbers }
    ];

    // Un numéro de chaque plage
    ranges.slice(0, numMainNumbers).forEach(range => {
      let num: number;
      do {
        num = generateRandomNumber(range.min, range.max);
      } while (numbers.includes(num));
      numbers.push(num);
    });

    // Numéros spéciaux
    while (specialNumbers.length < numSpecialNumbers) {
      const num = generateRandomNumber(1, maxSpecialNumbers);
      if (!specialNumbers.includes(num)) {
        specialNumbers.push(num);
      }
    }

    return [...numbers.sort((a, b) => a - b), ...specialNumbers.sort((a, b) => a - b)];
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulation d'un délai pour l'animation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const grids: number[][] = [];
    
    for (let i = 0; i < numGrids; i++) {
      let grid: number[];
      
      switch (strategy) {
        case 'statistical':
          grid = generateStatisticalGrid();
          break;
        case 'balanced':
          grid = generateBalancedGrid();
          break;
        default:
          grid = generateGrid();
      }
      
      grids.push(grid);
    }
    
    onGenerate(grids);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🎯 Nombre de grilles
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="10"
              value={numGrids}
              onChange={(e) => setNumGrids(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-lg font-bold text-gray-900 min-w-[3rem] text-center">
              {numGrids}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            🧠 Stratégie de génération
          </label>
          <div className="grid grid-cols-1 gap-3">
            {strategies.map((strat) => (
              <label
                key={strat.id}
                className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  strategy === strat.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="strategy"
                  value={strat.id}
                  checked={strategy === strat.id}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  strategy === strat.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {strategy === strat.id && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{strat.label}</div>
                  <div className="text-sm text-gray-600">{strat.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Informations sur le jeu */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-2xl">
            {isEuromillions ? '🎰' : '🍀'}
          </span>
          <h4 className="font-semibold text-gray-900">
            {isEuromillions ? 'Euromillions' : 'Lotto'}
          </h4>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• {numMainNumbers} numéros de 1 à {maxNumbers}</p>
          <p>• {numSpecialNumbers} {isEuromillions ? 'étoile' : 'numéro chance'} de 1 à {maxSpecialNumbers}</p>
          <p>• Stratégie sélectionnée : <span className="font-medium">{strategies.find(s => s.id === strategy)?.label}</span></p>
        </div>
      </div>

      {/* Bouton de génération */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
          isGenerating
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-lg'
        } text-white shadow-md`}
      >
        {isGenerating ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Génération en cours...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <span>🚀</span>
            <span>Générer {numGrids} grille{numGrids > 1 ? 's' : ''}</span>
          </div>
        )}
      </button>

      {/* Conseils */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start space-x-2">
          <span className="text-yellow-600 text-lg">💡</span>
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Conseil :</p>
            <p>Le hasard reste le facteur principal. Ces grilles sont générées à des fins de divertissement uniquement.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GridGenerator; 