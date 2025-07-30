import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface DailyDrawInputProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: 'euromillions' | 'lotto';
  onSuccess?: (message: string) => void;
}

const DailyDrawInput: React.FC<DailyDrawInputProps> = ({ 
  isOpen, 
  onClose, 
  gameType, 
  onSuccess 
}) => {
  const [date, setDate] = useState<string>('');
  const [numbers, setNumbers] = useState<(number | null)[]>([null, null, null, null, null, null]);
  const [stars, setStars] = useState<(number | null)[]>([null, null]);
  const [chanceNumber, setChanceNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuration selon le type de jeu
  const config = {
    euromillions: {
      numbersCount: 5,
      numberRange: 50,
      starsCount: 2,
      starRange: 12,
      hasChance: false
    },
    lotto: {
      numbersCount: 6,
      numberRange: 45,
      starsCount: 0,
      starRange: 0,
      hasChance: true,
      chanceRange: 10
    }
  };

  const currentConfig = config[gameType];

  // Initialiser la date à aujourd'hui
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setNumbers(new Array(currentConfig.numbersCount).fill(null));
      setStars(new Array(currentConfig.starsCount).fill(null));
      setChanceNumber(null);
      setError(null);
    }
  }, [isOpen, currentConfig.numbersCount, currentConfig.starsCount]);

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

  const generateRandomNumbers = () => {
    const availableNumbers = Array.from({ length: currentConfig.numberRange }, (_, i) => i + 1);
    const randomNumbers: number[] = [];
    
    for (let i = 0; i < currentConfig.numbersCount; i++) {
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      randomNumbers.push(availableNumbers[randomIndex]);
      availableNumbers.splice(randomIndex, 1);
    }
    
    setNumbers(randomNumbers.sort((a, b) => a - b));
  };

  const generateRandomStars = () => {
    if (currentConfig.starsCount === 0) return;
    
    const availableStars = Array.from({ length: currentConfig.starRange }, (_, i) => i + 1);
    const randomStars: number[] = [];
    
    for (let i = 0; i < currentConfig.starsCount; i++) {
      const randomIndex = Math.floor(Math.random() * availableStars.length);
      randomStars.push(availableStars[randomIndex]);
      availableStars.splice(randomIndex, 1);
    }
    
    setStars(randomStars.sort((a, b) => a - b));
  };

  const generateRandomChance = () => {
    if (!currentConfig.hasChance) return;
    const randomChance = Math.floor(Math.random() * (currentConfig as any).chanceRange) + 1;
    setChanceNumber(randomChance);
  };

  const handleSubmit = async () => {
    // Validation
    if (numbers.some(n => n === null)) {
      setError('Veuillez remplir tous les numéros principaux');
      return;
    }

    if (currentConfig.starsCount > 0 && stars.some(s => s === null)) {
      setError('Veuillez remplir toutes les étoiles');
      return;
    }

    if (currentConfig.hasChance && chanceNumber === null) {
      setError('Veuillez remplir le numéro chance');
      return;
    }

    if (!date) {
      setError('Veuillez sélectionner une date');
      return;
    }

    // Vérifier les doublons
    if (new Set(numbers).size !== numbers.length) {
      setError('Les numéros principaux ne doivent pas être dupliqués');
      return;
    }

    if (currentConfig.starsCount > 0 && new Set(stars).size !== stars.length) {
      setError('Les étoiles ne doivent pas être dupliquées');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = gameType === 'euromillions' 
        ? 'http://localhost:8000/api/euromillions/add-draw'
        : 'http://localhost:8000/api/loto/add-draw';

      const drawData = gameType === 'euromillions' 
        ? {
            date,
            numeros: numbers as number[],
            etoiles: stars as number[]
          }
        : {
            date,
            numeros: numbers as number[],
            complementaire: chanceNumber as number
          };

      const response = await axios.post(endpoint, drawData);
      
      if (onSuccess) {
        onSuccess(response.data.message);
      }
      
      onClose();
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout du tirage:', err);
      setError(err.response?.data?.detail || 'Erreur lors de l\'ajout du tirage');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      numbers.every(n => n !== null) &&
      (currentConfig.starsCount === 0 || stars.every(s => s !== null)) &&
      (!currentConfig.hasChance || chanceNumber !== null) &&
      date !== '' &&
      new Set(numbers).size === numbers.length &&
      (currentConfig.starsCount === 0 || new Set(stars).size === stars.length)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            ✏️ Ajout Quotidien - {gameType === 'euromillions' ? 'Euromillions' : 'Lotto'}
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
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                🎯 Numéros principaux (1-{currentConfig.numberRange})
              </label>
              <button
                type="button"
                onClick={generateRandomNumbers}
                className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
              >
                🎲 Aléatoire
              </button>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {numbers.map((num, index) => (
                <input
                  key={index}
                  type="number"
                  min="1"
                  max={currentConfig.numberRange}
                  value={num || ''}
                  onChange={(e) => handleNumberChange(index, e.target.value)}
                  className="w-full p-3 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-bold"
                  placeholder={(index + 1).toString()}
                />
              ))}
            </div>
          </div>

          {/* Étoiles (Euromillions) */}
          {currentConfig.starsCount > 0 && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  ⭐ Étoiles (1-{currentConfig.starRange})
                </label>
                <button
                  type="button"
                  onClick={generateRandomStars}
                  className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200"
                >
                  🎲 Aléatoire
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {stars.map((star, index) => (
                  <input
                    key={index}
                    type="number"
                    min="1"
                    max={currentConfig.starRange}
                    value={star || ''}
                    onChange={(e) => handleStarChange(index, e.target.value)}
                    className="w-full p-3 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-lg font-bold"
                    placeholder={(index + 1).toString()}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Numéro chance (Lotto) */}
          {currentConfig.hasChance && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  🍀 Numéro chance (1-{(currentConfig as any).chanceRange})
                </label>
                <button
                  type="button"
                  onClick={generateRandomChance}
                  className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                >
                  🎲 Aléatoire
                </button>
              </div>
              <div className="w-32">
                <input
                  type="number"
                  min="1"
                  max={(currentConfig as any).chanceRange}
                  value={chanceNumber || ''}
                  onChange={(e) => handleChanceChange(e.target.value)}
                  className="w-full p-3 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-bold"
                  placeholder="Chance"
                />
              </div>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Boutons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid() || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Ajout en cours...' : '✅ Ajouter le tirage'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyDrawInput; 