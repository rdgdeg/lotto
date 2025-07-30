import React, { useState } from 'react';

interface NumberHistorySearchProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: 'euromillions' | 'lotto';
}

const NumberHistorySearch: React.FC<NumberHistorySearchProps> = ({ isOpen, onClose, gameType }) => {
  const [searchNumber, setSearchNumber] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const handleSearch = async () => {
    if (!searchNumber.trim()) {
      alert('Veuillez entrer un numéro à rechercher');
      return;
    }

    const number = parseInt(searchNumber);
    if (isNaN(number)) {
      alert('Veuillez entrer un numéro valide');
      return;
    }

    setIsSearching(true);
    
    // Simulation d'une recherche (remplacer par un vrai appel API)
    setTimeout(() => {
      const mockResults = [
        {
          date: '2024-01-15',
          numbers: [7, 12, 23, 34, 45],
          stars: [3, 8],
          gameType: 'euromillions'
        },
        {
          date: '2024-01-08',
          numbers: [3, 11, 22, 33, 44],
          stars: [1, 9],
          gameType: 'euromillions'
        }
      ].filter(result => result.numbers.includes(number) || result.stars?.includes(number));

      setSearchResults(mockResults);
      setIsSearching(false);
    }, 1000);
  };

  const clearSearch = () => {
    setSearchNumber('');
    setSearchResults([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            🔍 Recherche par Numéro - {gameType === 'euromillions' ? 'Euromillions' : 'Lotto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Formulaire de recherche */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro à rechercher
              </label>
              <input
                type="number"
                min="1"
                max={gameType === 'euromillions' ? 50 : 49}
                value={searchNumber}
                onChange={(e) => setSearchNumber(e.target.value)}
                placeholder={`Entrez un numéro (1-${gameType === 'euromillions' ? '50' : '49'})`}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchNumber.trim()}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  isSearching || !searchNumber.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isSearching ? '🔍 Recherche...' : '🔍 Rechercher'}
              </button>
              <button
                onClick={clearSearch}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                🗑️ Effacer
              </button>
            </div>
          </div>
        </div>

        {/* Résultats */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Résultats de la recherche
          </h3>

          {isSearching ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Recherche en cours...</p>
            </div>
          ) : searchResults.length === 0 && searchNumber ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Aucun résultat trouvé pour le numéro {searchNumber}</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-medium text-gray-800">
                        Tirage du {new Date(result.date).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        {result.gameType === 'euromillions' ? 'Euromillions' : 'Lotto'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Numéros :</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {result.numbers.map((num: number, numIndex: number) => (
                          <div
                            key={numIndex}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              num.toString() === searchNumber
                                ? 'bg-red-600 text-white'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                    </div>

                    {result.stars && result.stars.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Étoiles :</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {result.stars.map((star: number, starIndex: number) => (
                            <div
                              key={starIndex}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                star.toString() === searchNumber
                                  ? 'bg-red-600 text-white'
                                  : 'bg-yellow-600 text-white'
                              }`}
                            >
                              {star}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Entrez un numéro et cliquez sur "Rechercher" pour commencer</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumberHistorySearch; 