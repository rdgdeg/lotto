import React, { useState, useEffect } from 'react';

interface NumberStat {
  numero: number;
  count: number;
  percentage: number;
  lastDraw?: string;
  draws: string[];
}

interface DetailedNumberStatsProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: 'euromillions' | 'lotto';
}

const DetailedNumberStats: React.FC<DetailedNumberStatsProps> = ({ isOpen, onClose, gameType }) => {
  const [stats, setStats] = useState<NumberStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'numero' | 'count' | 'percentage'>('count');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterRange, setFilterRange] = useState<{min: number, max: number}>({min: 1, max: gameType === 'euromillions' ? 50 : 49});

  // Données de test (à remplacer par un appel API)
  useEffect(() => {
    const generateMockStats = () => {
      const maxNumber = gameType === 'euromillions' ? 50 : 49;
      const mockStats: NumberStat[] = [];
      
      for (let i = 1; i <= maxNumber; i++) {
        const count = Math.floor(Math.random() * 50) + 5; // Entre 5 et 55 occurrences
        const percentage = (count / 100) * 100; // Pourcentage basé sur 100 tirages
        const draws = [];
        
        // Générer quelques dates de tirages aléatoires
        for (let j = 0; j < count; j++) {
          const year = 2020 + Math.floor(Math.random() * 5);
          const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
          const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
          draws.push(`${year}-${month}-${day}`);
        }
        
        mockStats.push({
          numero: i,
          count,
          percentage: parseFloat(percentage.toFixed(2)),
          lastDraw: draws[draws.length - 1],
          draws: draws.sort().reverse() // Plus récent en premier
        });
      }
      
      return mockStats;
    };

    setLoading(true);
    setTimeout(() => {
      setStats(generateMockStats());
      setLoading(false);
    }, 500);
  }, [gameType]);

  // Tri et filtrage des données
  const filteredAndSortedStats = stats
    .filter(stat => stat.numero >= filterRange.min && stat.numero <= filterRange.max)
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'numero':
          comparison = a.numero - b.numero;
          break;
        case 'count':
          comparison = a.count - b.count;
          break;
        case 'percentage':
          comparison = a.percentage - b.percentage;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedStats.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStats = filteredAndSortedStats.slice(startIndex, endIndex);

  const handleNumberClick = (numero: number) => {
    setSelectedNumber(selectedNumber === numero ? null : numero);
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage > 15) return 'bg-red-100 text-red-800 border-red-200';
    if (percentage >= 8 && percentage <= 15) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl max-h-[90vh] overflow-y-auto w-full mx-4">
        <div className="flex justify-between items-center mb-6">
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

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Contrôles de tri et filtrage */}
            <div className="mb-6 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Trier par:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'numero' | 'count' | 'percentage')}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="numero">Numéro</option>
                  <option value="count">Occurrences</option>
                  <option value="percentage">Pourcentage</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-2 py-1 bg-gray-200 rounded text-sm"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Filtrer:</label>
                <input
                  type="number"
                  min="1"
                  max={gameType === 'euromillions' ? 50 : 49}
                  value={filterRange.min}
                  onChange={(e) => setFilterRange({...filterRange, min: parseInt(e.target.value) || 1})}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-16"
                />
                <span className="text-sm">à</span>
                <input
                  type="number"
                  min="1"
                  max={gameType === 'euromillions' ? 50 : 49}
                  value={filterRange.max}
                  onChange={(e) => setFilterRange({...filterRange, max: parseInt(e.target.value) || (gameType === 'euromillions' ? 50 : 49)})}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-16"
                />
              </div>

              <div className="text-sm text-gray-600">
                {filteredAndSortedStats.length} numéros trouvés
              </div>
            </div>

            {/* Tableau des statistiques */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Numéro
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Occurrences
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pourcentage
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernier tirage
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Historique
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentStats.map((stat) => (
                    <React.Fragment key={stat.numero}>
                      <tr 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleNumberClick(stat.numero)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              {stat.numero}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {stat.count}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPercentageColor(stat.percentage)}`}>
                            {stat.percentage}%
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {stat.lastDraw}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-blue-600 hover:text-blue-800">
                            {selectedNumber === stat.numero ? 'Masquer' : 'Voir'} ({stat.draws.length})
                          </button>
                        </td>
                      </tr>
                      {selectedNumber === stat.numero && (
                        <tr>
                          <td colSpan={5} className="px-4 py-3 bg-gray-50">
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900">Historique des tirages pour le numéro {stat.numero}:</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                {stat.draws.slice(0, 12).map((draw, index) => (
                                  <div key={index} className="text-xs bg-white p-2 rounded border">
                                    {draw}
                                  </div>
                                ))}
                              </div>
                              {stat.draws.length > 12 && (
                                <p className="text-xs text-gray-500">
                                  ... et {stat.draws.length - 12} autres tirages
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Page {currentPage} sur {totalPages} ({startIndex + 1}-{Math.min(endIndex, filteredAndSortedStats.length)} sur {filteredAndSortedStats.length} numéros)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 border rounded text-sm ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DetailedNumberStats; 