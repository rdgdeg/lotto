import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AdvancedGeneratorProps {
  gameType: 'lotto' | 'euromillions';
  onClose: () => void;
  isOpen: boolean;
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  parameters: any;
}

const AdvancedGenerator: React.FC<AdvancedGeneratorProps> = ({ gameType, onClose, isOpen }) => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [generatedGrids, setGeneratedGrids] = useState<number[][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const isLotto = gameType === 'lotto';
  const primaryColor = isLotto ? 'green' : 'blue';
  const primaryGradient = isLotto 
    ? 'from-green-600 to-green-700' 
    : 'from-blue-600 to-blue-700';

  useEffect(() => {
    if (isOpen) {
      fetchStrategies();
    }
  }, [isOpen, gameType]);

  const fetchStrategies = async () => {
    try {
      setIsLoading(true);
      const endpoint = isLotto 
        ? '/api/loto/advanced/strategies'
        : '/api/euromillions/advanced/strategies';
      
      const response = await axios.get(`http://localhost:8000${endpoint}`);
      setStrategies(response.data);
      if (response.data.length > 0) {
        setSelectedStrategy(response.data[0].id);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des stratégies:', err);
      setError('Impossible de charger les stratégies avancées');
    } finally {
      setIsLoading(false);
    }
  };

  const generateGrids = async () => {
    if (!selectedStrategy) return;

    try {
      setIsLoading(true);
      setError('');
      
      const endpoint = isLotto 
        ? '/api/loto/advanced/generate'
        : '/api/euromillions/advanced/generate';
      
      const response = await axios.post(`http://localhost:8000${endpoint}`, {
        strategy: selectedStrategy,
        count: 5
      });
      
      setGeneratedGrids(response.data.grids);
    } catch (err) {
      console.error('Erreur lors de la génération:', err);
      setError('Erreur lors de la génération des grilles');
    } finally {
      setIsLoading(false);
    }
  };

  const formatGrid = (grid: number[]) => {
    if (isLotto) {
      // Loto: 6 numéros + 1 chance
      const numbers = grid.slice(0, 6);
      const chance = grid[6];
      return `${numbers.join(' - ')} | Chance: ${chance}`;
    } else {
      // Euromillions: 5 numéros + 2 étoiles
      const numbers = grid.slice(0, 5);
      const stars = grid.slice(5, 7);
      return `${numbers.join(' - ')} | Étoiles: ${stars.join(' - ')}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 bg-gradient-to-r ${primaryGradient} text-white rounded-t-2xl`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {isLotto ? '🎰 Générateur Avancé Loto' : '⚡ Générateur Avancé Euromillions'}
              </h2>
              <p className="text-white/80 mt-1">
                Génération intelligente basée sur l'analyse des tendances
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Sélection de stratégie */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Stratégie de génération</h3>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Chargement des stratégies...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <select
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {strategies.map((strategy) => (
                  <option key={strategy.id} value={strategy.id}>
                    {strategy.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Bouton de génération */}
          <div className="mb-6">
            <button
              onClick={generateGrids}
              disabled={isLoading || !selectedStrategy}
              className={`w-full py-3 px-6 bg-gradient-to-r ${primaryGradient} text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Génération en cours...
                </div>
              ) : (
                '🎲 Générer des grilles avancées'
              )}
            </button>
          </div>

          {/* Grilles générées */}
          {generatedGrids.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Grilles générées</h3>
              <div className="space-y-3">
                {generatedGrids.map((grid, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">
                        Grille {index + 1}
                      </span>
                      <span className="text-sm text-gray-500">
                        {isLotto ? '6 numéros + 1 chance' : '5 numéros + 2 étoiles'}
                      </span>
                    </div>
                    <div className="mt-2 text-lg font-mono text-gray-900">
                      {formatGrid(grid)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informations sur la stratégie */}
          {selectedStrategy && strategies.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">À propos de cette stratégie</h4>
              <p className="text-blue-800 text-sm">
                {strategies.find(s => s.id === selectedStrategy)?.description || 
                 'Cette stratégie utilise des algorithmes avancés pour analyser les tendances historiques et générer des grilles optimisées.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedGenerator; 