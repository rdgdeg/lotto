import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface GapData {
  gaps: number[];
  average_gap: number;
  min_gap: number;
  max_gap: number;
  current_gap: number;
}

interface PositionItem {
  numero: number;
  count: number;
  percentage: number;
  position: number;
}

interface PositionData {
  [key: string]: PositionItem[];
}

interface CorrelationData {
  strongest_correlations: Array<{
    num1: number;
    num2: number;
    cooccurrence: number;
  }>;
}

interface DetailedAnalyticsData {
  gap_statistics: {
    number_gaps: Record<number, GapData>;
    star_gaps: Record<number, GapData>;
    overdue_numbers: Array<[number, number]>;
    overdue_stars: Array<[number, number]>;
  };
  position_statistics: {
    number_positions: PositionData;
    star_positions: Record<string, any[]>;
  };
  correlation_statistics: CorrelationData;
  temporal_statistics: {
    monthly_stats: Record<number, Record<number, number>>;
    yearly_stats: Record<number, Record<number, number>>;
    day_of_week_stats: Record<number, Record<number, number>>;
  };
}

interface DetailedAnalyticsViewProps {
  onClose: () => void;
  isOpen: boolean;
}

const DetailedAnalyticsView: React.FC<DetailedAnalyticsViewProps> = ({ onClose, isOpen }) => {
  const [data, setData] = useState<DetailedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('gaps');

  const fetchAvailableYears = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/euromillions/years');
      setAvailableYears(response.data.years || []);
    } catch (err) {
      console.error('Erreur lors de la récupération des années:', err);
    }
  }, []);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      const url = selectedYear 
        ? `http://localhost:8000/api/advanced-stats/comprehensive-analysis?year=${selectedYear}`
        : 'http://localhost:8000/api/advanced-stats/comprehensive-analysis';
      
      const response = await axios.get(url);
      setData(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des analyses détaillées');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableYears();
      fetchAnalyticsData();
    }
  }, [isOpen, fetchAvailableYears, fetchAnalyticsData]);

  const getGapStatus = (currentGap: number, averageGap: number) => {
    if (currentGap > averageGap * 2) return 'très en retard';
    if (currentGap > averageGap * 1.5) return 'en retard';
    if (currentGap < averageGap * 0.5) return 'récent';
    return 'normal';
  };

  const getGapStatusColor = (status: string) => {
    switch (status) {
      case 'très en retard': return 'text-red-600 bg-red-100';
      case 'en retard': return 'text-orange-600 bg-orange-100';
      case 'récent': return 'text-green-600 bg-green-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
        <div className="bg-white rounded-lg p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="text-center text-red-600 p-8">
            <h2 className="text-xl font-bold mb-4">Erreur</h2>
            <p>{error}</p>
            <button 
              onClick={fetchAnalyticsData}
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
        <div className="bg-white rounded-lg p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="text-center text-gray-600 p-8">
            <h2 className="text-xl font-bold mb-4">Aucune donnée disponible</h2>
            <p>Importez des données Euromillions pour voir les analyses détaillées.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🔍 Analyses Détaillées</h2>
            <p className="text-gray-600">
              {selectedYear ? `Année ${selectedYear}` : 'Toutes les années'} • 
              Analyses approfondies des patterns et tendances
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

        {/* Navigation des onglets */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('gaps')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'gaps' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ⏰ Intervalles
          </button>
          <button
            onClick={() => setActiveTab('positions')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'positions' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📍 Positions
          </button>
          <button
            onClick={() => setActiveTab('correlations')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'correlations' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🔗 Corrélations
          </button>
          <button
            onClick={() => setActiveTab('temporal')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'temporal' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📅 Temporel
          </button>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'gaps' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Analyse des Intervalles</h3>
            
            {/* Numéros en retard */}
            <div className="bg-red-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-red-800 mb-4">🚨 Numéros très en retard</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.gap_statistics.overdue_numbers.slice(0, 12).map(([num, gap]) => {
                  const gapData = data.gap_statistics.number_gaps[num];
                  const status = gapData ? getGapStatus(gapData.current_gap, gapData.average_gap) : 'inconnu';
                  const statusColor = getGapStatusColor(status);
                  
                  return (
                    <div key={num} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {num}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                          {status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>Gap actuel: <span className="font-semibold">{gap} tirages</span></div>
                        {gapData && (
                          <>
                            <div>Gap moyen: <span className="font-semibold">{gapData.average_gap}</span></div>
                            <div>Min/Max: <span className="font-semibold">{gapData.min_gap}/{gapData.max_gap}</span></div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Statistiques des gaps */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-blue-800 mb-4">📊 Distribution des gaps</h4>
                <div className="space-y-2">
                  {Object.entries(data.gap_statistics.number_gaps)
                    .slice(0, 10)
                    .map(([num, gapData]) => (
                      <div key={num} className="flex items-center justify-between bg-white rounded p-3">
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {num}
                          </span>
                          <span className="text-sm">Numéro {num}</span>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-semibold">{gapData.average_gap.toFixed(1)}</div>
                          <div className="text-gray-500">moyenne</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-green-800 mb-4">⭐ Gaps des étoiles</h4>
                <div className="space-y-2">
                  {Object.entries(data.gap_statistics.star_gaps)
                    .slice(0, 10)
                    .map(([star, gapData]) => (
                      <div key={star} className="flex items-center justify-between bg-white rounded p-3">
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {star}
                          </span>
                          <span className="text-sm">Étoile {star}</span>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-semibold">{gapData.average_gap.toFixed(1)}</div>
                          <div className="text-gray-500">moyenne</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'positions' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Analyse des Positions</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5].map(position => (
                <div key={position} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-purple-800 mb-4">
                    📍 Position {position}
                  </h4>
                  <div className="space-y-2">
                    {(data.position_statistics.number_positions[`position_${position}`] || [])
                      .slice(0, 8)
                      .map((item: PositionItem, index: number) => (
                        <div key={item.numero} className="flex items-center justify-between bg-white rounded p-2">
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {item.numero}
                            </span>
                            <span className="text-sm">#{item.numero}</span>
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-semibold">{item.count}</div>
                            <div className="text-gray-500">{item.percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'correlations' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Analyse des Corrélations</h3>
            
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-indigo-800 mb-4">🔗 Paires les plus corrélées</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.correlation_statistics.strongest_correlations.slice(0, 15).map((correlation, index) => (
                  <div key={`${correlation.num1}-${correlation.num2}`} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {correlation.num1}
                        </span>
                        <span className="text-gray-500">+</span>
                        <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {correlation.num2}
                        </span>
                      </div>
                      <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="font-semibold">{correlation.cooccurrence} co-occurrences</div>
                      <div className="text-gray-500">Apparitions communes</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'temporal' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Analyse Temporelle</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Statistiques mensuelles */}
              <div className="bg-orange-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-orange-800 mb-4">📅 Tendances mensuelles</h4>
                <div className="space-y-2">
                  {Object.entries(data.temporal_statistics.monthly_stats)
                    .slice(0, 6)
                    .map(([month, numbers]) => {
                      const monthNames = [
                        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
                      ];
                      const topNumber = Object.entries(numbers)
                        .sort(([,a], [,b]) => b - a)[0];
                      
                      return (
                        <div key={month} className="flex items-center justify-between bg-white rounded p-3">
                          <span className="text-sm font-medium">{monthNames[parseInt(month) - 1]}</span>
                          <div className="text-right text-sm">
                            <div className="font-semibold">#{topNumber?.[0]}</div>
                            <div className="text-gray-500">{topNumber?.[1]} fois</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Statistiques par jour de la semaine */}
              <div className="bg-teal-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-teal-800 mb-4">📅 Tendances par jour</h4>
                <div className="space-y-2">
                  {Object.entries(data.temporal_statistics.day_of_week_stats)
                    .map(([day, numbers]) => {
                      const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
                      const topNumber = Object.entries(numbers)
                        .sort(([,a], [,b]) => b - a)[0];
                      
                      return (
                        <div key={day} className="flex items-center justify-between bg-white rounded p-3">
                          <span className="text-sm font-medium">{dayNames[parseInt(day)]}</span>
                          <div className="text-right text-sm">
                            <div className="font-semibold">#{topNumber?.[0]}</div>
                            <div className="text-gray-500">{topNumber?.[1]} fois</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailedAnalyticsView; 