import React, { useState, useRef } from 'react';
import axios from 'axios';

interface ValidationResult {
  valid: boolean;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  duplicates: number;
  date_range: {
    min: string | null;
    max: string | null;
  };
  summary: {
    total_draws: number;
    years_covered: number;
    yearly_breakdown: Record<string, number>;
  };
  errors: string[];
  warnings: string[];
}

interface FileUploadWithValidationProps {
  gameType: 'euromillions' | 'loto';
  onUploadSuccess: (message: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const FileUploadWithValidation: React.FC<FileUploadWithValidationProps> = ({
  gameType,
  onUploadSuccess,
  onClose,
  isOpen
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValidationResult(null);
      setShowValidation(false);
    }
  };

  const validateFile = async () => {
    if (!selectedFile) return;

    setIsValidating(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post(
        `http://localhost:8000/api/${gameType}/validate-upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setValidationResult(response.data);
      setShowValidation(true);
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      alert('Erreur lors de la validation du fichier');
    } finally {
      setIsValidating(false);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post(
        `http://localhost:8000/api/${gameType}/import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      onUploadSuccess(response.data.message);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'upload du fichier');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setValidationResult(null);
    setShowValidation(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📁 Upload de fichier {gameType === 'euromillions' ? 'Euromillions' : 'Loto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Sélection de fichier */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              📂 Sélectionner un fichier CSV
            </button>
            {selectedFile && (
              <div className="mt-4">
                <p className="text-green-600 font-medium">
                  ✅ Fichier sélectionné: {selectedFile.name}
                </p>
                <p className="text-sm text-gray-600">
                  Taille: {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          {selectedFile && (
            <div className="flex gap-4 justify-center">
              <button
                onClick={validateFile}
                disabled={isValidating}
                className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
              >
                {isValidating ? '🔍 Validation...' : '🔍 Valider le fichier'}
              </button>
              
              {validationResult?.valid && (
                <button
                  onClick={uploadFile}
                  disabled={isUploading}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {isUploading ? '📤 Upload...' : '📤 Importer le fichier'}
                </button>
              )}
            </div>
          )}

          {/* Résultats de validation */}
          {showValidation && validationResult && (
            <div className="border rounded-lg p-6 bg-gray-50">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                📋 Rapport de validation
              </h3>

              {/* Statut général */}
              <div className={`p-4 rounded-lg mb-4 ${
                validationResult.valid 
                  ? 'bg-green-100 border border-green-300' 
                  : 'bg-red-100 border border-red-300'
              }`}>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">
                    {validationResult.valid ? '✅' : '❌'}
                  </span>
                  <span className="font-bold">
                    {validationResult.valid ? 'Fichier valide' : 'Fichier invalide'}
                  </span>
                </div>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {validationResult.total_rows}
                  </div>
                  <div className="text-sm text-blue-800">Total lignes</div>
                </div>
                <div className="bg-green-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {validationResult.valid_rows}
                  </div>
                  <div className="text-sm text-green-800">Lignes valides</div>
                </div>
                <div className="bg-red-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {validationResult.invalid_rows}
                  </div>
                  <div className="text-sm text-red-800">Lignes invalides</div>
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {validationResult.duplicates}
                  </div>
                  <div className="text-sm text-yellow-800">Doublons</div>
                </div>
              </div>

              {/* Résumé */}
              {validationResult.summary && (
                <div className="bg-white p-4 rounded-lg border mb-4">
                  <h4 className="font-bold text-gray-800 mb-2">📅 Résumé des données</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="font-medium">Total tirages:</span> {validationResult.summary.total_draws}
                    </div>
                    <div>
                      <span className="font-medium">Années couvertes:</span> {validationResult.summary.years_covered}
                    </div>
                    <div>
                      <span className="font-medium">Période:</span> {validationResult.date_range.min} à {validationResult.date_range.max}
                    </div>
                  </div>
                  
                  {validationResult.summary.yearly_breakdown && (
                    <div className="mt-3">
                      <span className="font-medium">Répartition par année:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Object.entries(validationResult.summary.yearly_breakdown)
                          .sort(([a], [b]) => b.localeCompare(a))
                          .map(([year, count]) => (
                            <span key={year} className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm">
                              {year}: {count}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Erreurs */}
              {validationResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="font-bold text-red-800 mb-2">
                    ❌ Erreurs ({validationResult.errors.length})
                  </h4>
                  <div className="max-h-40 overflow-y-auto">
                    {validationResult.errors.slice(0, 10).map((error, index) => (
                      <div key={index} className="text-red-700 text-sm mb-1">
                        • {error}
                      </div>
                    ))}
                    {validationResult.errors.length > 10 && (
                      <div className="text-red-600 text-sm italic">
                        ... et {validationResult.errors.length - 10} autres erreurs
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Avertissements */}
              {validationResult.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-800 mb-2">
                    ⚠️ Avertissements ({validationResult.warnings.length})
                  </h4>
                  <div className="max-h-40 overflow-y-auto">
                    {validationResult.warnings.map((warning, index) => (
                      <div key={index} className="text-yellow-700 text-sm mb-1">
                        • {warning}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Boutons de fermeture */}
          <div className="flex justify-end gap-4">
            <button
              onClick={resetForm}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              🔄 Réinitialiser
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadWithValidation; 