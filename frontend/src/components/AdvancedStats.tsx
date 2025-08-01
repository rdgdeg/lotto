import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AdvancedStatsProps {
  gameType: 'lotto' | 'euromillions';
  onClose: () => void;
  isOpen: boolean;
}

interface StatData {
  topNumbers: Array<{ number: number; frequency: number; percentage: number }>;
  topStars?: Array<{ number: number; frequency: number; percentage: number }>;
  topChance?: Array<{ number: number; frequency: number; percentage: number }>;
  patterns: Array<{ pattern: string; frequency: number }>;
  trends: Array<{ trend: string; description: string }>;
}

const AdvancedStats: React.FC<AdvancedStatsProps> = ({ gameType, onClose, isOpen }) => {
  const [stats, setStats] = useState<StatData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const isLotto = gameType === 'lotto';
  const primaryColor = isLotto ? 'green' : 'blue';
  const primaryGradient = isLotto 
    ? 'from-green-600 to-green-700' 
    : 'from-blue-600 to-blue-700';

  useEffect(() => {
    if (isOpen) {
      fetchAdvancedStats();
    }
  }, [isOpen, gameType]);

  const fetchAdvancedStats = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const endpoint = isLotto 
        ? '/api/loto/advanced/comprehensive-stats'
        : '/api/euromillions/advanced/comprehensive-stats';
      
      const response = await axios.get(`http://localhost:8000${endpoint}`);
      setStats(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError('Impossible de charger les statistiques avancées');
      
      // Données de démonstration
      setStats({
        topNumbers: [
          { number: 7, frequency: 15, percentage: 25.5 },
          { number: 12, frequency: 14, percentage: 23.8 },
          { number: 23, frequency: 13, percentage: 22.1 },
          { number: 34, frequency: 12, percentage: 20.4 },
          { number: 45, frequency: 11, percentage: 18.7 }
        ],
        topChance: isLotto ? [
          { number: 3, frequency: 8, percentage: 13.6 },
          { number: 8, frequency: 7, percentage: 11.9 },
          { number: 1, frequency: 6, percentage: 10.2 }
        ] : undefined,
        topStars: !isLotto ? [
          { number: 2, frequency: 12, percentage: 20.4 },
          { number: 8, frequency: 11, percentage: 18.7 },
          { number: 5, frequency: 10, percentage: 17.0 }
        ] : undefined,
        patterns: [
          { pattern: 'Pairs/Impairs', frequency: 45 },
          { pattern: 'Haute/Basse', frequency: 38 },
          { pattern: 'Somme', frequency: 52 }
        ],
        trends: [
          { trend: '📈 Hausse', description: 'Tendance à la hausse pour les numéros pairs' },
          { trend: '📉 Baisse', description: 'Diminution des numéros consécutifs' },
          { trend: '🔄 Cyclique', description: 'Cycle de 7 jours observé' }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 bg-gradient-to-r ${primaryGradient} text-white rounded-t-2xl`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {isLotto ? '📈 Statistiques Avancées Loto' : '📊 Statistiques Expert Euromillions'}
              </h2>
              <p className="text-white/80 mt-1">
                Analyse approfondie des tendances et patterns
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des statistiques avancées...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
              <p className="text-red-500 text-sm mt-2">Affichage des données de démonstration</p>
            </div>
          ) : null}

          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Numéros les plus fréquents */}
              <div className="card">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">🎯</span>
                    Numéros les plus fréquents
                  </h3>
                  <div className="space-y-3">
                    {stats.topNumbers.map((item, index) => (
                      <div key={item.number} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                            {item.number}
                          </span>
                          <span className="font-medium">#{index + 1}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{item.frequency} fois</div>
                          <div className="text-sm text-gray-500">{item.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Numéros chance/étoiles */}
              {(stats.topChance || stats.topStars) && (
                <div className="card">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <span className="mr-2">{isLotto ? '🍀' : '⭐'}</span>
                      {isLotto ? 'Numéros Chance' : 'Étoiles'}
                    </h3>
                    <div className="space-y-3">
                      {(stats.topChance || stats.topStars)?.map((item, index) => (
                        <div key={item.number} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className={`w-8 h-8 ${isLotto ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'} rounded-full flex items-center justify-center font-bold`}>
                              {item.number}
                            </span>
                            <span className="font-medium">#{index + 1}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{item.frequency} fois</div>
                            <div className="text-sm text-gray-500">{item.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Patterns */}
              <div className="card">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">🔍</span>
                    Patterns détectés
                  </h3>
                  <div className="space-y-3">
                    {stats.patterns.map((pattern) => (
                      <div key={pattern.pattern} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{pattern.pattern}</span>
                        <span className="text-blue-600 font-semibold">{pattern.frequency}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tendances */}
              <div className="card">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">📊</span>
                    Tendances actuelles
                  </h3>
                  <div className="space-y-3">
                    {stats.trends.map((trend) => (
                      <div key={trend.trend} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900">{trend.trend}</div>
                        <div className="text-sm text-gray-600 mt-1">{trend.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommandations */}
          <div className="mt-6 card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">💡</span>
                Recommandations basées sur l'analyse
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">🎯 Stratégie recommandée</h4>
                  <p className="text-blue-800 text-sm">
                    Privilégiez les numéros pairs et évitez les séquences consécutives. 
                    Incluez au moins 2 numéros parmi les plus fréquents.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">⚡ Conseil rapide</h4>
                  <p className="text-green-800 text-sm">
                    Les numéros entre 20-30 semblent sous-représentés actuellement. 
                    Considérez-les pour équilibrer votre grille.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedStats; 