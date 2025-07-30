import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface GeneratedGrid {
  numbers: number[];
  stars: number[];
  strategy: string;
  confidence?: number;
  patterns_used?: any;
}

interface Strategy {
  name: string;
  description: string;
  best_for: string;
}

interface EuromillionsAdvancedGeneratorProps {
  onClose: () => void;
  isOpen: boolean;
}

const EuromillionsAdvancedGenerator: React.FC<EuromillionsAdvancedGeneratorProps> = ({ onClose, isOpen }) => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState('balanced');
  const [numGrids, setNumGrids] = useState(5);
  const [generatedGrids, setGeneratedGrids] = useState<GeneratedGrid[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customGrid, setCustomGrid] = useState({ numbers: '', stars: '' });
  const [gridAnalysis, setGridAnalysis] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStrategies();
    }
  }, [isOpen]);

  const fetchStrategies = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/euromillions/advanced/strategies');
      setStrategies(response.data.strategies);
    } catch (err) {
      console.error('Erreur lors du chargement des stratégies:', err);
    }
  };

  const generateGrids = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `http://localhost:8000/api/euromillions/advanced/generate-multiple-grids`,
        {
          params: {
            num_grids: numGrids,
            strategy: selectedStrategy
          }
        }
      );
      
      setGeneratedGrids(response.data.grids);
    } catch (err) {
      setError('Erreur lors de la génération des grilles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeCustomGrid = async () => {
    try {
      const numbers = customGrid.numbers.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
      const stars = customGrid.stars.split(',').map(s => parseInt(s.trim())).filter(s => !isNaN(s));
      
      if (numbers.length !== 5 || stars.length !== 2) {
        setError('Veuillez entrer exactement 5 numéros (1-50) et 2 étoiles (1-12)');
        return;
      }
      
      const response = await axios.post('http://localhost:8000/api/euromillions/advanced/analyze-grid', {
        numbers,
        stars
      });
      
      setGridAnalysis(response.data.analysis);
      setError(null);
    } catch (err) {
      setError('Erreur lors de l\'analyse de la grille');
      console.error(err);
    }
  };

  const formatConfidence = (confidence: number) => {
    if (confidence >= 0.8) return { text: 'Très élevée', color: 'text-green-600' };
    if (confidence >= 0.6) return { text: 'Élevée', color: 'text-blue-600' };
    if (confidence >= 0.4) return { text: 'Moyenne', color: 'text-yellow-600' };
    return { text: 'Faible', color: 'text-red-600' };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-800">
            Générateur Avancé Euromillions
          </h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          {/* Configuration */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sélection de stratégie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stratégie de génération
                </label>
                <select
                  value={selectedStrategy}
                  onChange={(e) => setSelectedStrategy(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {strategies.map(strategy => (
                    <option key={strategy.name} value={strategy.name}>
                      {strategy.name.charAt(0).toUpperCase() + strategy.name.slice(1)}
                    </option>
                  ))}
                </select>
                
                {strategies.find(s => s.name === selectedStrategy) && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p><strong>Description:</strong> {strategies.find(s => s.name === selectedStrategy)?.description}</p>
                    <p><strong>Idéal pour:</strong> {strategies.find(s => s.name === selectedStrategy)?.best_for}</p>
                  </div>
                )}
              </div>

              {/* Nombre de grilles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de grilles
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={numGrids}
                  onChange={(e) => setNumGrids(parseInt(e.target.value) || 1)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Bouton de génération */}
              <div className="flex items-end">
                <button
                  onClick={generateGrids}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Génération...' : 'Générer les Grilles'}
                </button>
              </div>
            </div>
          </div>

          {/* Grilles générées */}
          {generatedGrids.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Grilles Générées</h2>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedGrids.map((grid, index) => (
                  <div key={index} className="border border-gray-300 rounded-lg p-4 hover:shadow-md">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-blue-600">
                        Grille {index + 1}
                      </span>
                      <span className="text-sm text-gray-500 capitalize">
                        {grid.strategy}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-sm text-gray-600 mb-1">Numéros:</div>
                      <div className="flex flex-wrap gap-1">
                        {grid.numbers.map((num, i) => (
                          <span
                            key={i}
                            className="inline-block w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-sm text-gray-600 mb-1">Étoiles:</div>
                      <div className="flex gap-1">
                        {grid.stars.map((star, i) => (
                          <span
                            key={i}
                            className="inline-block w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-sm font-semibold"
                          >
                            {star}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {grid.confidence && (
                      <div className="text-sm">
                        <span className="text-gray-600">Confiance: </span>
                        <span className={formatConfidence(grid.confidence).color}>
                          {formatConfidence(grid.confidence).text}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analyse de grille personnalisée */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Analyse de Grille Personnalisée</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéros (séparés par des virgules, ex: 1, 15, 23, 34, 47)
                </label>
                <input
                  type="text"
                  value={customGrid.numbers}
                  onChange={(e) => setCustomGrid({ ...customGrid, numbers: e.target.value })}
                  placeholder="1, 15, 23, 34, 47"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Étoiles (séparées par des virgules, ex: 3, 8)
                </label>
                <input
                  type="text"
                  value={customGrid.stars}
                  onChange={(e) => setCustomGrid({ ...customGrid, stars: e.target.value })}
                  placeholder="3, 8"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <button
              onClick={analyzeCustomGrid}
              className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              Analyser la Grille
            </button>
            
            {gridAnalysis && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Résultats de l'Analyse</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Patterns Détectés</h4>
                    <div className="space-y-2">
                      <div><strong>Pairs/Impairs:</strong> {gridAnalysis.patterns?.odd_even}</div>
                      <div><strong>Hauts/Bas:</strong> {gridAnalysis.patterns?.high_low}</div>
                      <div><strong>Somme:</strong> {gridAnalysis.patterns?.sum_range}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Fréquences</h4>
                    <div className="space-y-2">
                      <div><strong>Confiance:</strong> {formatConfidence(gridAnalysis.confidence || 0).text}</div>
                      <div><strong>Score:</strong> {(gridAnalysis.confidence || 0).toFixed(3)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Informations sur les stratégies */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Guide des Stratégies</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {strategies.map(strategy => (
                <div key={strategy.name} className="border border-gray-300 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2 capitalize text-blue-600">
                    {strategy.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{strategy.description}</p>
                  <p className="text-xs text-gray-500">
                    <strong>Idéal pour:</strong> {strategy.best_for}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EuromillionsAdvancedGenerator; 