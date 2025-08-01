import React, { useState, useEffect } from 'react';
import { localDataManager } from '../utils/localDataManager';

interface GeneratedGrid {
  numbers: number[];
  strategy: string;
  confidence?: number;
  patterns_used?: any;
}

interface Strategy {
  name: string;
  description: string;
  best_for: string;
}

interface LottoAdvancedGeneratorProps {
  onClose: () => void;
  isOpen: boolean;
}

const LottoAdvancedGenerator: React.FC<LottoAdvancedGeneratorProps> = ({ onClose, isOpen }) => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState('balanced');
  const [generationMode, setGenerationMode] = useState<'single' | 'all'>('single');
  const [generatedGrids, setGeneratedGrids] = useState<GeneratedGrid[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customGrid, setCustomGrid] = useState({ numbers: '' });
  const [gridAnalysis, setGridAnalysis] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      initializeStrategies();
    }
  }, [isOpen]);

  const initializeStrategies = () => {
    const lottoStrategies: Strategy[] = [
      {
        name: 'balanced',
        description: 'Équilibre entre numéros pairs/impairs et hauts/bas',
        best_for: 'Général'
      },
      {
        name: 'hot_numbers',
        description: 'Privilégie les numéros les plus fréquents',
        best_for: 'Suivre les tendances'
      },
      {
        name: 'cold_numbers',
        description: 'Privilégie les numéros les moins fréquents',
        best_for: 'Théorie du rattrapage'
      },
      {
        name: 'sum_optimized',
        description: 'Optimise la somme totale de la grille',
        best_for: 'Statistiques de somme'
      },
      {
        name: 'gap_analysis',
        description: 'Analyse les écarts entre numéros consécutifs',
        best_for: 'Patterns d\'écarts'
      },
      {
        name: 'random_balanced',
        description: 'Aléatoire avec contraintes d\'équilibre',
        best_for: 'Chance pure avec équilibre'
      }
    ];
    setStrategies(lottoStrategies);
  };

  const generateGrids = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const grids: GeneratedGrid[] = [];
      
      if (generationMode === 'single') {
        // Générer une seule grille avec la stratégie sélectionnée
        const grid = await generateGrid(selectedStrategy);
        grids.push(grid);
      } else {
        // Générer une grille pour chaque stratégie
        for (const strategy of strategies) {
          const grid = await generateGrid(strategy.name);
          grids.push(grid);
        }
      }
      
      setGeneratedGrids(grids);
    } catch (err) {
      setError('Erreur lors de la génération des grilles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateGrid = async (strategy: string): Promise<GeneratedGrid> => {
    const stats = await localDataManager.getLotoStats();
    const numbers = stats.numbers || [];
    
    let selectedNumbers: number[] = [];
    let confidence = 0.5;
    let patterns_used: any = {};

    switch (strategy) {
      case 'balanced':
        selectedNumbers = generateBalancedGrid(numbers);
        confidence = 0.7;
        patterns_used = { type: 'balanced', pairs: 3, odds: 3, high: 3, low: 3 };
        break;
        
      case 'hot_numbers':
        selectedNumbers = generateHotNumbersGrid(numbers);
        confidence = 0.6;
        patterns_used = { type: 'hot_numbers', top_frequency: true };
        break;
        
      case 'cold_numbers':
        selectedNumbers = generateColdNumbersGrid(numbers);
        confidence = 0.4;
        patterns_used = { type: 'cold_numbers', low_frequency: true };
        break;
        
      case 'sum_optimized':
        selectedNumbers = generateSumOptimizedGrid(numbers);
        confidence = 0.65;
        patterns_used = { type: 'sum_optimized', target_sum: 135 };
        break;
        
      case 'gap_analysis':
        selectedNumbers = generateGapAnalysisGrid(numbers);
        confidence = 0.55;
        patterns_used = { type: 'gap_analysis', optimal_gaps: true };
        break;
        
      case 'random_balanced':
        selectedNumbers = generateRandomBalancedGrid(numbers);
        confidence = 0.5;
        patterns_used = { type: 'random_balanced', constraints: true };
        break;
        
      default:
        selectedNumbers = generateBalancedGrid(numbers);
        confidence = 0.5;
        patterns_used = { type: 'default' };
    }

    return {
      numbers: selectedNumbers.sort((a, b) => a - b),
      strategy,
      confidence,
      patterns_used
    };
  };

  const generateBalancedGrid = (numbers: any[]): number[] => {
    const selected: number[] = [];
    const pairs = numbers.filter(n => n.numero % 2 === 0);
    const odds = numbers.filter(n => n.numero % 2 === 1);
    const high = numbers.filter(n => n.numero > 22);
    const low = numbers.filter(n => n.numero <= 22);

    // Sélectionner 3 pairs et 3 impairs
    const selectedPairs = getRandomSubset(pairs, 3);
    const selectedOdds = getRandomSubset(odds, 3);

    selected.push(...selectedPairs.map(n => n.numero));
    selected.push(...selectedOdds.map(n => n.numero));

    return selected;
  };

  const generateHotNumbersGrid = (numbers: any[]): number[] => {
    const sortedByFrequency = [...numbers].sort((a, b) => b.count - a.count);
    const topNumbers = sortedByFrequency.slice(0, 20); // Top 20
    return getRandomSubset(topNumbers, 6).map(n => n.numero);
  };

  const generateColdNumbersGrid = (numbers: any[]): number[] => {
    const sortedByFrequency = [...numbers].sort((a, b) => a.count - b.count);
    const bottomNumbers = sortedByFrequency.slice(0, 20); // Bottom 20
    return getRandomSubset(bottomNumbers, 6).map(n => n.numero);
  };

  const generateSumOptimizedGrid = (numbers: any[]): number[] => {
    const targetSum = 135; // Somme moyenne optimale pour 6 numéros parmi 45
    let bestGrid: number[] = [];
    let bestDiff = Infinity;

    // Essayer plusieurs combinaisons
    for (let attempt = 0; attempt < 100; attempt++) {
      const grid = getRandomSubset(numbers, 6).map(n => n.numero);
      const sum = grid.reduce((a, b) => a + b, 0);
      const diff = Math.abs(sum - targetSum);
      
      if (diff < bestDiff) {
        bestDiff = diff;
        bestGrid = grid;
      }
    }

    return bestGrid;
  };

  const generateGapAnalysisGrid = (numbers: any[]): number[] => {
    const selected: number[] = [];
    const allNumbers = numbers.map(n => n.numero);
    
    // Commencer par un numéro aléatoire
    const start = allNumbers[Math.floor(Math.random() * allNumbers.length)];
    selected.push(start);
    
    // Ajouter des numéros avec des écarts optimaux
    while (selected.length < 6) {
      const lastNum = selected[selected.length - 1];
      const candidates = allNumbers.filter(n => !selected.includes(n));
      
      // Préférer les écarts entre 3 et 8
      const goodGaps = candidates.filter(n => {
        const gap = Math.abs(n - lastNum);
        return gap >= 3 && gap <= 8;
      });
      
      const nextNum = goodGaps.length > 0 
        ? goodGaps[Math.floor(Math.random() * goodGaps.length)]
        : candidates[Math.floor(Math.random() * candidates.length)];
      
      selected.push(nextNum);
    }

    return selected;
  };

  const generateRandomBalancedGrid = (numbers: any[]): number[] => {
    const selected: number[] = [];
    const allNumbers = numbers.map(n => n.numero);
    
    // Contraintes: au moins 2 pairs et 2 impairs, au moins 2 hauts et 2 bas
    const pairs = allNumbers.filter(n => n % 2 === 0);
    const odds = allNumbers.filter(n => n % 2 === 1);
    const high = allNumbers.filter(n => n > 22);
    const low = allNumbers.filter(n => n <= 22);
    
    // Sélectionner au moins 2 de chaque catégorie
    const selectedPairs = getRandomSubset(pairs, 2);
    const selectedOdds = getRandomSubset(odds, 2);
    const selectedHigh = getRandomSubset(high, 2);
    const selectedLow = getRandomSubset(low, 2);
    
    selected.push(...selectedPairs, ...selectedOdds, ...selectedHigh, ...selectedLow);
    
    // Ajouter 2 numéros aléatoires supplémentaires
    const remaining = allNumbers.filter(n => !selected.includes(n));
    const extra = getRandomSubset(remaining, 2);
    selected.push(...extra);
    
    return selected.slice(0, 6); // S'assurer qu'on a exactement 6 numéros
  };

  const getRandomSubset = (array: any[], count: number): any[] => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const analyzeCustomGrid = async () => {
    try {
      const numbers = customGrid.numbers.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
      
      if (numbers.length !== 6) {
        setError('Veuillez entrer exactement 6 numéros (1-45)');
        return;
      }
      
      if (numbers.some(n => n < 1 || n > 45)) {
        setError('Les numéros doivent être entre 1 et 45');
        return;
      }
      
      if (new Set(numbers).size !== numbers.length) {
        setError('Les numéros doivent être uniques');
        return;
      }
      
      const analysis = analyzeGrid(numbers);
      setGridAnalysis(analysis);
      setError(null);
    } catch (err) {
      setError('Erreur lors de l\'analyse de la grille');
      console.error(err);
    }
  };

  const analyzeGrid = (numbers: number[]) => {
    const sorted = [...numbers].sort((a, b) => a - b);
    const sum = numbers.reduce((a, b) => a + b, 0);
    const pairs = numbers.filter(n => n % 2 === 0).length;
    const odds = numbers.filter(n => n % 2 === 1).length;
    const high = numbers.filter(n => n > 22).length;
    const low = numbers.filter(n => n <= 22).length;
    
    // Calculer les écarts
    const gaps = [];
    for (let i = 1; i < sorted.length; i++) {
      gaps.push(sorted[i] - sorted[i-1]);
    }
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    
    return {
      numbers: sorted,
      sum,
      pairs,
      odds,
      high,
      low,
      gaps,
      avgGap,
      analysis: {
        balance: pairs === 3 && odds === 3 ? 'Parfait' : pairs === 2 && odds === 4 ? 'Bon' : 'Déséquilibré',
        distribution: high === 3 && low === 3 ? 'Parfait' : high === 2 && low === 4 ? 'Bon' : 'Déséquilibré',
        sum_quality: sum >= 120 && sum <= 150 ? 'Optimal' : sum >= 100 && sum <= 170 ? 'Bon' : 'Extrême',
        gap_quality: avgGap >= 4 && avgGap <= 12 ? 'Bon' : 'Extrême'
      }
    };
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
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">🎰 Générateur Avancé - Lotto</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Sélection de stratégie */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">📊 Stratégie de Génération</h3>
              <select
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                {strategies.map(strategy => (
                  <option key={strategy.name} value={strategy.name}>
                    {strategy.description}
                  </option>
                ))}
              </select>
              
              {strategies.find(s => s.name === selectedStrategy) && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Idéal pour :</strong> {strategies.find(s => s.name === selectedStrategy)?.best_for}
                  </p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">🎯 Mode de Génération</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de génération
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="single"
                        checked={generationMode === 'single'}
                        onChange={(e) => setGenerationMode(e.target.value as 'single' | 'all')}
                        className="mr-2"
                      />
                      <span className="text-sm">Une grille avec la stratégie sélectionnée</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="all"
                        checked={generationMode === 'all'}
                        onChange={(e) => setGenerationMode(e.target.value as 'single' | 'all')}
                        className="mr-2"
                      />
                      <span className="text-sm">Une grille par stratégie (comparaison)</span>
                    </label>
                  </div>
                </div>
                
                <button
                  onClick={generateGrids}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {loading ? '🔄 Génération...' : generationMode === 'single' ? '🎲 Générer une Grille' : '🎲 Générer Toutes les Stratégies'}
                </button>
              </div>
            </div>
          </div>

          {/* Grilles générées */}
          {generatedGrids.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                🎰 Grilles Générées
                {generatedGrids.length > 0 && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({generatedGrids.length} grille{generatedGrids.length > 1 ? 's' : ''})
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedGrids.map((grid, index) => {
                  const strategy = strategies.find(s => s.name === grid.strategy);
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <span className="font-semibold text-gray-800">
                            {generationMode === 'all' ? strategy?.description : `Grille ${index + 1}`}
                          </span>
                          {generationMode === 'all' && (
                            <div className="text-xs text-gray-500 mt-1">
                              Stratégie: {strategy?.name}
                            </div>
                          )}
                        </div>
                        <span className={`text-sm px-2 py-1 rounded ${formatConfidence(grid.confidence || 0).color}`}>
                          {formatConfidence(grid.confidence || 0).text}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {grid.numbers.map((num, numIndex) => (
                          <div
                            key={numIndex}
                            className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold"
                          >
                            {num.toString().padStart(2, '0')}
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-xs text-gray-600 space-y-1">
                        <p><strong>Somme :</strong> {grid.numbers.reduce((a, b) => a + b, 0)}</p>
                        <p><strong>Pairs/Impairs :</strong> {grid.numbers.filter(n => n % 2 === 0).length}/{grid.numbers.filter(n => n % 2 === 1).length}</p>
                        <p><strong>Hauts/Bas :</strong> {grid.numbers.filter(n => n > 22).length}/{grid.numbers.filter(n => n <= 22).length}</p>
                        {generationMode === 'single' && (
                          <p><strong>Stratégie :</strong> {strategy?.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Analyse de grille personnalisée */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold mb-4">🔍 Analyser une Grille Personnalisée</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéros (séparés par des virgules, ex: 1,15,23,28,35,42)
                </label>
                <input
                  type="text"
                  value={customGrid.numbers}
                  onChange={(e) => setCustomGrid({ ...customGrid, numbers: e.target.value })}
                  placeholder="1,15,23,28,35,42"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={analyzeCustomGrid}
                  className="mt-3 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                >
                  🔍 Analyser
                </button>
              </div>

              {gridAnalysis && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">📊 Analyse de la Grille</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Numéros :</strong> {gridAnalysis.numbers.join(', ')}</p>
                    <p><strong>Somme :</strong> {gridAnalysis.sum}</p>
                    <p><strong>Pairs/Impairs :</strong> {gridAnalysis.pairs}/{gridAnalysis.odds}</p>
                    <p><strong>Hauts/Bas :</strong> {gridAnalysis.high}/{gridAnalysis.low}</p>
                    <p><strong>Écart moyen :</strong> {gridAnalysis.avgGap.toFixed(1)}</p>
                    
                    <div className="mt-3 space-y-1">
                      <p><strong>Équilibre :</strong> <span className="text-blue-600">{gridAnalysis.analysis.balance}</span></p>
                      <p><strong>Distribution :</strong> <span className="text-blue-600">{gridAnalysis.analysis.distribution}</span></p>
                      <p><strong>Qualité somme :</strong> <span className="text-blue-600">{gridAnalysis.analysis.sum_quality}</span></p>
                      <p><strong>Qualité écarts :</strong> <span className="text-blue-600">{gridAnalysis.analysis.gap_quality}</span></p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LottoAdvancedGenerator; 