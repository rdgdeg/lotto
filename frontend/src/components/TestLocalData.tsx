import React, { useState, useEffect } from 'react';
import { localDataManager } from '../utils/localDataManager';
import { migrateFromBackend, manualMigration } from '../utils/manualMigration';

const TestLocalData: React.FC = () => {
  const [lotoStats, setLotoStats] = useState<any>(null);
  const [euromillionsStats, setEuromillionsStats] = useState<any>(null);
  const [lotoYears, setLotoYears] = useState<any>(null);
  const [euromillionsYears, setEuromillionsYears] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string>('');

  const testLocalData = async () => {
    setLoading(true);
    try {
      console.log('🧪 Test des données locales...');
      
      const loto = await localDataManager.getLotoStats();
      const euromillions = await localDataManager.getEuromillionsStats();
      const lotoY = await localDataManager.getLotoYears();
      const euromillionsY = await localDataManager.getEuromillionsYears();
      
      setLotoStats(loto);
      setEuromillionsStats(euromillions);
      setLotoYears(lotoY);
      setEuromillionsYears(euromillionsY);
      
      console.log('✅ Test terminé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du test:', error);
    } finally {
      setLoading(false);
    }
  };

  const runMigration = async () => {
    setLoading(true);
    setMigrationStatus('Migration depuis le backend...');
    try {
      const success = await migrateFromBackend();
      if (success) {
        setMigrationStatus('Migration réussie !');
        await testLocalData(); // Re-tester après migration
      } else {
        setMigrationStatus('Échec de la migration');
      }
    } catch (error) {
      setMigrationStatus(`Erreur: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const runManualMigration = async () => {
    setLoading(true);
    setMigrationStatus('Migration manuelle avec données de test...');
    try {
      const success = await manualMigration();
      if (success) {
        setMigrationStatus('Migration manuelle réussie !');
        await testLocalData(); // Re-tester après migration
      } else {
        setMigrationStatus('Échec de la migration manuelle');
      }
    } catch (error) {
      setMigrationStatus(`Erreur: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testLocalData();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">🧪 Test des Données Locales</h2>
      
      <div className="mb-6">
        <button
          onClick={runMigration}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 mr-4"
        >
          🔄 Migrer depuis le Backend
        </button>
        <button
          onClick={testLocalData}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 mr-4"
        >
          🧪 Tester les Données
        </button>
        <button
          onClick={runManualMigration}
          disabled={loading}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        >
          📊 Données de Test
        </button>
      </div>

      {migrationStatus && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <strong>Migration:</strong> {migrationStatus}
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p>Chargement...</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Loto */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">🎰 Loto</h3>
          {lotoStats ? (
            <div className="space-y-2">
              <p><strong>Total tirages:</strong> {lotoStats.total_draws}</p>
              <p><strong>Top numéros:</strong> {lotoStats.top_numeros?.length || 0}</p>
              <p><strong>Top complémentaires:</strong> {lotoStats.top_complementaires?.length || 0}</p>
              <p><strong>Somme moyenne:</strong> {lotoStats.average_sum?.toFixed(1) || 'N/A'}</p>
              {lotoStats.error && <p className="text-red-600">❌ {lotoStats.error}</p>}
            </div>
          ) : (
            <p className="text-gray-500">Aucune donnée</p>
          )}
          
          {lotoYears && (
            <div className="mt-4">
              <p><strong>Années:</strong> {lotoYears.years?.length || 0}</p>
              {lotoYears.years?.length > 0 && (
                <p><strong>Période:</strong> {Math.min(...lotoYears.years)} - {Math.max(...lotoYears.years)}</p>
              )}
            </div>
          )}
        </div>

        {/* Euromillions */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">⭐ Euromillions</h3>
          {euromillionsStats ? (
            <div className="space-y-2">
              <p><strong>Total tirages:</strong> {euromillionsStats.total_draws}</p>
              <p><strong>Numéros:</strong> {Object.keys(euromillionsStats.numeros || {}).length}</p>
              <p><strong>Étoiles:</strong> {Object.keys(euromillionsStats.etoiles || {}).length}</p>
              {euromillionsStats.date_range && (
                <p><strong>Période:</strong> {euromillionsStats.date_range.start} - {euromillionsStats.date_range.end}</p>
              )}
              {euromillionsStats.error && <p className="text-red-600">❌ {euromillionsStats.error}</p>}
            </div>
          ) : (
            <p className="text-gray-500">Aucune donnée</p>
          )}
          
          {euromillionsYears && (
            <div className="mt-4">
              <p><strong>Années:</strong> {euromillionsYears.years?.length || 0}</p>
              {euromillionsYears.years?.length > 0 && (
                <p><strong>Période:</strong> {Math.min(...euromillionsYears.years)} - {Math.max(...euromillionsYears.years)}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">📊 Résumé</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Loto:</strong> {lotoStats?.total_draws || 0} tirages</p>
            <p><strong>Euromillions:</strong> {euromillionsStats?.total_draws || 0} tirages</p>
          </div>
          <div>
            <p><strong>Total:</strong> {(lotoStats?.total_draws || 0) + (euromillionsStats?.total_draws || 0)} tirages</p>
            <p><strong>Status:</strong> {loading ? 'Chargement...' : 'Prêt'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestLocalData; 