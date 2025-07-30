import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface SimplifiedStats {
  summary: {
    total_draws: number;
    date_range: { start: string; end: string };
    top_numbers: Array<{ numero: number; count: number; percentage: number }>;
    bottom_numbers: Array<{ numero: number; count: number; percentage: number }>;
    top_stars: Array<{ numero: number; count: number; percentage: number }>;
    bottom_stars: Array<{ numero: number; count: number; percentage: number }>;
  };
  predictions: {
    overdue_numbers: Array<[number, number]>;
    overdue_stars: Array<[number, number]>;
    hot_numbers: Array<[number, number]>;
    cold_numbers: Array<[number, number]>;
  };
  patterns: {
    most_frequent_patterns: Array<[string, number]>;
    most_frequent_sequences: Array<[string, number]>;
  };
}

interface SimplifiedEuromillionsDashboardProps {
  onClose: () => void;
  isOpen: boolean;
}

const SimplifiedEuromillionsDashboard: React.FC<SimplifiedEuromillionsDashboardProps> = ({ onClose, isOpen }) => {
  const [stats, setStats] = useState<SimplifiedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'overview' | 'numbers' | 'predictions' | 'generator'>('overview');
  const [generatedGrid, setGeneratedGrid] = useState<{ numbers: number[]; stars: number[] } | null>(null);
  const [numbersPage, setNumbersPage] = useState(1);
  const [predictionsPage, setPredictionsPage] = useState(1);
  const [numbersPerPage] = useState(20);
  const [predictionsPerPage] = useState(20);

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Utiliser l'endpoint quick-stats qui est plus rapide
      const response = await axios.get('http://localhost:8000/api/euromillions/quick-stats');
      const quickStats = response.data;
      
      // Transformer les données pour correspondre à l'interface attendue
      const transformedStats: SimplifiedStats = {
        summary: {
          total_draws: quickStats.total_draws,
          date_range: { start: "2020-01-01", end: new Date().toISOString().split('T')[0] },
          top_numbers: quickStats.numbers
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 5)
            .map((num: any) => ({
              numero: num.numero,
              count: num.count,
              percentage: num.percentage
            })),
          bottom_numbers: quickStats.numbers
            .sort((a: any, b: any) => a.count - b.count)
            .slice(0, 5)
            .map((num: any) => ({
              numero: num.numero,
              count: num.count,
              percentage: num.percentage
            })),
          top_stars: quickStats.stars
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 3)
            .map((star: any) => ({
              numero: star.numero,
              count: star.count,
              percentage: star.percentage
            })),
          bottom_stars: quickStats.stars
            .sort((a: any, b: any) => a.count - b.count)
            .slice(0, 3)
            .map((star: any) => ({
              numero: star.numero,
              count: star.count,
              percentage: star.percentage
            }))
        },
        predictions: {
          overdue_numbers: quickStats.numbers
            .filter((num: any) => num.last_appearance)
            .sort((a: any, b: any) => {
              const dateA = new Date(a.last_appearance);
              const dateB = new Date(b.last_appearance);
              return dateA.getTime() - dateB.getTime();
            })
            .slice(0, 5)
            .map((num: any) => [num.numero, num.count]),
          overdue_stars: quickStats.stars
            .filter((star: any) => star.last_appearance)
            .sort((a: any, b: any) => {
              const dateA = new Date(a.last_appearance);
              const dateB = new Date(b.last_appearance);
              return dateA.getTime() - dateB.getTime();
            })
            .slice(0, 3)
            .map((star: any) => [star.numero, star.count]),
          hot_numbers: quickStats.numbers
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 5)
            .map((num: any) => [num.numero, num.count]),
          cold_numbers: quickStats.numbers
            .sort((a: any, b: any) => a.count - b.count)
            .slice(0, 5)
            .map((num: any) => [num.numero, num.count])
        },
        patterns: {
          most_frequent_patterns: [],
          most_frequent_sequences: []
        }
      };
      
      setStats(transformedStats);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateSimpleGrid = () => {
    if (!stats) return;

    // Stratégie améliorée : plus de variété dans la sélection
    const overdueNums = (stats.predictions.overdue_numbers || []).slice(0, 4).map(([num]: [number, number]) => num);
    const hotNums = (stats.predictions.hot_numbers || []).slice(0, 3).map(([num]: [number, number]) => num);
    const topNums = (stats.summary.top_numbers || []).slice(0, 2).map((num: { numero: number }) => num.numero);
    
    // Mélanger et sélectionner 5 numéros
    const allNumbers = [...overdueNums, ...hotNums, ...topNums];
    const shuffled = allNumbers.sort(() => Math.random() - 0.5);
    const numbers = shuffled.slice(0, 5).sort((a, b) => a - b);

    // Étoiles : mélange de stratégies
    const overdueStars = (stats.predictions.overdue_stars || []).slice(0, 2).map(([star]: [number, number]) => star);
    const hotStars = (stats.predictions.hot_numbers || []).slice(0, 2).map(([star]: [number, number]) => star);
    const topStars = (stats.summary.top_stars || []).slice(0, 1).map((star: { numero: number }) => star.numero);
    
    const allStars = [...overdueStars, ...hotStars, ...topStars];
    const shuffledStars = allStars.sort(() => Math.random() - 0.5);
    const stars = shuffledStars.slice(0, 2).sort((a, b) => a - b);

    setGeneratedGrid({ numbers, stars });
  };

  const handleSectionChange = (section: 'overview' | 'numbers' | 'predictions' | 'generator') => {
    setActiveSection(section);
    // Réinitialiser les pages quand on change de section
    if (section === 'numbers') {
      setNumbersPage(1);
    } else if (section === 'predictions') {
      setPredictionsPage(1);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="text-center text-gray-600 p-8">
            <h2 className="text-xl font-bold mb-4">Aucune donnée disponible</h2>
            <p>Importez des données Euromillions pour commencer.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">🎰 Euromillions - Guide Simple</h2>
            <p className="text-gray-600 mt-2">
              {stats.summary.total_draws} tirages analysés • Interface simplifiée
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Navigation simple */}
        <div className="flex space-x-2 mb-8 bg-gray-100 p-2 rounded-lg">
          <button
            onClick={() => handleSectionChange('overview')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeSection === 'overview' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📊 Vue d'ensemble
          </button>
          <button
            onClick={() => handleSectionChange('numbers')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeSection === 'numbers' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            🔢 Numéros
          </button>
          <button
            onClick={() => handleSectionChange('predictions')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeSection === 'predictions' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            🔮 Prédictions
          </button>
          <button
            onClick={() => handleSectionChange('generator')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeSection === 'generator' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            🎯 Générateur
          </button>
        </div>

        {/* Contenu des sections */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Bienvenue dans votre guide Euromillions !</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Cette interface simplifiée vous guide étape par étape pour analyser les tirages 
                et générer des grilles optimisées. Commencez par explorer les numéros, 
                puis découvrez nos prédictions et générez votre grille.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">🔢</div>
                <h4 className="text-lg font-semibold text-blue-800 mb-2">Analyser les numéros</h4>
                <p className="text-blue-600 text-sm">
                  Découvrez les numéros les plus et moins fréquents
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">🔮</div>
                <h4 className="text-lg font-semibold text-green-800 mb-2">Voir les prédictions</h4>
                <p className="text-green-600 text-sm">
                  Numéros en retard et tendances récentes
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">🎯</div>
                <h4 className="text-lg font-semibold text-purple-800 mb-2">Générer une grille</h4>
                <p className="text-purple-600 text-sm">
                  Grille optimisée basée sur nos analyses
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'numbers' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 Analyse des Numéros</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Numéros les plus fréquents */}
              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-green-800 mb-4">🔥 Numéros les plus fréquents</h4>
                
                {/* Pagination pour les numéros fréquents */}
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-600">
                    Page {numbersPage} sur {Math.ceil((stats.summary.top_numbers || []).length / numbersPerPage)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNumbersPage(Math.max(1, numbersPage - 1))}
                      disabled={numbersPage === 1}
                      className="px-3 py-1 bg-green-200 text-green-700 rounded disabled:opacity-50 text-sm"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => setNumbersPage(Math.min(Math.ceil((stats.summary.top_numbers || []).length / numbersPerPage), numbersPage + 1))}
                      disabled={numbersPage === Math.ceil((stats.summary.top_numbers || []).length / numbersPerPage)}
                      className="px-3 py-1 bg-green-200 text-green-700 rounded disabled:opacity-50 text-sm"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {(stats.summary.top_numbers || [])
                    .slice((numbersPage - 1) * numbersPerPage, numbersPage * numbersPerPage)
                    .map((num: { numero: number; count: number; percentage: number }, index: number) => (
                    <div key={num.numero} className="flex items-center justify-between bg-white rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {num.numero}
                        </span>
                        <div>
                          <div className="font-medium">Numéro {num.numero}</div>
                          <div className="text-sm text-gray-500">#{((numbersPage - 1) * numbersPerPage) + index + 1} le plus fréquent</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-800">{num.count} fois</div>
                        <div className="text-sm text-green-600">{num.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Numéros les moins fréquents */}
              <div className="bg-red-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-red-800 mb-4">❄️ Numéros les moins fréquents</h4>
                
                {/* Pagination pour les numéros moins fréquents */}
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-600">
                    Page {numbersPage} sur {Math.ceil((stats.summary.bottom_numbers || []).length / numbersPerPage)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNumbersPage(Math.max(1, numbersPage - 1))}
                      disabled={numbersPage === 1}
                      className="px-3 py-1 bg-red-200 text-red-700 rounded disabled:opacity-50 text-sm"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => setNumbersPage(Math.min(Math.ceil((stats.summary.bottom_numbers || []).length / numbersPerPage), numbersPage + 1))}
                      disabled={numbersPage === Math.ceil((stats.summary.bottom_numbers || []).length / numbersPerPage)}
                      className="px-3 py-1 bg-red-200 text-red-700 rounded disabled:opacity-50 text-sm"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {(stats.summary.bottom_numbers || [])
                    .slice((numbersPage - 1) * numbersPerPage, numbersPage * numbersPerPage)
                    .map((num: { numero: number; count: number; percentage: number }, index: number) => (
                    <div key={num.numero} className="flex items-center justify-between bg-white rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {num.numero}
                        </span>
                        <div>
                          <div className="font-medium">Numéro {num.numero}</div>
                          <div className="text-sm text-gray-500">#{((numbersPage - 1) * numbersPerPage) + index + 1} le moins fréquent</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-red-800">{num.count} fois</div>
                        <div className="text-sm text-red-600">{num.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'predictions' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">🔮 Prédictions et Tendances</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Numéros en retard */}
              <div className="bg-yellow-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-yellow-800 mb-4">⏰ Numéros en retard</h4>
                <p className="text-yellow-700 text-sm mb-4">
                  Ces numéros n'ont pas été tirés depuis longtemps. 
                  Selon la théorie de l'équilibre, ils pourraient bientôt apparaître.
                </p>
                
                {/* Pagination pour les numéros en retard */}
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-600">
                    Page {predictionsPage} sur {Math.ceil((stats.predictions.overdue_numbers || []).length / predictionsPerPage)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPredictionsPage(Math.max(1, predictionsPage - 1))}
                      disabled={predictionsPage === 1}
                      className="px-3 py-1 bg-yellow-200 text-yellow-700 rounded disabled:opacity-50 text-sm"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => setPredictionsPage(Math.min(Math.ceil((stats.predictions.overdue_numbers || []).length / predictionsPerPage), predictionsPage + 1))}
                      disabled={predictionsPage === Math.ceil((stats.predictions.overdue_numbers || []).length / predictionsPerPage)}
                      className="px-3 py-1 bg-yellow-200 text-yellow-700 rounded disabled:opacity-50 text-sm"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {(stats.predictions.overdue_numbers || [])
                    .slice((predictionsPage - 1) * predictionsPerPage, predictionsPage * predictionsPerPage)
                    .map(([num, gap]: [number, number], index: number) => (
                    <div key={num} className="flex items-center justify-between bg-white rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {num}
                        </span>
                        <div>
                          <div className="font-medium">Numéro {num}</div>
                          <div className="text-sm text-gray-500">#{((predictionsPage - 1) * predictionsPerPage) + index + 1} en retard</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-yellow-800">{gap} tirages</div>
                        <div className="text-sm text-yellow-600">sans apparition</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Numéros chauds */}
              <div className="bg-orange-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-orange-800 mb-4">🔥 Numéros chauds</h4>
                <p className="text-orange-700 text-sm mb-4">
                  Ces numéros sont apparus fréquemment dans les 50 derniers tirages. 
                  Ils suivent une tendance positive.
                </p>
                
                {/* Pagination pour les numéros chauds */}
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-600">
                    Page {predictionsPage} sur {Math.ceil((stats.predictions.hot_numbers || []).length / predictionsPerPage)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPredictionsPage(Math.max(1, predictionsPage - 1))}
                      disabled={predictionsPage === 1}
                      className="px-3 py-1 bg-orange-200 text-orange-700 rounded disabled:opacity-50 text-sm"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => setPredictionsPage(Math.min(Math.ceil((stats.predictions.hot_numbers || []).length / predictionsPerPage), predictionsPage + 1))}
                      disabled={predictionsPage === Math.ceil((stats.predictions.hot_numbers || []).length / predictionsPerPage)}
                      className="px-3 py-1 bg-orange-200 text-orange-700 rounded disabled:opacity-50 text-sm"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {(stats.predictions.hot_numbers || [])
                    .slice((predictionsPage - 1) * predictionsPerPage, predictionsPage * predictionsPerPage)
                    .map(([num, count]: [number, number], index: number) => (
                    <div key={num} className="flex items-center justify-between bg-white rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {num}
                        </span>
                        <div>
                          <div className="font-medium">Numéro {num}</div>
                          <div className="text-sm text-gray-500">#{((predictionsPage - 1) * predictionsPerPage) + index + 1} le plus chaud</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-orange-800">{count} fois</div>
                        <div className="text-sm text-orange-600">récemment</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'generator' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">🎯 Générateur de Grille</h3>
            
            <div className="text-center mb-8">
              <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                Notre générateur utilise une stratégie équilibrée : 
                il combine des numéros en retard (qui pourraient bientôt apparaître) 
                avec des numéros chauds (qui suivent une tendance positive).
              </p>
              
              <button
                onClick={generateSimpleGrid}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
              >
                🎲 Générer ma grille optimisée
              </button>
            </div>

            {generatedGrid && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8">
                <h4 className="text-xl font-semibold text-blue-800 mb-6 text-center">
                  🎯 Votre grille optimisée
                </h4>
                
                <div className="max-w-md mx-auto">
                  <div className="mb-6">
                    <h5 className="text-lg font-semibold text-blue-800 mb-3">Numéros</h5>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {generatedGrid.numbers.map((num, index) => (
                        <div
                          key={index}
                          className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-lg font-semibold text-blue-800 mb-3">Étoiles</h5>
                    <div className="flex gap-3 justify-center">
                      {generatedGrid.stars.map((star, index) => (
                        <div
                          key={index}
                          className="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg"
                        >
                          {star}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-blue-700">
                    💡 Cette grille combine des numéros en retard et des numéros chauds 
                    pour maximiser vos chances de gains secondaires.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-yellow-800 mb-3">⚠️ Important à savoir</h4>
              <ul className="text-yellow-700 text-sm space-y-2">
                <li>• L'Euromillions reste un jeu de hasard</li>
                <li>• Aucune garantie de gain n'est possible</li>
                <li>• Ces analyses sont basées sur l'historique des tirages</li>
                <li>• Jouez de manière responsable</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplifiedEuromillionsDashboard; 