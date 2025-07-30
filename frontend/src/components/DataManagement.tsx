import React, { useState } from 'react';

interface DataManagementProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: 'euromillions' | 'lotto';
}

const DataManagement: React.FC<DataManagementProps> = ({ isOpen, onClose, gameType }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteData = async (type: 'euromillions' | 'loto' | 'all') => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer toutes les données ${type === 'all' ? '' : type} ? Cette action est irréversible.`)) {
      return;
    }

    setIsDeleting(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/import/clear/${type}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(result.message);
        
        // Fermer la modale après 3 secondes
        setTimeout(() => {
          onClose();
          setMessage(null);
          setIsDeleting(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Erreur suppression:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            🗑️ Gestion des Données - {gameType === 'euromillions' ? 'Euromillions' : 'Lotto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Attention
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  La suppression des données est irréversible. Tous les tirages importés seront définitivement supprimés.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleDeleteData(gameType === 'lotto' ? 'loto' : gameType)}
            disabled={isDeleting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-3 rounded-md font-medium transition-colors"
          >
            {isDeleting ? '⏳ Suppression en cours...' : `🗑️ Supprimer les données ${gameType === 'euromillions' ? 'Euromillions' : 'Lotto'}`}
          </button>

          <button
            onClick={() => handleDeleteData('all')}
            disabled={isDeleting}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white px-4 py-3 rounded-md font-medium transition-colors"
          >
            {isDeleting ? '⏳ Suppression en cours...' : '🗑️ Supprimer TOUTES les données (Euromillions + Lotto)'}
          </button>
        </div>

        {/* Messages d'erreur et de succès */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            ❌ {error}
          </div>
        )}

        {message && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            ✅ {message}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataManagement; 