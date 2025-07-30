import React, { useState, useEffect } from 'react';

interface ManualDrawInputProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: 'euromillions' | 'lotto';
  onSubmit: (draw: {
    numbers: number[];
    stars?: number[];
    chanceNumber?: number;
    date: string;
  }) => void;
}

const ManualDrawInput: React.FC<ManualDrawInputProps> = ({
  isOpen,
  onClose,
  gameType,
  onSubmit
}) => {
  const [numbers, setNumbers] = useState<(number | null)[]>([]);
  const [stars, setStars] = useState<(number | null)[]>([]);
  const [chanceNumber, setChanceNumber] = useState<number | null>(null);
  const [date, setDate] = useState<string>('');

  // Configuration selon le type de jeu
  const config = {
    euromillions: {
      mainNumbers: 5,
      mainRange: 50,
      stars: 2,
      starRange: 12,
      hasChance: false,
      chanceRange: 0
    },
    lotto: {
      mainNumbers: 6,
      mainRange: 49,
      stars: 0,
      starRange: 0,
      hasChance: true,
      chanceRange: 10
    }
  };

  const currentConfig = config[gameType];

  // Initialiser les tableaux selon le type de jeu
  useEffect(() => {
    setNumbers(new Array(currentConfig.mainNumbers).fill(null));
    if (currentConfig.stars > 0) {
      setStars(new Array(currentConfig.stars).fill(null));
    } else {
      setStars([]);
    }
    if (currentConfig.hasChance) {
      setChanceNumber(null);
    } else {
      setChanceNumber(null);
    }
    setDate(new Date().toISOString().split('T')[0]);
  }, [gameType, currentConfig]);

  const handleNumberChange = (index: number, value: string) => {
    const numValue = value === '' ? null : parseInt(value);
    if (numValue === null || (numValue >= 1 && numValue <= currentConfig.mainRange)) {
      const newNumbers = [...numbers];
      newNumbers[index] = numValue;
      setNumbers(newNumbers);
    }
  };

  const handleStarChange = (index: number, value: string) => {
    const numValue = value === '' ? null : parseInt(value);
    if (numValue === null || (numValue >= 1 && numValue <= currentConfig.starRange)) {
      const newStars = [...stars];
      newStars[index] = numValue;
      setStars(newStars);
    }
  };

  const handleChanceChange = (value: string) => {
    const numValue = value === '' ? null : parseInt(value);
    if (numValue === null || (numValue >= 1 && numValue <= currentConfig.chanceRange)) {
      setChanceNumber(numValue);
    }
  };

  const generateRandom = () => {
    // Générer des numéros principaux aléatoires
    const randomNumbers: number[] = [];
    while (randomNumbers.length < currentConfig.mainNumbers) {
      const random = Math.floor(Math.random() * currentConfig.mainRange) + 1;
      if (!randomNumbers.includes(random)) {
        randomNumbers.push(random);
      }
    }
    setNumbers(randomNumbers.sort((a, b) => a - b));

    // Générer des étoiles aléatoires (Euromillions)
    if (currentConfig.stars > 0) {
      const randomStars: number[] = [];
      while (randomStars.length < currentConfig.stars) {
        const random = Math.floor(Math.random() * currentConfig.starRange) + 1;
        if (!randomStars.includes(random)) {
          randomStars.push(random);
        }
      }
      setStars(randomStars.sort((a, b) => a - b));
    }

    // Générer un numéro chance aléatoire (Lotto)
    if (currentConfig.hasChance) {
      setChanceNumber(Math.floor(Math.random() * currentConfig.chanceRange) + 1);
    }
  };

  const handleSubmit = () => {
    // Validation
    if (numbers.some(n => n === null)) {
      alert('Veuillez remplir tous les numéros principaux');
      return;
    }

    if (currentConfig.stars > 0 && stars.some(s => s === null)) {
      alert('Veuillez remplir toutes les étoiles');
      return;
    }

    if (currentConfig.hasChance && chanceNumber === null) {
      alert('Veuillez remplir le numéro chance');
      return;
    }

    if (!date) {
      alert('Veuillez sélectionner une date');
      return;
    }

    // Vérifier les doublons
    if (new Set(numbers).size !== numbers.length) {
      alert('Les numéros principaux ne doivent pas être dupliqués');
      return;
    }

    if (currentConfig.stars > 0 && new Set(stars).size !== stars.length) {
      alert('Les étoiles ne doivent pas être dupliquées');
      return;
    }

    const drawData = {
      numbers: numbers as number[],
      date,
      ...(currentConfig.stars > 0 && { stars: stars as number[] }),
      ...(currentConfig.hasChance && { chanceNumber: chanceNumber as number })
    };

    onSubmit(drawData);
    onClose();
  };

  const isFormValid = () => {
    return (
      numbers.every(n => n !== null) &&
      (currentConfig.stars === 0 || stars.every(s => s !== null)) &&
      (!currentConfig.hasChance || chanceNumber !== null) &&
      date !== '' &&
      new Set(numbers).size === numbers.length &&
      (currentConfig.stars === 0 || new Set(stars).size === stars.length)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            ✏️ Tirage Manuel - {gameType === 'euromillions' ? 'Euromillions' : 'Lotto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date du tirage
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Numéros principaux */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéros principaux (1-{currentConfig.mainRange})
            </label>
            <div className="grid grid-cols-5 gap-2">
              {numbers.map((num, index) => (
                <input
                  key={index}
                  type="number"
                  min="1"
                  max={currentConfig.mainRange}
                  value={num || ''}
                  onChange={(e) => handleNumberChange(index, e.target.value)}
                  className="p-2 border border-gray-300 rounded-md text-center"
                  placeholder={(index + 1).toString()}
                />
              ))}
            </div>
          </div>

          {/* Étoiles (Euromillions) */}
          {currentConfig.stars > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ⭐ Étoiles (1-{currentConfig.starRange})
              </label>
              <div className="grid grid-cols-2 gap-2">
                {stars.map((star, index) => (
                  <input
                    key={index}
                    type="number"
                    min="1"
                    max={currentConfig.starRange}
                    value={star || ''}
                    onChange={(e) => handleStarChange(index, e.target.value)}
                    className="p-2 border border-gray-300 rounded-md text-center"
                    placeholder={`Étoile ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Numéro chance (Lotto) */}
          {currentConfig.hasChance && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🍀 Numéro chance (1-{currentConfig.chanceRange})
              </label>
              <input
                type="number"
                min="1"
                max={currentConfig.chanceRange}
                value={chanceNumber || ''}
                onChange={(e) => handleChanceChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-center"
                placeholder="Numéro chance"
              />
            </div>
          )}

          {/* Bouton génération aléatoire */}
          <div className="pt-2">
            <button
              onClick={generateRandom}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              🎲 Générer Aléatoirement
            </button>
          </div>

          {/* Boutons d'action */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid()}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                isFormValid()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualDrawInput; 