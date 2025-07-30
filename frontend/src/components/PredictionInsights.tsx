import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface PredictionInsightsData {
  overdue_numbers: Array<[number, number]>;
  overdue_stars: Array<[number, number]>;
  hot_numbers: Array<[number, number]>;
  cold_numbers: Array<[number, number]>;
}

interface PredictionInsightsProps {
  onClose: () => void;
  isOpen: boolean;
}

const PredictionInsights: React.FC<PredictionInsightsProps> = ({ onClose, isOpen }) => {
  const [data, setData] = useState<PredictionInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [predictionStrategy, setPredictionStrategy] = useState('balanced');

  const fetchAvailableYears = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/euromillions/years');
      setAvailableYears(response.data.years || []);
    } catch (err) {
      console.error('Erreur lors de la récupération des années:', err);
    }
  }, []);

  const fetchPredictionData = useCallback(async () => {
    try {
      setLoading(true);
      const url = selectedYear 
        ? `http://localhost:8000/api/advanced-stats/prediction-insights?year=${selectedYear}`
        : 'http://localhost:8000/api/advanced-stats/prediction-insights';
      
      const response = await axios.get(url);
      setData(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des insights de prédiction');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableYears();
      fetchPredictionData();
    }
  }, [isOpen, fetchAvailableYears, fetchPredictionData]);

  const generatePredictionGrid = () => {
    if (!data) return null;

    const grid = {
      numbers: [] as number[],
      stars: [] as number[]
    };

    switch (predictionStrategy) {
      case 'overdue':
        // Stratégie basée sur les numéros en retard
        grid.numbers = data.overdue_numbers.slice(0, 5).map(([num]) => num);
        grid.stars = data.overdue_stars.slice(0, 2).map(([star]) => star);
        break;
      
      case 'hot':
        // Stratégie basée sur les numéros chauds
        grid.numbers = data.hot_numbers.slice(0, 5).map(([num]) => num);
        grid.stars = data.hot_numbers.slice(0, 2).map(([star]) => star);
        break;
      
      case 'cold':
        // Stratégie basée sur les numéros froids
        grid.numbers = data.cold_numbers.slice(0, 5).map(([num]) => num);
        grid.stars = data.cold_numbers.slice(0, 2).map(([star]) => star);
        break;
      
      case 'balanced':
      default:
        // Stratégie équilibrée
        const overdueNums = data.overdue_numbers.slice(0, 3).map(([num]) => num);
        const hotNums = data.hot_numbers.slice(0, 2).map(([num]) => num);
        grid.numbers = [...overdueNums, ...hotNums];
        
        const overdueStars = data.overdue_stars.slice(0, 1).map(([star]) => star);
        const hotStars = data.hot_numbers.slice(0, 1).map(([star]) => star);
        grid.stars = [...overdueStars, ...hotStars];
        break;
    }

    return grid;
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
        <div className="bg-white rounded-lg p-8 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="text-center text-red-600 p-8">
            <h2 className="text-xl font-bold mb-4">Erreur</h2>
            <p>{error}</p>
            <button 
              onClick={fetchPredictionData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="text-center text-gray-600 p-8">
            <h2 className="text-xl font-bold mb-4">Aucune donnée disponible</h2>
            <p>Importez des données Euromillions pour voir les insights de prédiction.</p>
          </div>
        </div>
      </div>
    );
  }

  const predictedGrid = generatePredictionGrid();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🔮 Insights de Prédiction</h2>
            <p className="text-gray-600">
              {selectedYear ? `Année ${selectedYear}` : 'Toutes les années'} • 
              Prédictions basées sur l'analyse des tendances
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedYear || ''}
              onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les années</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Sélecteur de stratégie */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stratégie de prédiction
          </label>
          <div className="flex space-x-2">
            {[
              { value: 'balanced', label: '⚖️ Équilibrée', desc: 'Mélange de numéros en retard et chauds' },
              { value: 'overdue', label: '⏰ En retard', desc: 'Numéros qui n\'ont pas été tirés depuis longtemps' },
              { value: 'hot', label: '🔥 Chauds', desc: 'Numéros fréquents récemment' },
              { value: 'cold', label: '❄️ Froids', desc: 'Numéros peu fréquents récemment' }
            ].map(strategy => (
              <button
                key={strategy.value}
                onClick={() => setPredictionStrategy(strategy.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  predictionStrategy === strategy.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={strategy.desc}
              >
                {strategy.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grille prédite */}
        {predictedGrid && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Grille Prédite</h3>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-blue-800">Numéros</h4>
                  <p className="text-sm text-blue-600">Stratégie: {predictionStrategy}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-600">Probabilité estimée</div>
                  <div className="text-lg font-bold text-blue-800">
                    {predictionStrategy === 'overdue' ? 'Élevée' : 
                     predictionStrategy === 'hot' ? 'Moyenne' : 
                     predictionStrategy === 'cold' ? 'Faible' : 'Modérée'}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {predictedGrid.numbers.map((num, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg"
                  >
                    {num}
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-blue-800 mb-2">Étoiles</h4>
                <div className="flex gap-2">
                  {predictedGrid.stars.map((star, index) => (
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
          </div>
        )}

        {/* Analyses détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Numéros en retard */}
          <div className="bg-red-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4">⏰ Numéros en retard</h3>
            <div className="space-y-2">
              {data.overdue_numbers.slice(0, 10).map(([num, gap], index) => (
                <div key={num} className="flex items-center justify-between bg-white rounded p-3">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {num}
                    </span>
                    <div>
                      <div className="text-sm font-medium">Numéro {num}</div>
                      <div className="text-xs text-gray-500">#{index + 1} en retard</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-red-800">{gap} tirages</div>
                    <div className="text-xs text-red-600">sans apparition</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Numéros chauds */}
          <div className="bg-orange-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-800 mb-4">🔥 Numéros chauds (50 derniers tirages)</h3>
            <div className="space-y-2">
              {data.hot_numbers.slice(0, 10).map(([num, count], index) => (
                <div key={num} className="flex items-center justify-between bg-white rounded p-3">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {num}
                    </span>
                    <div>
                      <div className="text-sm font-medium">Numéro {num}</div>
                      <div className="text-xs text-gray-500">#{index + 1} plus chaud</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-orange-800">{count} fois</div>
                    <div className="text-xs text-orange-600">récemment</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommandations */}
        <div className="mt-8 bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">💡 Recommandations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">🎯 Stratégie recommandée</h4>
              <p className="text-sm text-gray-700">
                {predictionStrategy === 'balanced' && 
                  "Utilisez un mélange équilibré de numéros en retard et de numéros chauds pour maximiser vos chances."}
                {predictionStrategy === 'overdue' && 
                  "Privilégiez les numéros qui n'ont pas été tirés depuis longtemps selon la théorie de l'équilibre."}
                {predictionStrategy === 'hot' && 
                  "Suivez la tendance des numéros qui apparaissent fréquemment récemment."}
                {predictionStrategy === 'cold' && 
                  "Jouez les numéros qui n'apparaissent pas souvent, en espérant un retour à la moyenne."}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">⚠️ Avertissement</h4>
              <p className="text-sm text-gray-700">
                Ces prédictions sont basées sur des analyses statistiques historiques. 
                L'Euromillions reste un jeu de hasard et aucune garantie de gain n'est possible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionInsights; 