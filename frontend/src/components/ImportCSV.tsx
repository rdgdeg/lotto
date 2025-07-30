import React, { useState } from 'react';

interface ImportCSVProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: 'euromillions' | 'lotto';
  onImportSuccess?: (message: string) => void;
}

const ImportCSV: React.FC<ImportCSVProps> = ({ isOpen, onClose, gameType, onImportSuccess }) => {
  // const [file, setFile] = useState<File | null>(null); // Supprimé car remplacé par files[]
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<{name: string, status: 'pending'|'success'|'error', message?: string}[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const validFiles = selectedFiles.filter(f => f.type === 'text/csv' || f.name.endsWith('.csv'));
    setFiles(validFiles);
    setUploadStatus(validFiles.map(f => ({name: f.name, status: 'pending'})));
    setError(null);
    setSuccess(null);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Veuillez sélectionner au moins un fichier');
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);
    let completed = 0;
    const newStatus = [...uploadStatus];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', gameType);
        const response = await fetch('http://localhost:8000/api/import/', {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          const result = await response.json();
          newStatus[i] = {name: file.name, status: 'success', message: result.message};
          if (onImportSuccess) onImportSuccess(result.message);
        } else {
          const errorData = await response.json();
          newStatus[i] = {name: file.name, status: 'error', message: errorData.detail || 'Erreur lors de l\'import'};
        }
      } catch (err) {
        newStatus[i] = {name: file.name, status: 'error', message: 'Erreur de connexion au serveur'};
      }
      completed++;
      setUploadProgress(Math.round((completed / files.length) * 100));
      setUploadStatus([...newStatus]);
    }
    setIsUploading(false);
    setTimeout(() => {
      onClose();
      setFiles([]);
      setUploadStatus([]);
      setUploadProgress(0);
    }, 2000);
  };

  const getCSVTemplate = () => {
    if (gameType === 'euromillions') {
      return `Date,Numéro 1,Numéro 2,Numéro 3,Numéro 4,Numéro 5,Etoile 1,Etoile 2
2024-01-01,1,15,23,34,45,3,8
2024-01-04,7,12,19,28,39,2,11`;
    } else {
      return `date,n1,n2,n3,n4,n5,n6,complementaire
2024-01-01,1,15,23,34,45,49,10
2024-01-04,7,12,19,28,39,42,5`;
    }
  };

  const downloadTemplate = () => {
    const template = getCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${gameType}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📁 Import CSV - {gameType === 'euromillions' ? 'Euromillions' : 'Lotto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Instructions :</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Sélectionnez un fichier CSV avec les données historiques</li>
            <li>• Le fichier doit contenir les colonnes appropriées</li>
            <li>• Les dates doivent être au format YYYY-MM-DD</li>
            <li>• Les numéros doivent être des entiers valides</li>
          </ul>
        </div>

        {/* Template */}
        <div className="mb-6">
          <button
            onClick={downloadTemplate}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            📥 Télécharger le template
          </button>
        </div>

        {/* Sélection de fichier */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner le fichier CSV
          </label>
          <input
            type="file"
            accept=".csv"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={isUploading}
          />
          {files.length > 0 && (
            <ul className="mt-2 text-sm">
              {files.map((f, i) => (
                <li key={f.name} className={uploadStatus[i]?.status === 'error' ? 'text-red-600' : uploadStatus[i]?.status === 'success' ? 'text-green-600' : ''}>
                  {uploadStatus[i]?.status === 'success' ? '✅' : uploadStatus[i]?.status === 'error' ? '❌' : '⏳'} {f.name} {uploadStatus[i]?.message ? `: ${uploadStatus[i].message}` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Barre de progression */}
        {isUploading && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Import en cours... {uploadProgress}%
            </p>
          </div>
        )}

        {/* Messages d'erreur et de succès */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            ✅ {success}
          </div>
        )}

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            {isUploading ? '⏳ Import en cours...' : '🚀 Importer'}
          </button>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportCSV; 