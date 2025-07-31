import React, { useState, useEffect, useMemo } from 'react';
import { fetchYears, fetchQuickStats } from '../utils/apiHelpers';
import NumberHistoryModal from './NumberHistoryModal';

interface NumberStats {
  numero: number;
  count: number;
  percentage: number;
  lastAppearance?: string;
}

interface QuickNumberStatsProps {
  gameType: 'euromillions' | 'lotto';
  isOpen: boolean;
  onClose: () => void;
}

const QuickNumberStats: React.FC<QuickNumberStatsProps> = ({
  gameType,
  isOpen,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'numero' | 'count'>('count');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [numberStats, setNumberStats] = useState<NumberStats[]>([]);
  const [starStats, setStarStats] = useState<NumberStats[]>([]);
  const [totalDraws, setTotalDraws] = useState(0);
  const [historyModal, setHistoryModal] = useState<{
    isOpen: boolean;
    number: number;
    numberType: 'numero' | 'etoile' | 'bonus';
  }>({
    isOpen: false,
    number: 0,
    numberType: 'numero'
  });

  const gameConfig = {
    euromillions: {
      numberRange: 50,
      starRange: 12,
      numbersCount: 5,
      starsCount: 2
    },
    lotto: {
      numberRange: 45,
      starRange: 0,
      numbersCount: 6,
      starsCount: 0
    }
  };

  const currentConfig = gameConfig[gameType];

  // Tri des statistiques
  const sortedNumberStats = useMemo(() => {
    return [...numberStats].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'numero') {
        comparison = a.numero - b.numero;
      } else {
        comparison = a.count - b.count;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [numberStats, sortBy, sortOrder]);

  const sortedStarStats = useMemo(() => {
    return [...starStats].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'numero') {
        comparison = a.numero - b.numero;
      } else {
        comparison = a.count - b.count;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [starStats, sortBy, sortOrder]);

  // Charger les années disponibles
  useEffect(() => {
    fetchAvailableYears();
  }, [gameType]);

  // Charger les statistiques
  useEffect(() => {
    console.log('🔍 useEffect triggered:', { isOpen, gameType, selectedYear, selectedMonth });
    if (isOpen) {
      console.log('🚀 Ouverture du modal, appel de fetchStats');
      fetchStats();
    }
  }, [isOpen, gameType, selectedYear, selectedMonth]);

  const fetchAvailableYears = async () => {
    try {
      const years = await fetchYears(gameType);
      setAvailableYears(years);
    } catch (err) {
      console.error('Erreur lors du chargement des années:', err);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    console.log('🔄 fetchStats appelé pour:', gameType);

    try {
      const params = new URLSearchParams();
      if (selectedYear !== 'all') {
        params.append('year', selectedYear);
      }
      if (selectedMonth !== 'all') {
        params.append('month', selectedMonth);
      }

      const data = await fetchQuickStats(gameType, {
        year: selectedYear !== 'all' ? selectedYear : undefined,
        month: selectedMonth !== 'all' ? selectedMonth : undefined
      });
      console.log('📊 Données reçues:', data);
      
      setTotalDraws(data.total_draws || 0);
      console.log('📈 Total draws défini:', data.total_draws || 0);

      // Traiter les statistiques des numéros
      const numbers = data.numbers || [];
      const processedNumbers = Array.from({ length: currentConfig.numberRange }, (_, i) => {
        const num = i + 1;
        const stat = numbers.find((s: any) => s.numero === num);
        return {
          numero: num,
          count: stat?.count || 0,
          percentage: stat?.percentage || 0
        };
      });

      setNumberStats(processedNumbers);
      console.log('🎯 Number stats définis:', processedNumbers.length, 'numéros');

      // Traiter les statistiques des étoiles (Euromillions uniquement)
      if (gameType === 'euromillions') {
        const euromillionsData = data as any;
        const stars = euromillionsData.stars || [];
        const processedStars = Array.from({ length: currentConfig.starRange }, (_, i) => {
          const star = i + 1;
          const stat = stars.find((s: any) => s.numero === star);
          return {
            numero: star,
            count: stat?.count || 0,
            percentage: stat?.percentage || 0
          };
        });
        setStarStats(processedStars);
        console.log('⭐ Star stats définis:', processedStars.length, 'étoiles');
      } else {
        // Pour le Lotto, pas de section étoiles/complémentaires
        setStarStats([]);
      }

    } catch (err: any) {
      console.error('❌ Erreur lors du chargement des statistiques:', err);
      setError(err.response?.data?.detail || 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
      console.log('✅ fetchStats terminé');
    }
  };

  const getPeriodLabel = () => {
    if (selectedYear === 'all' && selectedMonth === 'all') {
      return 'Global';
    } else if (selectedYear !== 'all' && selectedMonth === 'all') {
      return `Année ${selectedYear}`;
    } else if (selectedYear !== 'all' && selectedMonth !== 'all') {
      const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
      ];
      return `${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`;
    }
    return 'Période sélectionnée';
  };

  const getColorClass = (percentage: number, index: number = -1) => {
    let baseClass = '';
    if (percentage >= 15) baseClass = 'bg-green-100 text-green-800 border-green-300';
    else if (percentage >= 10) baseClass = 'bg-blue-100 text-blue-800 border-blue-300';
    else if (percentage >= 5) baseClass = 'bg-yellow-100 text-yellow-800 border-yellow-300';
    else baseClass = 'bg-gray-100 text-gray-800 border-gray-300';
    
    // Ajouter une bordure spéciale pour les top 5 quand trié par occurrences
    if (sortBy === 'count' && index < 5) {
      baseClass += ' border-2 border-red-400 shadow-md';
    }
    
    return baseClass;
  };

  const handleNumberClick = (number: number, numberType: 'numero' | 'etoile' | 'bonus') => {
    setHistoryModal({
      isOpen: true,
      number,
      numberType
    });
  };

  const closeHistoryModal = () => {
    setHistoryModal({
      isOpen: false,
      number: 0,
      numberType: 'numero'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              📊 Statistiques Rapides - {gameType === 'euromillions' ? 'Euromillions' : 'Lotto'}
            </h2>
            <p className="text-gray-600 mt-1">
              {getPeriodLabel()} - {totalDraws} tirages analysés
              {totalDraws === 0 && (
                <span className="ml-2 text-orange-600 font-medium">
                  ⚠️ Aucune donnée disponible
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Contrôles compacts */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Filtres */}
              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium text-gray-700">Année:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="p-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Toutes</option>
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium text-gray-700">Mois:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="p-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tous</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month.toString().padStart(2, '0')}>
                      {new Date(2024, month - 1).toLocaleDateString('fr-FR', { month: 'short' })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tri */}
              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium text-gray-700">Tri:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'numero' | 'count')}
                  className="p-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="count">Occurrences</option>
                  <option value="numero">Numéro</option>
                </select>
              </div>

              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium text-gray-700">Ordre:</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="p-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="desc">↓</option>
                  <option value="asc">↑</option>
                </select>
              </div>

              <button
                onClick={fetchStats}
                disabled={loading}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? '🔄' : '🔄'}
              </button>

              <div className="text-xs text-gray-500 ml-2">
                {sortBy === 'count' ? 'Occurrences' : 'Numéro'} ({sortOrder === 'desc' ? '↓' : '↑'})
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des statistiques...</p>
            </div>
          ) : totalDraws === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucune donnée disponible</h3>
              <p className="text-gray-600 mb-6">
                Aucun tirage n'a été trouvé pour la période sélectionnée.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Que faire ?</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Importez vos fichiers CSV de tirages</li>
                  <li>• Vérifiez les filtres (année/mois)</li>
                  <li>• Utilisez le bouton "🔍 Diagnostic" pour vérifier l'état</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Statistiques des numéros - Utilisation complète de la largeur */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  🎯 Numéros ({currentConfig.numberRange} numéros)
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    - Trié par {sortBy === 'count' ? 'occurrences' : 'numéro'} ({sortOrder === 'desc' ? '↓' : '↑'})
                  </span>
                </h3>
                <div className="grid grid-cols-7 md:grid-cols-9 lg:grid-cols-10 xl:grid-cols-12 gap-1.5 max-h-80 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                  {sortedNumberStats.map((stat, index) => (
                    <div
                      key={stat.numero}
                      className={`p-2 border rounded-md text-center cursor-pointer hover:shadow-md transition-all duration-200 ${getColorClass(stat.percentage, index)}`}
                      onClick={() => handleNumberClick(stat.numero, 'numero')}
                      title={`Cliquez pour voir l'historique du numéro ${stat.numero}`}
                    >
                      <div className="text-base font-bold">{stat.numero.toString().padStart(2, '0')}</div>
                      <div className="text-xs font-medium">{stat.count}</div>
                      <div className="text-xs opacity-75">{stat.percentage.toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistiques des étoiles (Euromillions uniquement) */}
              {starStats.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    ⭐ Étoiles ({starStats.length} étoiles)
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      - Trié par {sortBy === 'count' ? 'occurrences' : 'numéro'} ({sortOrder === 'desc' ? '↓' : '↑'})
                    </span>
                  </h3>
                  <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-1.5 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                    {sortedStarStats.map((stat, index) => (
                      <div
                        key={stat.numero}
                        className={`p-2 border rounded-md text-center cursor-pointer hover:shadow-md transition-all duration-200 ${getColorClass(stat.percentage, index)}`}
                        onClick={() => handleNumberClick(stat.numero, 'etoile')}
                        title={`Cliquez pour voir l'historique de l'étoile ${stat.numero}`}
                      >
                        <div className="text-base font-bold">{stat.numero.toString().padStart(2, '0')}</div>
                        <div className="text-xs font-medium">{stat.count}</div>
                        <div className="text-xs opacity-75">{stat.percentage.toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Légende compacte */}
          <div className="mt-4 p-2 bg-gray-50 rounded-lg">
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                <span>≥15%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                <span>10-15%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                <span>5-10%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                <span>&lt;5%</span>
              </div>
              {sortBy === 'count' && (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-100 border-2 border-red-400 rounded shadow-sm"></div>
                  <span>Top 5</span>
                </div>
              )}
            </div>
          </div>

          {/* Modal d'historique */}
          <NumberHistoryModal
            isOpen={historyModal.isOpen}
            onClose={closeHistoryModal}
            gameType={gameType}
            number={historyModal.number}
            numberType={historyModal.numberType}
          />
        </div>
      </div>
    </div>
  );
};

export default QuickNumberStats; 