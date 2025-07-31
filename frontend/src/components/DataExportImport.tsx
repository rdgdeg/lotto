import React, { useState } from 'react';
import { exportLocalData, importLocalData } from '../utils/exportLocalData';

const DataExportImport: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const result = await exportLocalData();
      setMessage(result);
    } catch (error) {
      setMessage(`Erreur lors de l'export : ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage('');
    
    try {
      const result = await importLocalData(file);
      setMessage(result);
      // Rafraîchir la page pour voir les nouvelles données
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      setMessage(`Erreur lors de l'import : ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">📁 Export/Import des Données</h3>
      
      <div className="space-y-4">
        {/* Export */}
        <div className="border p-4 rounded-lg">
          <h4 className="font-medium mb-2">📤 Exporter les données</h4>
          <p className="text-sm text-gray-600 mb-3">
            Téléchargez toutes vos données locales au format JSON
          </p>
          <button
            onClick={handleExport}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? '⏳ Export en cours...' : '📥 Télécharger les données'}
          </button>
        </div>

        {/* Import */}
        <div className="border p-4 rounded-lg">
          <h4 className="font-medium mb-2">📥 Importer des données</h4>
          <p className="text-sm text-gray-600 mb-3">
            Importez des données depuis un fichier JSON (remplacera les données existantes)
          </p>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={loading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-lg ${
            message.includes('Erreur') 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataExportImport; 