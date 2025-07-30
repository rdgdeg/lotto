import React, { useState, useEffect } from 'react';
import { fetchQuickStats, fetchYears, checkApiHealth, forceRefresh } from '../utils/apiHelpers';

interface DataDiagnosticProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DiagnosticResult {
  gameType: 'euromillions' | 'lotto';
  apiHealth: boolean;
  totalDraws: number;
  years: number[];
  lastUpdate: string;
  error?: string;
}

const DataDiagnostic: React.FC<DataDiagnosticProps> = ({ isOpen, onClose }) => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  const runDiagnostics = async () => {
    setLoading(true);
    const results: DiagnosticResult[] = [];

    // Vérifier la santé de l'API
    const apiHealth = await checkApiHealth();

    // Diagnostiquer Euromillions
    try {
      const euromillionsStats = await fetchQuickStats('euromillions');
      const euromillionsYears = await fetchYears('euromillions');
      
      results.push({
        gameType: 'euromillions',
        apiHealth,
        totalDraws: euromillionsStats.total_draws || 0,
        years: euromillionsYears.years || [],
        lastUpdate: new Date().toLocaleString('fr-FR'),
      });
    } catch (error: any) {
      results.push({
        gameType: 'euromillions',
        apiHealth,
        totalDraws: 0,
        years: [],
        lastUpdate: new Date().toLocaleString('fr-FR'),
        error: error.message,
      });
    }

    // Diagnostiquer Loto
    try {
      const lottoStats = await fetchQuickStats('lotto');
      const lottoYears = await fetchYears('lotto');
      
      results.push({
        gameType: 'lotto',
        apiHealth,
        totalDraws: lottoStats.total_draws || 0,
        years: lottoYears.years || [],
        lastUpdate: new Date().toLocaleString('fr-FR'),
      });
    } catch (error: any) {
      results.push({
        gameType: 'lotto',
        apiHealth,
        totalDraws: 0,
        years: [],
        lastUpdate: new Date().toLocaleString('fr-FR'),
        error: error.message,
      });
    }

    setDiagnostics(results);
    setLoading(false);
  };

  const handleForceRefresh = async () => {
    setRefreshing(true);
    try {
      await runDiagnostics();
      // Forcer le rafraîchissement de la page après 2 secondes
      setTimeout(() => {
        forceRefresh();
      }, 2000);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      setRefreshing(false);
    }
  };

  const getStatusColor = (result: DiagnosticResult) => {
    if (result.error) return 'text-red-600';
    if (result.totalDraws > 0) return 'text-green-600';
    return 'text-yellow-600';
  };

  const getStatusIcon = (result: DiagnosticResult) => {
    if (result.error) return '❌';
    if (result.totalDraws > 0) return '✅';
    return '⚠️';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🔍 Diagnostic des Données</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Résumé global */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">📊 Résumé Global</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {diagnostics.reduce((sum, d) => sum + d.totalDraws, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Tirages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {diagnostics.filter(d => !d.error).length}
                  </div>
                  <div className="text-sm text-gray-600">Jeux Fonctionnels</div>
                </div>
              </div>
            </div>

            {/* Détails par jeu */}
            <div className="space-y-4">
              {diagnostics.map((result, index) => (
                <div
                  key={result.gameType}
                  className={`p-4 border rounded-lg ${
                    result.error ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold capitalize">
                      {getStatusIcon(result)} {result.gameType}
                    </h4>
                    <span className={`font-medium ${getStatusColor(result)}`}>
                      {result.error ? 'Erreur' : `${result.totalDraws} tirages`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">API Health:</span>
                      <span className={`ml-2 ${result.apiHealth ? 'text-green-600' : 'text-red-600'}`}>
                        {result.apiHealth ? '✅ Connecté' : '❌ Déconnecté'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Années:</span>
                      <span className="ml-2">
                        {result.years.length > 0 ? result.years.join(', ') : 'Aucune'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Dernière mise à jour:</span>
                      <span className="ml-2">{result.lastUpdate}</span>
                    </div>
                    <div>
                      <span className="font-medium">Statut:</span>
                      <span className={`ml-2 ${getStatusColor(result)}`}>
                        {result.error ? 'Erreur' : 'OK'}
                      </span>
                    </div>
                  </div>

                  {result.error && (
                    <div className="mt-3 p-3 bg-red-100 rounded text-red-800 text-sm">
                      <strong>Erreur:</strong> {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={runDiagnostics}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Diagnostic...' : '🔄 Relancer Diagnostic'}
              </button>
              <button
                onClick={handleForceRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {refreshing ? 'Rafraîchissement...' : '🔄 Forcer Rafraîchissement'}
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">💡 Instructions</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Si les données ne s'affichent pas, cliquez sur "Forcer Rafraîchissement"</li>
                <li>• Vérifiez que l'API backend fonctionne sur http://localhost:8000</li>
                <li>• Videz le cache du navigateur si nécessaire (Ctrl+F5)</li>
                <li>• Vérifiez la console du navigateur pour les erreurs</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DataDiagnostic; 