import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Draw {
  id: number;
  date: string;
  numbers: number[];
  stars?: number[];
  chanceNumber?: number;
  gameType: 'euromillions' | 'lotto';
}

interface EditDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  draw: Draw | null;
  gameType: 'euromillions' | 'lotto';
  onSuccess: (message: string) => void;
}

const EditDrawModal: React.FC<EditDrawModalProps> = ({
  isOpen,
  onClose,
  draw,
  gameType,
  onSuccess
}) => {
  const [date, setDate] = useState('');
  const [numbers, setNumbers] = useState<(number | null)[]>([null, null, null, null, null, null]);
  const [stars, setStars] = useState<(number | null)[]>([null, null]);
  const [chanceNumber, setChanceNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const gameConfig = {
    euromillions: {
      numbersCount: 5,
      numberRange: 50,
      starsCount: 2,
      starRange: 12,
      hasChance: false
    },
    lotto: {
      numbersCount: 6,
      numberRange: 49,
      starsCount: 0,
      starRange: 0,
      hasChance: true,
      chanceRange: 10
    }
  } as const;

  const currentConfig = gameConfig[gameType as keyof typeof gameConfig];

  // Initialiser les données quand le tirage change
  useEffect(() => {
    if (draw) {
      setDate(draw.date);
      setNumbers([...draw.numbers, ...Array(6 - draw.numbers.length).fill(null)]);
      setStars(draw.stars ? [...draw.stars, ...Array(2 - draw.stars.length).fill(null)] : [null, null]);
      setChanceNumber(draw.chanceNumber || null);
      setError(null);
    }
  }, [draw]);

  const handleNumberChange = (index: number, value: string) => {
    const numValue = value === '' ? null : parseInt(value);
    if (numValue === null || (numValue >= 1 && numValue <= currentConfig.numberRange)) {
      const newNumbers = [...numbers];
      newNumbers[index] = numValue;
      setNumbers(newNumbers);
    }
  };

  const handleStarChange = (index: number, value: string) => {
    const starValue = value === '' ? null : parseInt(value);
    if (starValue === null || (starValue >= 1 && starValue <= currentConfig.starRange)) {
      const newStars = [...stars];
      newStars[index] = starValue;
      setStars(newStars);
    }
  };

  const handleChanceChange = (value: string) => {
    const chanceValue = value === '' ? null : parseInt(value);
    if (chanceValue === null || (chanceValue >= 1 && chanceValue <= (currentConfig as any).chanceRange)) {
      setChanceNumber(chanceValue);
    }
  };

  const handleSubmit = async () => {
    if (!draw) return;

    setLoading(true);
    setError(null);

    try {
      const endpoint = gameType === 'euromillions' 
        ? `http://localhost:8000/api/euromillions/update-draw/${draw.id}`
        : `http://localhost:8000/api/loto/update-draw/${draw.id}`;

      const drawData = gameType === 'euromillions' 
        ? {
            date,
            numeros: numbers.slice(0, 5).filter(n => n !== null) as number[],
            etoiles: stars.filter(s => s !== null) as number[]
          }
        : {
            date,
            numeros: numbers.filter(n => n !== null) as number[],
            complementaire: chanceNumber as number
          };

      const response = await axios.put(endpoint, drawData);
      
      if (onSuccess) {
        onSuccess(response.data.message);
      }
      
      onClose();
    } catch (err: any) {
      console.error('Erreur lors de la modification du tirage:', err);
      setError(err.response?.data?.detail || 'Erreur lors de la modification du tirage');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!draw) return;

    setLoading(true);
    setError(null);

    try {
      const endpoint = gameType === 'euromillions' 
        ? `http://localhost:8000/api/euromillions/delete-draw/${draw.id}`
        : `http://localhost:8000/api/loto/delete-draw/${draw.id}`;

      const response = await axios.delete(endpoint);
      
      if (onSuccess) {
        onSuccess(response.data.message);
      }
      
      onClose();
    } catch (err: any) {
      console.error('Erreur lors de la suppression du tirage:', err);
      setError(err.response?.data?.detail || 'Erreur lors de la suppression du tirage');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const isFormValid = () => {
    return (
      numbers.slice(0, currentConfig.numbersCount).every(n => n !== null) &&
      (currentConfig.starsCount === 0 || stars.every(s => s !== null)) &&
      (!currentConfig.hasChance || chanceNumber !== null) &&
      date !== '' &&
      new Set(numbers.slice(0, currentConfig.numbersCount)).size === currentConfig.numbersCount &&
      (currentConfig.starsCount === 0 || new Set(stars).size === currentConfig.starsCount)
    );
  };

  if (!isOpen || !draw) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            ✏️ Modifier le tirage #{draw.id} - {gameType === 'euromillions' ? 'Euromillions' : 'Lotto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 Date du tirage
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Numéros principaux */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              🎯 Numéros principaux (1-{currentConfig.numberRange})
            </label>
            <div className="grid grid-cols-5 gap-3">
              {numbers.slice(0, currentConfig.numbersCount).map((num, index) => (
                <input
                  key={index}
                  type="number"
                  min="1"
                  max={currentConfig.numberRange}
                  value={num || ''}
                  onChange={(e) => handleNumberChange(index, e.target.value)}
                  className="w-full p-3 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-bold"
                />
              ))}
            </div>
          </div>

          {/* Étoiles (Euromillions uniquement) */}
          {gameType === 'euromillions' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                ⭐ Étoiles (1-{currentConfig.starRange})
              </label>
              <div className="grid grid-cols-2 gap-3">
                {stars.map((star, index) => (
                  <input
                    key={index}
                    type="number"
                    min="1"
                    max={currentConfig.starRange}
                    value={star || ''}
                    onChange={(e) => handleStarChange(index, e.target.value)}
                    className="w-full p-3 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg font-bold"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Numéro chance (Lotto uniquement) */}
          {gameType === 'lotto' && currentConfig.hasChance && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                🍀 Numéro chance (1-{(currentConfig as any).chanceRange})
              </label>
              <input
                type="number"
                min="1"
                max={(currentConfig as any).chanceRange}
                value={chanceNumber || ''}
                onChange={(e) => handleChanceChange(e.target.value)}
                className="w-full p-3 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-bold"
              />
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-4 justify-end">
            <button
              onClick={confirmDelete}
              disabled={loading}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              🗑️ Supprimer
            </button>
            
            <button
              onClick={onClose}
              disabled={loading}
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={loading || !isFormValid()}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? '💾 Sauvegarde...' : '💾 Sauvegarder'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                🗑️ Confirmer la suppression
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer ce tirage ? Cette action est irréversible.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    handleDelete();
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditDrawModal; 