import React, { useState, useMemo } from 'react';

interface AnnualStat {
  year: string;
  totalDraws: number;
  mostFrequentNumbers: Array<{ numero: number; count: number; percentage: number }>;
  leastFrequentNumbers: Array<{ numero: number; count: number; percentage: number }>;
  averageSum: number;
  averageNumbers: Array<{ numero: number; average: number }>;
  hotNumbers: Array<{ numero: number; count: number; percentage: number }>;
  coldNumbers: Array<{ numero: number; count: number; percentage: number }>;
  stars?: Array<{ numero: number; count: number; percentage: number }>;
  chanceNumbers?: Array<{ numero: number; count: number; percentage: number }>;
}

interface AnnualStatisticsProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: 'euromillions' | 'lotto';
}

const AnnualStatistics: React.FC<AnnualStatisticsProps> = ({ isOpen, onClose, gameType }) => {
  const [selectedYear, setSelectedYear] = useState<string>('2024');
  const [selectedView, setSelectedView] = useState<'overview' | 'numbers' | 'trends' | 'analysis'>('overview');

  // Génération des données de test pour les statistiques annuelles
  const annualStats: AnnualStat[] = useMemo(() => {
    // Tableau vide - sera rempli par les données CSV importées
    return [];
  }, [gameType]);

  const currentYearStats = useMemo(() => {
    if (annualStats.length === 0) return null;
    return annualStats.find(stat => stat.year === selectedYear) || annualStats[0];
  }, [annualStats, selectedYear]);

  const getPercentageColor = (percentage: number) => {
    if (percentage > 15) return 'bg-red-100 text-red-800 border-red-200';
    if (percentage >= 8 && percentage <= 15) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getPercentageLabel = (percentage: number) => {
    if (percentage > 15) return 'Très Chaud';
    if (percentage >= 8 && percentage <= 15) return 'Chaud';
    return 'Froid';
  };

  if (!isOpen) return null;

  // Si pas de données, afficher un message
  if (!currentYearStats) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">📈 Statistiques Annuelles</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>
          <p className="text-gray-600">Aucune donnée disponible pour l'année {selectedYear}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-7xl max-h-[95vh] overflow-y-auto w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            📊 Statistiques Annuelles - {gameType === 'euromillions' ? 'Euromillions' : 'Lotto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl"
          >
            ×
          </button>
        </div>

        {/* Sélecteur d'année et vue */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Année
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {annualStats.length > 0 ? (
                  annualStats.map((stat) => (
                    <option key={stat.year} value={stat.year}>
                      {stat.year}
                    </option>
                  ))
                ) : (
                  <option value="">Aucune donnée</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vue
              </label>
              <select
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value as any)}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value="overview">Vue d'ensemble</option>
                <option value="numbers">Numéros détaillés</option>
                <option value="trends">Tendances</option>
                <option value="analysis">Analyse avancée</option>
              </select>
            </div>

            <div className="ml-auto">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{currentYearStats?.totalDraws || 0}</span> tirages en {selectedYear}
              </div>
            </div>
          </div>
        </div>

        {/* Affichage des statistiques */}
        {currentYearStats ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Numéros chauds */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4 text-red-600">🔥 Numéros Chauds</h3>
              <div className="space-y-2">
                {currentYearStats.hotNumbers?.map((num, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="font-semibold text-lg">{num.numero}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPercentageColor(num.percentage)}`}>
                      {getPercentageLabel(num.percentage)} ({num.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Numéros froids */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">❄️ Numéros Froids</h3>
              <div className="space-y-2">
                {currentYearStats.coldNumbers?.map((num, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="font-semibold text-lg">{num.numero}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPercentageColor(num.percentage)}`}>
                      {getPercentageLabel(num.percentage)} ({num.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucune donnée disponible</p>
            <p className="text-gray-400 text-sm">Importez des données CSV pour voir les statistiques</p>
          </div>
        )}

        {/* Vue d'ensemble */}
        {selectedView === 'overview' && (
          <div className="space-y-6">
            {/* Statistiques générales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">🎯 Numéros Chauds</h3>
                <div className="space-y-2">
                  {currentYearStats?.hotNumbers?.slice(0, 5).map((num, index) => (
                    <div key={num.numero} className="flex justify-between items-center">
                      <span className="font-medium">#{num.numero}</span>
                      <span className="text-sm text-blue-600">{num.count} fois ({num.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 mb-2">❄️ Numéros Froids</h3>
                <div className="space-y-2">
                  {currentYearStats?.coldNumbers?.slice(0, 5).map((num, index) => (
                    <div key={num.numero} className="flex justify-between items-center">
                      <span className="font-medium">#{num.numero}</span>
                      <span className="text-sm text-red-600">{num.count} fois ({num.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">📈 Statistiques</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total tirages:</span>
                    <span className="font-medium">{currentYearStats?.totalDraws || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Moyenne somme:</span>
                    <span className="font-medium">{currentYearStats?.averageSum || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plus fréquent:</span>
                    <span className="font-medium">#{currentYearStats?.mostFrequentNumbers?.[0]?.numero || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Moins fréquent:</span>
                    <span className="font-medium">#{currentYearStats.leastFrequentNumbers[0]?.numero}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Étoiles ou numéros chance */}
            {(currentYearStats.stars || currentYearStats.chanceNumbers) && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                  {gameType === 'euromillions' ? '⭐ Étoiles' : '🍀 Numéros Chance'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {(currentYearStats.stars || currentYearStats.chanceNumbers)?.slice(0, 6).map((item) => (
                    <div key={item.numero} className="text-center">
                      <div className="w-12 h-12 rounded-full bg-yellow-600 text-white flex items-center justify-center mx-auto mb-1 font-bold">
                        {item.numero}
                      </div>
                      <div className="text-sm text-yellow-700">
                        {item.count} fois ({item.percentage}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vue numéros détaillés */}
        {selectedView === 'numbers' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800">🎯 Analyse Détaillée des Numéros</h3>
            
            {/* Numéros les plus fréquents */}
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-4">🔥 Top 10 - Numéros les plus fréquents</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {currentYearStats.mostFrequentNumbers.map((num, index) => (
                  <div
                    key={num.numero}
                    className={`p-3 rounded-lg border-2 ${getPercentageColor(num.percentage)}`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold">#{num.numero}</div>
                      <div className="text-sm">{num.count} fois</div>
                      <div className="text-sm font-semibold">{num.percentage}%</div>
                      <div className="text-xs mt-1 px-2 py-1 rounded-full bg-white bg-opacity-50">
                        {getPercentageLabel(num.percentage)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Numéros les moins fréquents */}
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-4">❄️ Top 10 - Numéros les moins fréquents</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {currentYearStats.leastFrequentNumbers.map((num, index) => (
                  <div
                    key={num.numero}
                    className={`p-3 rounded-lg border-2 ${getPercentageColor(num.percentage)}`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold">#{num.numero}</div>
                      <div className="text-sm">{num.count} fois</div>
                      <div className="text-sm font-semibold">{num.percentage}%</div>
                      <div className="text-xs mt-1 px-2 py-1 rounded-full bg-white bg-opacity-50">
                        {getPercentageLabel(num.percentage)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Vue tendances */}
        {selectedView === 'trends' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800">📈 Tendances Annuelles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Évolution du nombre de tirages */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">📊 Évolution des tirages</h4>
                <div className="space-y-2">
                  {annualStats.map(stat => (
                    <div key={stat.year} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium">{stat.year}</span>
                      <span className="text-sm text-gray-600">{stat.totalDraws} tirages</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Évolution de la moyenne */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">📊 Évolution de la moyenne</h4>
                <div className="space-y-2">
                  {annualStats.map(stat => (
                    <div key={stat.year} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium">{stat.year}</span>
                      <span className="text-sm text-gray-600">{stat.averageSum}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vue analyse avancée */}
        {selectedView === 'analysis' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800">🔬 Analyse Avancée</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Répartition par décennies */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">📊 Répartition par décennies</h4>
                <div className="space-y-2">
                  {[0, 1, 2, 3, 4].map(decade => {
                    const numbersInDecade = currentYearStats.mostFrequentNumbers.filter(
                      num => Math.floor((num.numero - 1) / 10) === decade
                    );
                    return (
                      <div key={decade} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{decade * 10 + 1}-{(decade + 1) * 10}</span>
                        <span className="text-sm text-gray-600">{numbersInDecade.length} numéros chauds</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Statistiques de parité */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">📊 Statistiques de parité</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Numéros pairs</span>
                    <span className="text-sm text-gray-600">
                      {currentYearStats.hotNumbers.filter(n => n.numero % 2 === 0).length} chauds
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Numéros impairs</span>
                    <span className="text-sm text-gray-600">
                      {currentYearStats.hotNumbers.filter(n => n.numero % 2 === 1).length} chauds
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnualStatistics; 