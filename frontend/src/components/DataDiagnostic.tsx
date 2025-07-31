import React, { useState, useEffect } from 'react';
import { fetchStats, fetchYears, checkApiHealth, forceRefresh, clearCacheAndReload } from '../utils/apiHelpers';

interface DiagnosticData {
  apiHealth: boolean;
  lottoStats: any;
  euromillionsStats: any;
  lottoYears: number[];
  euromillionsYears: number[];
  errors: string[];
}

interface DataDiagnosticProps {
  isOpen: boolean;
  onClose: () => void;
}

const DataDiagnostic: React.FC<DataDiagnosticProps> = ({ isOpen, onClose }) => {
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData>({
    apiHealth: false,
    lottoStats: null,
    euromillionsStats: null,
    lottoYears: [],
    euromillionsYears: [],
    errors: []
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const errors: string[] = [];
    let apiHealth = false;
    let lottoStats = null;
    let euromillionsStats = null;
    let lottoYears: number[] = [];
    let euromillionsYears: number[] = [];

    try {
      // Test de santé de l'API
      apiHealth = await checkApiHealth();
      if (!apiHealth) {
        errors.push("❌ L'API backend n'est pas accessible");
      } else {
        console.log("✅ API backend accessible");
      }

      // Test des statistiques Loto
      try {
        lottoStats = await fetchStats('lotto');
        console.log("📊 Statistiques Loto:", lottoStats);
      } catch (error) {
        errors.push("❌ Erreur lors de la récupération des stats Loto");
        console.error("Erreur stats Loto:", error);
      }

      // Test des statistiques Euromillions
      try {
        euromillionsStats = await fetchStats('euromillions');
        console.log("📊 Statistiques Euromillions:", euromillionsStats);
      } catch (error) {
        errors.push("❌ Erreur lors de la récupération des stats Euromillions");
        console.error("Erreur stats Euromillions:", error);
      }

      // Test des années disponibles
      try {
        lottoYears = await fetchYears('lotto');
        console.log("📅 Années Loto:", lottoYears);
      } catch (error) {
        errors.push("❌ Erreur lors de la récupération des années Loto");
        console.error("Erreur années Loto:", error);
      }

      try {
        euromillionsYears = await fetchYears('euromillions');
        console.log("📅 Années Euromillions:", euromillionsYears);
      } catch (error) {
        errors.push("❌ Erreur lors de la récupération des années Euromillions");
        console.error("Erreur années Euromillions:", error);
      }

    } catch (error) {
      errors.push("❌ Erreur générale lors du diagnostic");
      console.error("Erreur générale:", error);
    }

    setDiagnosticData({
      apiHealth,
      lottoStats,
      euromillionsStats,
      lottoYears,
      euromillionsYears,
      errors
    });
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

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

  const getStatusIcon = (condition: boolean) => condition ? "✅" : "❌";
  const getStatusColor = (condition: boolean) => condition ? "text-green-600" : "text-red-600";

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🔍 Diagnostic des Données</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Exécution du diagnostic...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Résumé général */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">📋 Résumé Général</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`flex items-center gap-2 ${getStatusColor(diagnosticData.apiHealth)}`}>
                  <span className="text-xl">{getStatusIcon(diagnosticData.apiHealth)}</span>
                  <span>API Backend</span>
                </div>
                <div className={`flex items-center gap-2 ${getStatusColor(diagnosticData.lottoStats !== null)}`}>
                  <span className="text-xl">{getStatusIcon(diagnosticData.lottoStats !== null)}</span>
                  <span>Stats Loto</span>
                </div>
                <div className={`flex items-center gap-2 ${getStatusColor(diagnosticData.euromillionsStats !== null)}`}>
                  <span className="text-xl">{getStatusIcon(diagnosticData.euromillionsStats !== null)}</span>
                  <span>Stats Euromillions</span>
                </div>
                <div className={`flex items-center gap-2 ${getStatusColor(diagnosticData.lottoYears.length > 0 || diagnosticData.euromillionsYears.length > 0)}`}>
                  <span className="text-xl">{getStatusIcon(diagnosticData.lottoYears.length > 0 || diagnosticData.euromillionsYears.length > 0)}</span>
                  <span>Années disponibles</span>
                </div>
              </div>
            </div>

            {/* Détails Loto */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">🎰 Loto</h3>
              {diagnosticData.lottoStats ? (
                <div className="space-y-2">
                  <p><strong>Total tirages:</strong> {diagnosticData.lottoStats.total_draws || 0}</p>
                  <p><strong>Numéros avec données:</strong> {diagnosticData.lottoStats.top_numeros?.length || 0}</p>
                  <p><strong>Complémentaires avec données:</strong> {diagnosticData.lottoStats.top_complementaires?.length || 0}</p>
                  <p><strong>Années disponibles:</strong> {diagnosticData.lottoYears.length}</p>
                  {diagnosticData.lottoYears.length > 0 && (
                    <p><strong>Période:</strong> {Math.min(...diagnosticData.lottoYears)} - {Math.max(...diagnosticData.lottoYears)}</p>
                  )}
                </div>
              ) : (
                <p className="text-red-600">❌ Aucune donnée disponible</p>
              )}
            </div>

            {/* Détails Euromillions */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">⭐ Euromillions</h3>
              {diagnosticData.euromillionsStats ? (
                <div className="space-y-2">
                  <p><strong>Total tirages:</strong> {diagnosticData.euromillionsStats.total_draws || 0}</p>
                  <p><strong>Numéros avec données:</strong> {Object.keys(diagnosticData.euromillionsStats.numeros || {}).length}</p>
                  <p><strong>Étoiles avec données:</strong> {Object.keys(diagnosticData.euromillionsStats.etoiles || {}).length}</p>
                  <p><strong>Années disponibles:</strong> {diagnosticData.euromillionsYears.length}</p>
                  {diagnosticData.euromillionsYears.length > 0 && (
                    <p><strong>Période:</strong> {Math.min(...diagnosticData.euromillionsYears)} - {Math.max(...diagnosticData.euromillionsYears)}</p>
                  )}
                </div>
              ) : (
                <p className="text-red-600">❌ Aucune donnée disponible</p>
              )}
            </div>

            {/* Erreurs */}
            {diagnosticData.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-3">⚠️ Erreurs détectées</h3>
                <ul className="space-y-1">
                  {diagnosticData.errors.map((error, index) => (
                    <li key={index} className="text-red-700">{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={runDiagnostics}
                disabled={loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                🔄 Relancer le diagnostic
              </button>
              <button
                onClick={handleForceRefresh}
                disabled={refreshing}
                className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                {refreshing ? '🔄 Rafraîchissement...' : '🔄 Forcer Rafraîchissement'}
              </button>
              <button
                onClick={clearCacheAndReload}
                className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                🗑️ Vider Cache + Recharger
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Fermer
              </button>
            </div>

            {/* Conseils */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 Conseils</h3>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• Si l'API n'est pas accessible, vérifiez que le backend tourne sur le port 8000</li>
                <li>• Si aucune donnée n'est affichée, importez vos fichiers CSV</li>
                <li>• Utilisez "Forcer Rafraîchissement" si les données ne se mettent pas à jour</li>
                <li>• Vérifiez la console du navigateur pour plus de détails sur les erreurs</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataDiagnostic; 