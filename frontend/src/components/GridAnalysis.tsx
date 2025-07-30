import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface GridAnalysisProps {
  grid: number[];
  gameType: 'euromillions' | 'lotto';
  onClose: () => void;
}

interface AnalysisData {
  grid: {
    numbers: number[];
    stars: number[];
  };
  total_draws: number;
  combinations: {
    exact_match: number;
    five_numbers: number;
    four_numbers: number;
    three_numbers: number;
    two_numbers: number;
    one_number: number;
    two_stars: number;
    one_star: number;
    five_numbers_one_star: number;
    four_numbers_two_stars: number;
    four_numbers_one_star: number;
    three_numbers_two_stars: number;
    three_numbers_one_star: number;
    two_numbers_two_stars: number;
    two_numbers_one_star: number;
    one_number_two_stars: number;
    one_number_one_star: number;
  };
  probabilities: Record<string, {
    count: number;
    percentage: number;
    frequency: string;
  }>;
  number_frequency: Record<number, {
    count: number;
    percentage: number;
  }>;
  star_frequency: Record<number, {
    count: number;
    percentage: number;
  }>;
}

const GridAnalysis: React.FC<GridAnalysisProps> = ({ grid, gameType, onClose }) => {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyzeGrid();
  }, [grid]);

  const analyzeGrid = async () => {
    try {
      setLoading(true);
      setError(null);

      // Générer des étoiles aléatoires pour Euromillions
      const stars = gameType === 'euromillions' ? generateRandomStars() : [];
      
      const gridData = {
        numbers: grid,
        stars: stars
      };

      const response = await axios.post(`http://localhost:8000/api/${gameType}/analyze-grid`, gridData);
      setAnalysis(response.data);
    } catch (err) {
      setError('Erreur lors de l\'analyse de la grille');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomStars = (): number[] => {
    const stars: number[] = [];
    while (stars.length < 2) {
      const random = Math.floor(Math.random() * 12) + 1;
      if (!stars.includes(random)) {
        stars.push(random);
      }
    }
    return stars.sort((a, b) => a - b);
  };

  const getCombinationLabel = (key: string): string => {
    const labels: Record<string, string> = {
      exact_match: "🎯 Combinaison exacte (5 numéros + 2 étoiles)",
      five_numbers_one_star: "5 numéros + 1 étoile",
      five_numbers: "5 numéros",
      four_numbers_two_stars: "4 numéros + 2 étoiles",
      four_numbers_one_star: "4 numéros + 1 étoile",
      four_numbers: "4 numéros",
      three_numbers_two_stars: "3 numéros + 2 étoiles",
      three_numbers_one_star: "3 numéros + 1 étoile",
      three_numbers: "3 numéros",
      two_numbers_two_stars: "2 numéros + 2 étoiles",
      two_numbers_one_star: "2 numéros + 1 étoile",
      two_numbers: "2 numéros",
      one_number_two_stars: "1 numéro + 2 étoiles",
      one_number_one_star: "1 numéro + 1 étoile",
      one_number: "1 numéro",
      two_stars: "2 étoiles",
      one_star: "1 étoile"
    };
    return labels[key] || key;
  };

  const getColorClass = (percentage: number): string => {
    if (percentage > 5) return 'text-green-600 bg-green-50';
    if (percentage > 2) return 'text-blue-600 bg-blue-50';
    if (percentage > 0.5) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="text-center text-red-600">
            <h2 className="text-xl font-bold mb-4">Erreur</h2>
            <p>{error}</p>
            <button 
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl max-h-[90vh] overflow-y-auto w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-800">
            📊 Analyse de la Grille
          </h1>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        {/* Grille analysée */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">🎯 Grille analysée</h2>
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-2">
              <span className="text-sm text-gray-600">Numéros:</span>
              {analysis.grid.numbers.map((num, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                  {num}
                </span>
              ))}
            </div>
            {gameType === 'euromillions' && (
              <div className="flex gap-2">
                <span className="text-sm text-gray-600">Étoiles:</span>
                {analysis.grid.stars.map((star, index) => (
                  <span key={index} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">
                    ⭐ {star}
                  </span>
                ))}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Basé sur {analysis.total_draws.toLocaleString()} tirages historiques
          </p>
        </div>

        {/* Fréquence des numéros */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">📈 Fréquence des numéros</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {analysis.grid.numbers.map((num) => (
              <div key={num} className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-blue-600">#{num}</div>
                <div className="text-sm text-gray-600">
                  {analysis.number_frequency[num]?.count || 0} fois
                </div>
                <div className="text-xs text-gray-500">
                  {analysis.number_frequency[num]?.percentage.toFixed(1) || 0}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fréquence des étoiles */}
        {gameType === 'euromillions' && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">⭐ Fréquence des étoiles</h2>
            <div className="grid grid-cols-2 gap-3">
              {analysis.grid.stars.map((star) => (
                <div key={star} className="bg-yellow-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-yellow-600">⭐ {star}</div>
                  <div className="text-sm text-gray-600">
                    {analysis.star_frequency[star]?.count || 0} fois
                  </div>
                  <div className="text-xs text-gray-500">
                    {analysis.star_frequency[star]?.percentage.toFixed(1) || 0}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Combinaisons possibles */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">🎲 Combinaisons possibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analysis.combinations)
              .filter(([key, count]) => count > 0)
              .sort(([,a], [,b]) => b - a)
              .map(([key, count]) => {
                const prob = analysis.probabilities[key];
                return (
                  <div key={key} className={`rounded-lg p-4 ${getColorClass(prob.percentage)}`}>
                    <div className="font-semibold mb-1">{getCombinationLabel(key)}</div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm">
                      {prob.percentage.toFixed(3)}% • {prob.frequency}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Résumé des probabilités */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">📊 Résumé des probabilités</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analysis.combinations.exact_match}
              </div>
              <div className="text-sm text-gray-600">Combinaisons exactes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analysis.combinations.five_numbers + analysis.combinations.five_numbers_one_star}
              </div>
              <div className="text-sm text-gray-600">5 numéros corrects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {analysis.combinations.four_numbers + analysis.combinations.four_numbers_one_star + analysis.combinations.four_numbers_two_stars}
              </div>
              <div className="text-sm text-gray-600">4 numéros corrects</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GridAnalysis; 