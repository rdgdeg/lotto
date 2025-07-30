import React from 'react';

interface DetailedStatsVisualizationProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: 'euromillions' | 'lotto';
  stats: any;
}

const DetailedStatsVisualization: React.FC<DetailedStatsVisualizationProps> = ({
  isOpen,
  onClose,
  gameType,
  stats
}) => {
  if (!isOpen) return null;

  const renderNumberGrid = (numbers: any[], title: string, maxNumber: number) => {
    const grid = Array.from({ length: maxNumber }, (_, i) => {
      const number = i + 1;
      const stat = numbers.find((n: any) => n.numero === number);
      return {
        number,
        frequency: stat ? stat.frequence : 0,
        percentage: stat ? stat.pourcentage : 0
      };
    });

    const getColorClass = (percentage: number) => {
      if (percentage > 20) return 'bg-red-100 text-red-800 border-red-200';
      if (percentage >= 10 && percentage <= 20) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      return 'bg-blue-100 text-blue-800 border-blue-200';
    };

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {grid.map((item) => (
            <div
              key={item.number}
              className={`p-2 rounded-lg border-2 text-center text-sm ${getColorClass(item.percentage)}`}
            >
              <div className="font-bold">{item.number}</div>
              <div className="text-xs">{item.frequency}</div>
              <div className="text-xs font-semibold">{item.percentage.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            📊 Statistiques Détaillées - {gameType === 'euromillions' ? 'Euromillions' : 'Lotto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Statistiques des numéros principaux */}
          {stats?.top_numeros && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                🎯 Numéros Principaux
              </h3>
              {renderNumberGrid(
                stats.top_numeros,
                `Numéros (1-${gameType === 'euromillions' ? '50' : '49'})`,
                gameType === 'euromillions' ? 50 : 49
              )}
            </div>
          )}

          {/* Statistiques des étoiles (Euromillions) */}
          {gameType === 'euromillions' && stats?.top_etoiles && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                ⭐ Étoiles
              </h3>
              {renderNumberGrid(stats.top_etoiles, 'Étoiles (1-12)', 12)}
            </div>
          )}

          {/* Statistiques des numéros chance (Lotto) */}
          {gameType === 'lotto' && stats?.top_chance && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                🍀 Numéros Chance
              </h3>
              {renderNumberGrid(stats.top_chance, 'Numéros Chance (1-10)', 10)}
            </div>
          )}

          {/* Résumé des statistiques */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">📈 Résumé</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats?.top_numeros?.filter((n: any) => n.pourcentage > 20).length || 0}
                </div>
                <div className="text-sm text-gray-600">Numéros Chauds</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats?.top_numeros?.filter((n: any) => n.pourcentage >= 10 && n.pourcentage <= 20).length || 0}
                </div>
                <div className="text-sm text-gray-600">Numéros Équilibrés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats?.top_numeros?.filter((n: any) => n.pourcentage < 10).length || 0}
                </div>
                <div className="text-sm text-gray-600">Numéros Froids</div>
              </div>
            </div>
          </div>

          {/* Légende */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">Légende :</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-100 border-2 border-red-200 rounded mr-2"></div>
                <span className="text-sm text-gray-700">Chauds (&gt;20%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-200 rounded mr-2"></div>
                <span className="text-sm text-gray-700">Équilibrés (10-20%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-100 border-2 border-blue-200 rounded mr-2"></div>
                <span className="text-sm text-gray-700">Froids (&lt;10%)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailedStatsVisualization; 