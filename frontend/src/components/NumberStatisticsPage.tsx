import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface NumberStat {
  numero: number;
  count: number;
  percentage: number;
  lastDraw?: string;
  draws: string[];
}

interface NumberStatisticsPageProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: 'euromillions' | 'lotto';
}

type FilterType = 'global' | 'current_year' | 'selected_year';

const NumberStatisticsPage: React.FC<NumberStatisticsPageProps> = ({ isOpen, onClose, gameType }) => {
  const [stats, setStats] = useState<NumberStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('global');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [sortOrder, setSortOrder] = useState<'most' | 'least'>('most');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchStats();
      fetchAvailableYears();
    }
  }, [isOpen, filterType, selectedYear, gameType]);

  const fetchAvailableYears = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/${gameType}/years`);
      setAvailableYears(response.data.years || []);
    } catch (err) {
      console.error('Erreur lors du chargement des années:', err);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `http://localhost:8000/api/${gameType}/number-stats`;
      const params: any = {};
      
      if (filterType === 'current_year') {
        params.year = new Date().getFullYear();
      } else if (filterType === 'selected_year') {
        params.year = selectedYear;
      }
      
      const response = await axios.get(url, { params });
      setStats(response.data.stats || []);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNumberClick = async (numero: number) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/${gameType}/number-details/${numero}`, {
        params: {
          year: filterType === 'current_year' ? new Date().getFullYear() : 
                filterType === 'selected_year' ? selectedYear : undefined
        }
      });
      
      // Mettre à jour les stats avec les détails du numéro
      const updatedStats = stats.map(stat => 
        stat.numero === numero ? { ...stat, ...response.data } : stat
      );
      setStats(updatedStats);
      setSelectedNumber(numero);
    } catch (err) {
      console.error('Erreur lors du chargement des détails:', err);
    }
  };

  const closeNumberDetails = () => {
    setSelectedNumber(null);
  };

  const getFilteredStats = () => {
    return stats.sort((a, b) => {
      if (sortOrder === 'most') {
        return b.count - a.count;
      } else {
        return a.count - b.count;
      }
    });
  };

  const getPaginatedStats = () => {
    const filtered = getFilteredStats();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = Math.ceil(getFilteredStats().length / itemsPerPage);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="text-center text-red-600">
            <h2 className="text-xl font-bold mb-4">Erreur</h2>
            <p>{error}</p>
            <button 
              onClick={fetchStats}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentStats = getPaginatedStats();
  const top10Stats = getFilteredStats().slice(0, 10);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-7xl max-h-[90vh] overflow-y-auto w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800">
            📊 Statistiques des Numéros - {gameType === 'euromillions' ? 'Euromillions' : 'Lotto'}
          </h1>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        {/* Filtres */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Période</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="global">Données globales</option>
                <option value="current_year">Année en cours ({new Date().getFullYear()})</option>
                <option value="selected_year">Année spécifique</option>
              </select>
            </div>

            {filterType === 'selected_year' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tri</label>
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value as 'most' | 'least')}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="most">Plus sortis</option>
                <option value="least">Moins sortis</option>
              </select>
            </div>

            <div className="ml-auto">
              <button 
                onClick={fetchStats}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                🔄 Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Top 10 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            🏆 Top 10 des numéros {sortOrder === 'most' ? 'les plus sortis' : 'les moins sortis'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {top10Stats.map((stat, index) => (
              <div 
                key={stat.numero}
                onClick={() => handleNumberClick(stat.numero)}
                className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    #{stat.numero}
                  </div>
                  <div className="text-lg font-semibold text-gray-800">
                    {stat.count} fois
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.percentage.toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    #{index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tableau complet avec pagination */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            📋 Classement complet ({stats.length} numéros)
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Rang</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Numéro</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Occurrences</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Pourcentage</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Dernier tirage</th>
                </tr>
              </thead>
              <tbody>
                {currentStats.map((stat, index) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + index;
                  return (
                    <tr 
                      key={stat.numero} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleNumberClick(stat.numero)}
                    >
                      <td className="border border-gray-300 px-4 py-2 font-semibold">
                        #{globalIndex + 1}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span className="font-bold text-blue-600">#{stat.numero}</span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {stat.count.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {stat.percentage.toFixed(2)}%
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                        {stat.lastDraw ? new Date(stat.lastDraw).toLocaleDateString('fr-FR') : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ← Précédent
              </button>
              
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} sur {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Suivant →
              </button>
            </div>
          )}
        </div>

        {/* Fiche détaillée du numéro */}
        {selectedNumber && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-blue-600">
                  📋 Fiche détaillée du numéro #{selectedNumber}
                </h2>
                <button onClick={closeNumberDetails} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
              </div>

              {(() => {
                const numberStat = stats.find(s => s.numero === selectedNumber);
                if (!numberStat) return <p>Aucune donnée disponible</p>;

                return (
                  <div className="space-y-6">
                    {/* Informations générales */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-blue-600">{numberStat.count}</div>
                        <div className="text-sm text-gray-600">Occurrences totales</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">{numberStat.percentage.toFixed(2)}%</div>
                        <div className="text-sm text-gray-600">Pourcentage</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <div className="text-lg font-bold text-purple-600">
                          {numberStat.lastDraw ? new Date(numberStat.lastDraw).toLocaleDateString('fr-FR') : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Dernier tirage</div>
                      </div>
                    </div>

                    {/* Historique des tirages */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">
                        📅 Historique des tirages ({numberStat.draws?.length || 0} tirages)
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                        {numberStat.draws && numberStat.draws.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {numberStat.draws.map((draw, index) => (
                              <div key={index} className="bg-white rounded p-2 text-sm">
                                {new Date(draw).toLocaleDateString('fr-FR')}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">Aucun historique disponible</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NumberStatisticsPage; 