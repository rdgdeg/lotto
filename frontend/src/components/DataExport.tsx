import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface DataExportProps {
  gameType: 'euromillions' | 'loto';
  onClose: () => void;
  isOpen: boolean;
}

interface YearOption {
  year: number;
  count: number;
}

const DataExport: React.FC<DataExportProps> = ({
  gameType,
  onClose,
  isOpen
}) => {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'excel'>('csv');
  const [availableYears, setAvailableYears] = useState<YearOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableYears();
    }
  }, [isOpen, gameType]);

  const fetchAvailableYears = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/${gameType}/stats`);
      if (response.data && response.data.date_range) {
        // Extraire les années des données existantes
        const years = new Set<number>();
        // Pour l'instant, on va utiliser une approche simple
        // En réalité, il faudrait un endpoint spécifique pour les années
        setAvailableYears([
          { year: 2024, count: 0 },
          { year: 2023, count: 0 },
          { year: 2022, count: 0 }
        ]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des années:', error);
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        format: selectedFormat
      });

      if (selectedYear !== 'all') {
        params.append('year', selectedYear);
      }

      const response = await axios.get(
        `http://localhost:8000/api/${gameType}/export?${params}`,
        {
          responseType: 'blob'
        }
      );

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extraire le nom du fichier depuis les headers
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${gameType}_export.${selectedFormat}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (error: any) {
      console.error('Erreur lors de l\'export:', error);
      setError(error.response?.data?.detail || 'Erreur lors de l\'export des données');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            📁 Exporter les données {gameType === 'loto' ? 'Loto' : 'Euromillions'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Sélection de l'année */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 Période
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes les années</option>
              {availableYears.map((yearOption) => (
                <option key={yearOption.year} value={yearOption.year.toString()}>
                  {yearOption.year} ({yearOption.count} tirages)
                </option>
              ))}
            </select>
          </div>

          {/* Sélection du format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📄 Format d'export
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="csv"
                  checked={selectedFormat === 'csv'}
                  onChange={(e) => setSelectedFormat(e.target.value as 'csv')}
                  className="mr-2"
                />
                <span className="text-sm">CSV</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="excel"
                  checked={selectedFormat === 'excel'}
                  onChange={(e) => setSelectedFormat(e.target.value as 'excel')}
                  className="mr-2"
                />
                <span className="text-sm">Excel</span>
              </label>
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleExport}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '⏳ Export en cours...' : '📥 Exporter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExport; 