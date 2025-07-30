import React, { useState, useMemo } from 'react';

interface NumberStat {
  numero: number;
  frequence: number;
  pourcentage: number;
}

interface DrawHistoryEntry {
  date: string;
  numbers: number[];
  stars?: number[];
  chanceNumber?: number;
}

interface CompleteNumberStatsProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: 'euromillions' | 'lotto';
  numbers: NumberStat[];
  stars?: NumberStat[];
  chanceNumbers?: NumberStat[];
  historyByYear?: Record<string, NumberStat[]>;
  starsByYear?: Record<string, NumberStat[]>;
  chanceByYear?: Record<string, NumberStat[]>;
  // Ajout pour la démo : historique complet des tirages (mock)
  drawHistory?: DrawHistoryEntry[];
  drawHistoryByYear?: Record<string, DrawHistoryEntry[]>;
}

type SortField = 'numero' | 'frequence' | 'pourcentage';
type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'hot' | 'cold' | 'balanced';
type PeriodType = 'global' | 'last3' | string;

const getAllNumbers = (max: number, stats: NumberStat[] = []) => {
  return Array.from({ length: max }, (_, i) => {
    const stat = stats.find(n => n.numero === i + 1);
    return {
      numero: i + 1,
      frequence: stat ? stat.frequence : 0,
      pourcentage: stat ? stat.pourcentage : 0,
    };
  });
};

const CompleteNumberStats: React.FC<CompleteNumberStatsProps> = ({
  isOpen,
  onClose,
  gameType,
  numbers,
  stars,
  chanceNumbers,
  historyByYear,
  starsByYear,
  chanceByYear,
  drawHistory,
  drawHistoryByYear
}) => {
  const [sortField, setSortField] = useState<SortField>('numero');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [period, setPeriod] = useState<PeriodType>('global');
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Récupération des années disponibles
  const availableYears = useMemo(() => {
    if (!historyByYear) return [];
    return Object.keys(historyByYear).sort((a, b) => parseInt(b) - parseInt(a));
  }, [historyByYear]);

  // Calcul des stats selon la période sélectionnée
  const periodStats = useMemo(() => {
    if (period === 'global' || !historyByYear) return numbers;
    if (period === 'last3') {
      const years = availableYears.slice(0, 3);
      const allStats: Record<number, { freq: number; total: number }> = {};
      years.forEach(year => {
        (historyByYear[year] || []).forEach(stat => {
          if (!allStats[stat.numero]) allStats[stat.numero] = { freq: 0, total: 0 };
          allStats[stat.numero].freq += stat.frequence;
          allStats[stat.numero].total += 1;
        });
      });
      const totalDraws = Object.values(allStats).reduce((acc, s) => acc + s.freq, 0);
      return getAllNumbers(gameType === 'euromillions' ? 50 : 49, Object.entries(allStats).map(([numero, s]) => ({
        numero: Number(numero),
        frequence: s.freq,
        pourcentage: totalDraws ? (s.freq / totalDraws) * 100 : 0
      })));
    }
    const stats = historyByYear[period] || [];
    const totalDraws = stats.reduce((acc, s) => acc + s.frequence, 0);
    return getAllNumbers(gameType === 'euromillions' ? 50 : 49, stats.map(s => ({
      ...s,
      pourcentage: totalDraws ? (s.frequence / totalDraws) * 100 : 0
    })));
  }, [period, numbers, historyByYear, availableYears, gameType]);

  // Même logique pour les étoiles et numéros chance
  const periodStars = useMemo(() => {
    if (!starsByYear || !stars) return stars || [];
    if (period === 'global') return stars;
    if (period === 'last3') {
      const years = availableYears.slice(0, 3);
      const allStats: Record<number, { freq: number; total: number }> = {};
      years.forEach(year => {
        (starsByYear[year] || []).forEach(stat => {
          if (!allStats[stat.numero]) allStats[stat.numero] = { freq: 0, total: 0 };
          allStats[stat.numero].freq += stat.frequence;
          allStats[stat.numero].total += 1;
        });
      });
      const totalDraws = Object.values(allStats).reduce((acc, s) => acc + s.freq, 0);
      return getAllNumbers(12, Object.entries(allStats).map(([numero, s]) => ({
        numero: Number(numero),
        frequence: s.freq,
        pourcentage: totalDraws ? (s.freq / totalDraws) * 100 : 0
      })));
    }
    const stats = starsByYear[period] || [];
    const totalDraws = stats.reduce((acc, s) => acc + s.frequence, 0);
    return getAllNumbers(12, stats.map(s => ({
      ...s,
      pourcentage: totalDraws ? (s.frequence / totalDraws) * 100 : 0
    })));
  }, [period, stars, starsByYear, availableYears]);

  const periodChance = useMemo(() => {
    if (!chanceByYear || !chanceNumbers) return chanceNumbers || [];
    if (period === 'global') return chanceNumbers;
    if (period === 'last3') {
      const years = availableYears.slice(0, 3);
      const allStats: Record<number, { freq: number; total: number }> = {};
      years.forEach(year => {
        (chanceByYear[year] || []).forEach(stat => {
          if (!allStats[stat.numero]) allStats[stat.numero] = { freq: 0, total: 0 };
          allStats[stat.numero].freq += stat.frequence;
          allStats[stat.numero].total += 1;
        });
      });
      const totalDraws = Object.values(allStats).reduce((acc, s) => acc + s.freq, 0);
      return getAllNumbers(10, Object.entries(allStats).map(([numero, s]) => ({
        numero: Number(numero),
        frequence: s.freq,
        pourcentage: totalDraws ? (s.freq / totalDraws) * 100 : 0
      })));
    }
    const stats = chanceByYear[period] || [];
    const totalDraws = stats.reduce((acc, s) => acc + s.frequence, 0);
    return getAllNumbers(10, stats.map(s => ({
      ...s,
      pourcentage: totalDraws ? (s.frequence / totalDraws) * 100 : 0
    })));
  }, [period, chanceNumbers, chanceByYear, availableYears]);

  const getFilteredAndSortedData = (data: NumberStat[]) => {
    let filtered = data;
    switch (filterType) {
      case 'hot':
        filtered = data.filter(item => item.pourcentage > 20);
        break;
      case 'cold':
        filtered = data.filter(item => item.pourcentage < 10);
        break;
      case 'balanced':
        filtered = data.filter(item => item.pourcentage >= 10 && item.pourcentage <= 20);
        break;
      default:
        filtered = data;
    }
    return filtered.sort((a, b) => {
      let aValue: number;
      let bValue: number;
      switch (sortField) {
        case 'numero':
          aValue = a.numero;
          bValue = b.numero;
          break;
        case 'frequence':
          aValue = a.frequence;
          bValue = b.frequence;
          break;
        case 'pourcentage':
          aValue = a.pourcentage;
          bValue = b.pourcentage;
          break;
        default:
          aValue = a.numero;
          bValue = b.numero;
      }
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  };

  const sortedNumbers = useMemo(() => getFilteredAndSortedData(periodStats), [periodStats, sortField, sortOrder, filterType]);
  const sortedStars = useMemo(() => getFilteredAndSortedData(periodStars), [periodStars, sortField, sortOrder, filterType]);
  const sortedChanceNumbers = useMemo(() => getFilteredAndSortedData(periodChance), [periodChance, sortField, sortOrder, filterType]);

  // Pagination
  const totalPages = Math.ceil(sortedNumbers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNumbers = sortedNumbers.slice(startIndex, endIndex);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [sortField, sortOrder, filterType, period]);

  // Historique des sorties pour le numéro sélectionné
  const selectedNumberHistory = useMemo(() => {
    if (!selectedNumber) return [];
    let draws: DrawHistoryEntry[] = [];
    if (period === 'global' || !drawHistoryByYear) {
      draws = drawHistory || [];
    } else if (period === 'last3') {
      const years = availableYears.slice(0, 3);
      draws = years.flatMap(y => drawHistoryByYear?.[y] || []);
    } else {
      draws = drawHistoryByYear?.[period] || [];
    }
    return draws.filter(draw => draw.numbers.includes(selectedNumber));
  }, [selectedNumber, period, drawHistory, drawHistoryByYear, availableYears]);

  const getPercentageColor = (percentage: number) => {
    if (percentage > 20) return 'bg-red-100 text-red-800 border-red-200';
    if (percentage >= 10 && percentage <= 20) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getPercentageLabel = (percentage: number) => {
    if (percentage > 20) return 'Chaud';
    if (percentage >= 10 && percentage <= 20) return 'Équilibré';
    return 'Froid';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            📊 Statistiques Complètes - {gameType === 'euromillions' ? 'Euromillions' : 'Lotto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Sélecteur de période */}
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <label className="font-medium text-gray-700">Période :</label>
          <button
            className={`px-3 py-1 rounded ${period === 'global' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setPeriod('global')}
          >
            Global
          </button>
          <button
            className={`px-3 py-1 rounded ${period === 'last3' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setPeriod('last3')}
            disabled={availableYears.length < 3}
          >
            3 dernières années
          </button>
          {availableYears.map(year => (
            <button
              key={year}
              className={`px-3 py-1 rounded ${period === year ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setPeriod(year)}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Contrôles de tri et filtrage */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tri */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trier par :
              </label>
              <select
                value={`${sortField}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-') as [SortField, SortOrder];
                  setSortField(field);
                  setSortOrder(order);
                }}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="numero-asc">Numéro (croissant)</option>
                <option value="numero-desc">Numéro (décroissant)</option>
                <option value="frequence-asc">Fréquence (croissante)</option>
                <option value="frequence-desc">Fréquence (décroissante)</option>
                <option value="pourcentage-asc">Pourcentage (croissant)</option>
                <option value="pourcentage-desc">Pourcentage (décroissant)</option>
              </select>
            </div>
            {/* Filtre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer par :
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">Tous les numéros</option>
                <option value="hot">Chauds (&gt;20%)</option>
                <option value="balanced">Équilibrés (10-20%)</option>
                <option value="cold">Froids (&lt;10%)</option>
              </select>
            </div>
            {/* Statistiques */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Résultats :
              </label>
              <div className="text-sm text-gray-600">
                {sortedNumbers.length} numéro{sortedNumbers.length !== 1 ? 's' : ''} au total • Page {currentPage} sur {totalPages}
              </div>
            </div>
          </div>
        </div>

        {/* Numéros principaux */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            🎯 Numéros Principaux ({gameType === 'euromillions' ? '1-50' : '1-49'})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {paginatedNumbers.map((stat) => (
              <div
                key={stat.numero}
                className={`p-3 rounded-lg border-2 cursor-pointer ${getPercentageColor(stat.pourcentage)} hover:shadow-lg transition-all`}
                onClick={() => setSelectedNumber(stat.numero)}
                title="Voir l'historique de ce numéro"
              >
                <div className="text-center">
                  <div className="text-lg font-bold">{stat.numero}</div>
                  <div className="text-sm">{stat.frequence} fois</div>
                  <div className="text-sm font-semibold">{stat.pourcentage.toFixed(1)}%</div>
                  <div className="text-xs mt-1 px-2 py-1 rounded-full bg-white bg-opacity-50">
                    {getPercentageLabel(stat.pourcentage)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Page {currentPage} sur {totalPages} ({startIndex + 1}-{Math.min(endIndex, sortedNumbers.length)} sur {sortedNumbers.length} numéros)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Étoiles (Euromillions) */}
        {gameType === 'euromillions' && sortedStars.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              ⭐ Étoiles (1-12)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {sortedStars.map((stat) => (
                <div
                  key={stat.numero}
                  className={`p-3 rounded-lg border-2 ${getPercentageColor(stat.pourcentage)}`}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold">{stat.numero}</div>
                    <div className="text-sm">{stat.frequence} fois</div>
                    <div className="text-sm font-semibold">{stat.pourcentage.toFixed(1)}%</div>
                    <div className="text-xs mt-1 px-2 py-1 rounded-full bg-white bg-opacity-50">
                      {getPercentageLabel(stat.pourcentage)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Numéros Chance (Lotto) */}
        {gameType === 'lotto' && sortedChanceNumbers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              🍀 Numéros Chance (1-10)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {sortedChanceNumbers.map((stat) => (
                <div
                  key={stat.numero}
                  className={`p-3 rounded-lg border-2 ${getPercentageColor(stat.pourcentage)}`}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold">{stat.numero}</div>
                    <div className="text-sm">{stat.frequence} fois</div>
                    <div className="text-sm font-semibold">{stat.pourcentage.toFixed(1)}%</div>
                    <div className="text-xs mt-1 px-2 py-1 rounded-full bg-white bg-opacity-50">
                      {getPercentageLabel(stat.pourcentage)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Légende */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
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

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Modale historique du numéro sélectionné */}
      {selectedNumber && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                📅 Historique du numéro {selectedNumber}
              </h3>
              <button
                onClick={() => setSelectedNumber(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            {selectedNumberHistory.length === 0 ? (
              <div className="text-gray-500 text-center py-8">Aucune sortie pour ce numéro dans la période sélectionnée.</div>
            ) : (
              <div className="space-y-3">
                {selectedNumberHistory.map((draw, idx) => (
                  <div key={idx} className="border border-gray-200 rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <span className="font-medium text-gray-800">
                        {new Date(draw.date).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">Tirage</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                      {draw.numbers.map((num, i) => (
                        <span
                          key={i}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${num === selectedNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                          {num}
                        </span>
                      ))}
                      {gameType === 'euromillions' && draw.stars && (
                        <span className="ml-2 text-yellow-600 font-bold">⭐</span>
                      )}
                      {gameType === 'euromillions' && draw.stars && draw.stars.map((star, i) => (
                        <span key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-yellow-400 text-white">{star}</span>
                      ))}
                      {gameType === 'lotto' && draw.chanceNumber && (
                        <span className="ml-2 text-green-600 font-bold">🍀</span>
                      )}
                      {gameType === 'lotto' && draw.chanceNumber && (
                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-green-500 text-white">{draw.chanceNumber}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompleteNumberStats; 