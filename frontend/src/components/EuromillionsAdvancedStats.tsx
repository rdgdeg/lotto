import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface CombinationData {
  type: string;
  numbers: number[];
  frequency: number;
  count: number;
}

interface PatternData {
  odd_even: Record<string, { count: number; frequency: number; probability: number }>;
  high_low: Record<string, { count: number; frequency: number; probability: number }>;
  sum_ranges: Record<string, { count: number; frequency: number; probability: number }>;
  star_patterns: Record<string, { count: number; frequency: number; probability: number }>;
}



interface ComprehensiveStats {
  basic_stats: {
    most_frequent_numbers: [number, number][];
    least_frequent_numbers: [number, number][];
    most_frequent_stars: [number, number][];
    least_frequent_stars: [number, number][];
    number_frequencies: Record<number, number>;
    star_frequencies: Record<number, number>;
  };
  frequent_combinations: CombinationData[];
  patterns: PatternData;
  hot_cold_analysis: {
    hot_numbers: Array<{ number: number; recent_frequency: number; older_frequency: number; trend: string }>;
    cold_numbers: Array<{ number: number; recent_frequency: number; older_frequency: number; trend: string }>;
    hot_stars: Array<{ star: number; recent_frequency: number; older_frequency: number; trend: string }>;
    cold_stars: Array<{ star: number; recent_frequency: number; older_frequency: number; trend: string }>;
    analysis_period: string;
  };
  payout_table: Record<string, { freq: number }>;
  yearly_stats: Record<number, {
    total_draws: number;
    most_frequent_numbers: [number, number][];
    most_frequent_stars: [number, number][];
    avg_numbers_per_draw: number;
    avg_stars_per_draw: number;
  }>;
  total_draws: number;
  date_range: { start: string; end: string };
}

interface EuromillionsAdvancedStatsProps {
  onClose: () => void;
  isOpen: boolean;
}

const EuromillionsAdvancedStats: React.FC<EuromillionsAdvancedStatsProps> = ({ onClose, isOpen }) => {
  const [stats, setStats] = useState<ComprehensiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('payout');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [numberDetails, setNumberDetails] = useState<any>(null);
  const [searchDate, setSearchDate] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/euromillions/advanced/comprehensive-stats');
      setStats(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNumberDetails = async (number: number) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/euromillions/number-details/${number}`);
      setNumberDetails(response.data);
      setSelectedNumber(number);
    } catch (err) {
      console.error('Erreur lors de la récupération des détails:', err);
    }
  };

  const searchByDate = async () => {
    if (!searchDate) return;
    
    try {
      setSearchLoading(true);
      const response = await axios.get(`http://localhost:8000/api/euromillions/draws-by-date?date=${searchDate}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
      setSearchResults(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const closeNumberDetails = () => {
    setSelectedNumber(null);
    setNumberDetails(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <h2 className="text-xl font-bold mb-4">Erreur</h2>
        <p>{error}</p>
        <button 
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!stats || stats.total_draws === 0) {
    return (
      <div className="text-center text-gray-600 p-8">
        <h2 className="text-xl font-bold mb-4">Aucune donnée disponible</h2>
        <p>Importez des données Euromillions pour voir les statistiques avancées.</p>
        <button 
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Actualiser
        </button>
      </div>
    );
  }

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(4)}%`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-800">
            Statistiques Avancées Euromillions
          </h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ✕
          </button>
        </div>
        <div className="p-6">

      {/* Résumé général */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Résumé Général</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total_draws?.toLocaleString() || '0'}</div>
            <div className="text-sm text-gray-600">Total des tirages</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {stats.date_range?.start || 'N/A'} - {stats.date_range?.end || 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Période analysée</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.frequent_combinations?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Combinaisons fréquentes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Object.keys(stats.payout_table || {}).length}
            </div>
            <div className="text-sm text-gray-600">Catégories de gains</div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'payout', label: 'Tableau de Gains' },
          { id: 'combinations', label: 'Combinaisons Fréquentes' },
          { id: 'patterns', label: 'Patterns' },
          { id: 'hotcold', label: 'Analyse Chaud/Froid' },
          { id: 'basic', label: 'Statistiques de Base' },
          { id: 'numbers', label: 'Liste des Numéros' },
          { id: 'search', label: 'Recherche par Date' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeTab === 'payout' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Tableau de Gains Euromillions</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Combinaison</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Fréquence</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.payout_table || {}).map(([combo, data]) => (
                    <tr key={combo} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-semibold">{combo}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {combo === "5+2" ? "Jackpot" : 
                         combo === "5+1" ? "2ème rang" :
                         combo === "5+0" ? "3ème rang" :
                         combo === "4+2" ? "4ème rang" :
                         combo === "4+1" ? "5ème rang" :
                         combo === "4+0" ? "6ème rang" :
                         combo === "3+2" ? "7ème rang" :
                         combo === "3+1" ? "8ème rang" :
                         combo === "3+0" ? "9ème rang" :
                         combo === "2+2" ? "10ème rang" :
                         combo === "2+1" ? "11ème rang" :
                         combo === "2+0" ? "12ème rang" :
                         combo === "1+2" ? "13ème rang" :
                         combo === "1+1" ? "14ème rang" :
                         combo === "1+0" ? "15ème rang" :
                         combo === "0+2" ? "16ème rang" :
                         combo === "0+1" ? "17ème rang" :
                         "Aucun gain"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{formatPercentage(data.freq)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'combinations' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Combinaisons Fréquentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(stats.frequent_combinations || []).slice(0, 15).map((combo, index) => (
                <div key={index} className="border border-gray-300 rounded-lg p-4 hover:shadow-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-blue-600 capitalize">{combo.type}</span>
                    <span className="text-sm text-gray-500">{formatPercentage(combo.frequency)}</span>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    Numéros: {combo.numbers.join(', ')}
                  </div>
                  <div className="text-xs text-gray-500">
                    Apparitions: {combo.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'patterns' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Analyse des Patterns</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patterns Pairs/Impairs */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-700">Pairs/Impairs</h3>
                <div className="space-y-2">
                  {Object.entries(stats.patterns.odd_even).map(([pattern, data]) => (
                    <div key={pattern} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium">{pattern}</span>
                      <span className="text-blue-600">{formatPercentage(data.probability)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patterns Hauts/Bas */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-700">Hauts/Bas (1-25 / 26-50)</h3>
                <div className="space-y-2">
                  {Object.entries(stats.patterns.high_low).map(([pattern, data]) => (
                    <div key={pattern} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium">{pattern}</span>
                      <span className="text-green-600">{formatPercentage(data.probability)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sommes */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-700">Somme des Numéros</h3>
                <div className="space-y-2">
                  {Object.entries(stats.patterns.sum_ranges).map(([pattern, data]) => (
                    <div key={pattern} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium">{pattern}</span>
                      <span className="text-purple-600">{formatPercentage(data.probability)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patterns Étoiles */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-700">Patterns Étoiles</h3>
                <div className="space-y-2">
                  {Object.entries(stats.patterns.star_patterns).map(([pattern, data]) => (
                    <div key={pattern} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium">{pattern}</span>
                      <span className="text-orange-600">{formatPercentage(data.probability)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hotcold' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Analyse Chaud/Froid</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Numéros Chauds */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-600">Numéros Chauds</h3>
                <div className="space-y-2">
                  {stats.hot_cold_analysis.hot_numbers.slice(0, 10).map((item) => (
                    <div key={item.number} className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <span className="font-medium">Numéro {item.number}</span>
                      <span className="text-red-600">
                        {formatPercentage(item.recent_frequency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Numéros Froids */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Numéros Froids</h3>
                <div className="space-y-2">
                  {stats.hot_cold_analysis.cold_numbers.slice(0, 10).map((item) => (
                    <div key={item.number} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                      <span className="font-medium">Numéro {item.number}</span>
                      <span className="text-blue-600">
                        {formatPercentage(item.recent_frequency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Étoiles Chaudes */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-orange-600">Étoiles Chaudes</h3>
                <div className="space-y-2">
                  {stats.hot_cold_analysis.hot_stars.slice(0, 6).map((item) => (
                    <div key={item.star} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                      <span className="font-medium">Étoile {item.star}</span>
                      <span className="text-orange-600">
                        {formatPercentage(item.recent_frequency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Étoiles Froides */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-indigo-600">Étoiles Froides</h3>
                <div className="space-y-2">
                  {stats.hot_cold_analysis.cold_stars.slice(0, 6).map((item) => (
                    <div key={item.star} className="flex justify-between items-center p-2 bg-indigo-50 rounded">
                      <span className="font-medium">Étoile {item.star}</span>
                      <span className="text-indigo-600">
                        {formatPercentage(item.recent_frequency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'basic' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Statistiques de Base</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Numéros les plus fréquents */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-600">Numéros les Plus Fréquents</h3>
                <div className="space-y-2">
                  {stats.basic_stats.most_frequent_numbers.slice(0, 10).map(([number, count]) => (
                    <div key={number} className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span className="font-medium">Numéro {number}</span>
                      <span className="text-green-600">{count} fois</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Numéros les moins fréquents */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-600">Numéros les Moins Fréquents</h3>
                <div className="space-y-2">
                  {stats.basic_stats.least_frequent_numbers.slice(0, 10).map(([number, count]) => (
                    <div key={number} className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <span className="font-medium">Numéro {number}</span>
                      <span className="text-red-600">{count} fois</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Étoiles les plus fréquentes */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple-600">Étoiles les Plus Fréquentes</h3>
                <div className="space-y-2">
                  {stats.basic_stats.most_frequent_stars.slice(0, 6).map(([star, count]) => (
                    <div key={star} className="flex justify-between items-center p-2 bg-purple-50 rounded">
                      <span className="font-medium">Étoile {star}</span>
                      <span className="text-purple-600">{count} fois</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Étoiles les moins fréquentes */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-orange-600">Étoiles les Moins Fréquentes</h3>
                <div className="space-y-2">
                  {stats.basic_stats.least_frequent_stars.slice(0, 6).map(([star, count]) => (
                    <div key={star} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                      <span className="font-medium">Étoile {star}</span>
                      <span className="text-orange-600">{count} fois</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'numbers' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Liste Complète des Numéros</h2>
            
            {/* Pagination */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">
                Page {currentPage} sur {Math.ceil(50 / 15)}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(Math.ceil(50 / 15), currentPage + 1))}
                  disabled={currentPage === Math.ceil(50 / 15)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>

            {/* Liste des numéros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 50 }, (_, i) => i + 1)
                .slice((currentPage - 1) * 15, currentPage * 15)
                .map((number) => {
                  const frequency = stats?.basic_stats?.number_frequencies?.[number] || 0;
                  const percentage = stats?.total_draws ? (frequency / stats.total_draws * 100) : 0;
                  
                  return (
                    <div 
                      key={number} 
                      className="border border-gray-300 rounded-lg p-4 hover:shadow-md cursor-pointer transition-all"
                      onClick={() => fetchNumberDetails(number)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          {number}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatPercentage(percentage)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">
                        <div>Occurrences: <span className="font-semibold">{frequency}</span></div>
                        <div>Dernière apparition: <span className="font-semibold">-</span></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Recherche par Date</h2>
            
            <div className="mb-6">
              <div className="flex gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date du tirage
                  </label>
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={searchByDate}
                  disabled={!searchDate || searchLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {searchLoading ? 'Recherche...' : 'Rechercher'}
                </button>
              </div>
            </div>

            {searchResults && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Résultats pour le {searchDate}</h3>
                {searchResults.draws && searchResults.draws.length > 0 ? (
                  <div className="space-y-4">
                    {searchResults.draws.map((draw: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-4 border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500">Tirage #{draw.id}</span>
                          <span className="text-sm text-gray-500">{draw.date}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium">Numéros:</span>
                          {[draw.n1, draw.n2, draw.n3, draw.n4, draw.n5].map((num: number) => (
                            <span key={num} className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {num}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Étoiles:</span>
                          {[draw.e1, draw.e2].map((star: number) => (
                            <span key={star} className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {star}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Aucun tirage trouvé pour cette date.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal pour les détails d'un numéro */}
      {selectedNumber && numberDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Détails du Numéro {selectedNumber}
              </h2>
              <button
                onClick={closeNumberDetails}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Statistiques générales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{numberDetails.total_occurrences || 0}</div>
                  <div className="text-sm text-blue-600">Total d'apparitions</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {numberDetails.percentage ? formatPercentage(numberDetails.percentage) : '0%'}
                  </div>
                  <div className="text-sm text-green-600">Fréquence</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{numberDetails.last_appearance || 'N/A'}</div>
                  <div className="text-sm text-purple-600">Dernière apparition</div>
                </div>
              </div>

              {/* Historique des tirages */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Historique des Apparitions</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {numberDetails.draws && numberDetails.draws.length > 0 ? (
                    <div className="space-y-2">
                      {numberDetails.draws.map((draw: any, index: number) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded p-2">
                          <span className="text-sm text-gray-600">Tirage #{draw.id}</span>
                          <span className="text-sm font-medium">{draw.date}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Position:</span>
                            <span className="text-xs font-bold text-blue-600">{draw.position}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Aucun historique disponible.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default EuromillionsAdvancedStats; 