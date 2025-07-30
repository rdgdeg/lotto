import React, { useState, useRef } from 'react';
import axios from 'axios';

interface MultipleFileUploadProps {
  gameType: 'euromillions' | 'loto';
  onUploadSuccess: (message: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

interface FileValidationResult {
  filename: string;
  valid: boolean;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  duplicates: number;
  date_range: {
    min: string;
    max: string;
  };
  summary: {
    total_draws: number;
    years_covered: number;
    yearly_breakdown: Record<string, number>;
  };
  errors: string[];
  warnings: string[];
}

interface ValidationSummary {
  total_files: number;
  valid_files: number;
  invalid_files: number;
  total_rows: number;
  total_valid_rows: number;
  total_duplicates: number;
}

const MultipleFileUpload: React.FC<MultipleFileUploadProps> = ({
  gameType,
  onUploadSuccess,
  onClose,
  isOpen
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    summary: ValidationSummary;
    results: FileValidationResult[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    setValidationResults(null);
    setError(null);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles(files);
    setValidationResults(null);
    setError(null);
  };

  const validateFiles = async () => {
    if (selectedFiles.length === 0) {
      setError('Veuillez sélectionner au moins un fichier');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post(
        `http://localhost:8000/api/${gameType}/validate-multiple`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setValidationResults(response.data);
    } catch (error: any) {
      console.error('Erreur lors de la validation:', error);
      setError(error.response?.data?.detail || 'Erreur lors de la validation des fichiers');
    } finally {
      setIsValidating(false);
    }
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      setError('Veuillez sélectionner au moins un fichier');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post(
        `http://localhost:8000/api/${gameType}/import-multiple`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      onUploadSuccess(response.data.message);
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de l\'upload:', error);
      setError(error.response?.data?.detail || 'Erreur lors de l\'import des fichiers');
    } finally {
      setIsUploading(false);
    }
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setValidationResults(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setValidationResults(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            📁 Upload Multiple - {gameType === 'loto' ? 'Loto' : 'Euromillions'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Zone de sélection de fichiers */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="text-gray-600 mb-4">
              <div className="text-4xl mb-2">📁</div>
              <p className="text-lg font-medium">Glissez-déposez vos fichiers CSV ici</p>
              <p className="text-sm">ou</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Sélectionner des fichiers
            </button>
          </div>

          {/* Liste des fichiers sélectionnés */}
          {selectedFiles.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Fichiers sélectionnés ({selectedFiles.length})</h3>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={clearFiles}
                className="text-gray-500 hover:text-gray-700 text-sm mt-2"
              >
                Effacer tous les fichiers
              </button>
            </div>
          )}

          {/* Résultats de validation */}
          {validationResults && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Résultats de validation</h3>
              
              {/* Résumé global */}
              <div className="bg-blue-50 p-3 rounded mb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Fichiers :</span>
                    <br />
                    {validationResults.summary.valid_files}/{validationResults.summary.total_files} valides
                  </div>
                  <div>
                    <span className="font-medium">Lignes :</span>
                    <br />
                    {validationResults.summary.total_valid_rows}/{validationResults.summary.total_rows} valides
                  </div>
                  <div>
                    <span className="font-medium">Doublons :</span>
                    <br />
                    {validationResults.summary.total_duplicates} détectés
                  </div>
                  <div>
                    <span className="font-medium">Statut :</span>
                    <br />
                    {validationResults.summary.valid_files === validationResults.summary.total_files ? 
                      '✅ Tous valides' : '⚠️ Erreurs détectées'}
                  </div>
                </div>
              </div>

              {/* Détails par fichier */}
              <div className="space-y-2">
                {validationResults.results.map((result, index) => (
                  <div key={index} className={`p-3 rounded border ${result.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{result.filename}</span>
                      <span className={`text-sm px-2 py-1 rounded ${result.valid ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {result.valid ? '✅ Valide' : '❌ Invalide'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <div>Lignes : {result.valid_rows}/{result.total_rows} valides</div>
                      <div>Doublons : {result.duplicates}</div>
                      {result.date_range.min && (
                        <div>Période : {result.date_range.min} à {result.date_range.max}</div>
                      )}
                    </div>

                    {result.errors.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-red-600">Erreurs :</span>
                        <ul className="text-sm text-red-600 ml-4">
                          {result.errors.map((error, i) => (
                            <li key={i}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.warnings.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-yellow-600">Avertissements :</span>
                        <ul className="text-sm text-yellow-600 ml-4">
                          {result.warnings.map((warning, i) => (
                            <li key={i}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
            
            {selectedFiles.length > 0 && (
              <>
                <button
                  onClick={validateFiles}
                  disabled={isValidating}
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isValidating ? '⏳ Validation...' : '🔍 Valider'}
                </button>
                
                {validationResults && validationResults.summary.valid_files > 0 && (
                  <button
                    onClick={uploadFiles}
                    disabled={isUploading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUploading ? '⏳ Import...' : '📥 Importer'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultipleFileUpload; 