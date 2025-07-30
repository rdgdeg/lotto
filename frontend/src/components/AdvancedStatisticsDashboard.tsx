import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface SummaryData {
  total_draws: number;
  date_range: {
    start: string;
    end: string;
  };
  top_numbers: Array<{
    numero: number;
    count: number;
    percentage: number;
    type: string;
  }>;
  bottom_numbers: Array<{
    numero: number;
    count: number;
    percentage: number;
    type: string;
  }>;
  top_stars: Array<{
    numero: number;
    count: number;
    percentage: number;
    type: string;
  }>;
  bottom_stars: Array<{
    numero: number;
    count: number;
    percentage: number;
    type: string;
  }>;
}

interface PredictionData {
  overdue_numbers: Array<[number, number]>;
  overdue_stars: Array<[number, number]>;
  hot_numbers: Array<[number, number]>;
  cold_numbers: Array<[number, number]>;
}

interface PatternData {
  most_frequent_patterns: Array<[string, number]>;
  most_frequent_sequences: Array<[number, number]>;
}

interface DashboardData {
  summary: SummaryData;
  predictions: PredictionData;
  patterns: PatternData;
}

interface AdvancedStatisticsDashboardProps {
  onClose: () => void;
  isOpen: boolean;
}

const AdvancedStatisticsDashboard: React.FC<AdvancedStatisticsDashboardProps> = ({ onClose, isOpen }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const fetchAvailableYears = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/euromillions/years');
      setAvailableYears(response.data.years || []);
    } catch (err) {
      console.error('Erreur lors de la récupération des années:', err);
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const url = selectedYear 
        ? `http://localhost:8000/api/advanced-stats/summary-dashboard?year=${selectedYear}`
        : 'http://localhost:8000/api/advanced-stats/summary-dashboard';
      
      const response = await axios.get(url);
      setData(response.data);
    } catch (err) {
      setError('Erreur lors du chargement du tableau de bord');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableYears();
      fetchDashboardData();
    }
  }, [isOpen, fetchAvailableYears, fetchDashboardData]);

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
              onClick={fetchDashboardData}
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
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="text-center text-gray-600 p-8">
            <h2 className="text-xl font-bold mb-4">Aucune donnée disponible</h2>
            <p>Importez des données Euromillions pour voir le tableau de bord avancé.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📊 Tableau de Bord Avancé</h2>
            <p className="text-gray-600">
              {selectedYear ? `Année ${selectedYear}` : 'Toutes les années'} • 
              {data.summary.total_draws} tirages analysés
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

        {/* Statistiques de base */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Numbers */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">🔥 Numéros les plus fréquents</h3>
            <div className="space-y-2">
              {data.summary.top_numbers.map((num, index) => (
                <div key={num.numero} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {num.numero}
                    </span>
                    <span className="text-sm text-gray-700">
                      {index + 1}. Numéro {num.numero}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-800">{num.count} fois</div>
                    <div className="text-xs text-green-600">{num.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Numbers */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4">❄️ Numéros les moins fréquents</h3>
            <div className="space-y-2">
              {data.summary.bottom_numbers.map((num, index) => (
                <div key={num.numero} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {num.numero}
                    </span>
                    <span className="text-sm text-gray-700">
                      {index + 1}. Numéro {num.numero}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-red-800">{num.count} fois</div>
                    <div className="text-xs text-red-600">{num.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prédictions et Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Numéros en retard */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">⏰ Numéros en retard</h3>
            <div className="space-y-2">
              {data.predictions.overdue_numbers.map(([num, gap], index) => (
                <div key={num} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {num}
                    </span>
                    <span className="text-sm text-gray-700">
                      {index + 1}. Numéro {num}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-yellow-800">{gap} tirages</div>
                    <div className="text-xs text-yellow-600">sans apparition</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Numéros chauds */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-800 mb-4">🔥 Numéros chauds (50 derniers tirages)</h3>
            <div className="space-y-2">
              {data.predictions.hot_numbers.map(([num, count], index) => (
                <div key={num} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {num}
                    </span>
                    <span className="text-sm text-gray-700">
                      {index + 1}. Numéro {num}
                    </span>
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

        {/* Patterns et séquences */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Patterns fréquents */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">🎯 Patterns les plus fréquents</h3>
            <div className="space-y-2">
              {data.patterns.most_frequent_patterns.map(([pattern, count], index) => (
                <div key={pattern} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700">
                      {pattern} (Haut/Bas)
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-purple-800">{count} fois</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Séquences consécutives */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-indigo-800 mb-4">🔗 Séquences consécutives</h3>
            <div className="space-y-2">
              {data.patterns.most_frequent_sequences.map(([length, count], index) => (
                <div key={length} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700">
                      {length} numéros consécutifs
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-indigo-800">{count} fois</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Informations générales */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Informations générales</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.summary.total_draws}</div>
              <div className="text-sm text-gray-600">Total des tirages</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800">
                {new Date(data.summary.date_range.start).getFullYear()}
              </div>
              <div className="text-sm text-gray-600">Début des données</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800">
                {new Date(data.summary.date_range.end).getFullYear()}
              </div>
              <div className="text-sm text-gray-600">Fin des données</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedStatisticsDashboard; 