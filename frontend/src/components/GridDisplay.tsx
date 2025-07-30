import React from 'react';

interface GridDisplayProps {
  grids: number[][];
  gameType: 'euromillions' | 'lotto';
  onClear?: () => void;
  onAnalyzeGrid?: (grid: number[]) => void;
}

const GridDisplay: React.FC<GridDisplayProps> = ({ grids, gameType, onClear, onAnalyzeGrid }) => {
  if (grids.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-gray-400">🎲</span>
        </div>
        <p className="text-gray-500 text-lg">Aucune grille générée</p>
        <p className="text-gray-400 text-sm mt-2">Utilisez le générateur pour créer des grilles</p>
      </div>
    );
  }

  const getNumberClass = (number: number) => {
    if (number <= 10) return 'number-1-10';
    if (number <= 20) return 'number-11-20';
    if (number <= 30) return 'number-21-30';
    if (number <= 40) return 'number-31-40';
    if (number <= 50) return 'number-41-50';
    if (number <= 60) return 'number-51-60';
    if (number <= 70) return 'number-61-70';
    if (number <= 80) return 'number-71-80';
    if (number <= 90) return 'number-81-90';
    return 'number-91-100';
  };

  const getStarClass = (number: number) => {
    if (number <= 4) return 'bg-gradient-to-br from-red-500 to-red-600';
    if (number <= 8) return 'bg-gradient-to-br from-orange-500 to-orange-600';
    return 'bg-gradient-to-br from-yellow-500 to-yellow-600';
  };

  const getChanceClass = (number: number) => {
    if (number <= 3) return 'bg-gradient-to-br from-green-500 to-green-600';
    if (number <= 6) return 'bg-gradient-to-br from-blue-500 to-blue-600';
    return 'bg-gradient-to-br from-purple-500 to-purple-600';
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {grids.length} grille{grids.length > 1 ? 's' : ''} générée{grids.length > 1 ? 's' : ''}
          </h3>
          <p className="text-sm text-gray-500">
            {gameType === 'euromillions' ? '5 numéros + 2 étoiles' : '6 numéros + 1 chance'}
          </p>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="btn-danger text-sm px-3 py-1"
          >
            🗑️ Effacer tout
          </button>
        )}
      </div>

      {/* Grilles */}
      <div className="space-y-4">
        {grids.map((grid, index) => (
          <div key={index} className="card p-4">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium text-gray-700">
                Grille #{index + 1}
              </span>
              {onAnalyzeGrid && (
                <button
                  onClick={() => onAnalyzeGrid(grid)}
                  className="btn-info text-xs px-2 py-1"
                >
                  🔍 Analyser
                </button>
              )}
            </div>

            {/* Numéros principaux */}
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-600 mb-2">
                Numéros principaux
              </div>
              <div className="number-grid">
                {grid.slice(0, gameType === 'euromillions' ? 5 : 6).map((number, numIndex) => (
                  <div
                    key={numIndex}
                    className={`number-ball ${getNumberClass(number)}`}
                  >
                    {number}
                  </div>
                ))}
              </div>
            </div>

            {/* Étoiles ou numéro chance */}
            <div>
              <div className="text-xs font-medium text-gray-600 mb-2">
                {gameType === 'euromillions' ? 'Étoiles' : 'Numéro chance'}
              </div>
              <div className="flex gap-2">
                {gameType === 'euromillions' ? (
                  // Étoiles pour Euromillions
                  grid.slice(5, 7).map((star, starIndex) => (
                    <div
                      key={starIndex}
                      className={`star-ball ${getStarClass(star)}`}
                    >
                      {star}
                    </div>
                  ))
                ) : (
                  // Numéro chance pour Lotto
                  <div
                    className={`chance-ball ${getChanceClass(grid[6])}`}
                  >
                    {grid[6]}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statistiques rapides */}
      {grids.length > 1 && (
        <div className="card p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            📊 Statistiques rapides
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Numéros les plus fréquents:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {getMostFrequentNumbers(grids, gameType).slice(0, 3).map((num, index) => (
                  <span key={index} className={`badge ${getBadgeColor(num)}`}>
                    {num}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Plages dominantes:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {getDominantRanges(grids, gameType).slice(0, 2).map((range, index) => (
                  <span key={index} className="badge badge-gray">
                    {range}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Fonctions utilitaires pour les statistiques
const getMostFrequentNumbers = (grids: number[][], gameType: 'euromillions' | 'lotto') => {
  const numberCounts: { [key: number]: number } = {};
  const maxNumbers = gameType === 'euromillions' ? 5 : 6;
  
  grids.forEach(grid => {
    grid.slice(0, maxNumbers).forEach(num => {
      numberCounts[num] = (numberCounts[num] || 0) + 1;
    });
  });
  
  return Object.entries(numberCounts)
    .sort(([,a], [,b]) => b - a)
    .map(([num]) => parseInt(num));
};

const getDominantRanges = (grids: number[][], gameType: 'euromillions' | 'lotto') => {
  const rangeCounts: { [key: string]: number } = {};
  const maxNumbers = gameType === 'euromillions' ? 5 : 6;
  
  grids.forEach(grid => {
    grid.slice(0, maxNumbers).forEach(num => {
      const range = getRangeForNumber(num);
      rangeCounts[range] = (rangeCounts[range] || 0) + 1;
    });
  });
  
  return Object.entries(rangeCounts)
    .sort(([,a], [,b]) => b - a)
    .map(([range]) => range);
};

const getRangeForNumber = (num: number) => {
  if (num <= 10) return '1-10';
  if (num <= 20) return '11-20';
  if (num <= 30) return '21-30';
  if (num <= 40) return '31-40';
  if (num <= 50) return '41-50';
  return '51+';
};

const getBadgeColor = (num: number) => {
  if (num <= 10) return 'badge-red';
  if (num <= 20) return 'badge-orange';
  if (num <= 30) return 'badge-yellow';
  if (num <= 40) return 'badge-green';
  if (num <= 50) return 'badge-blue';
  return 'badge-purple';
};

export default GridDisplay; 