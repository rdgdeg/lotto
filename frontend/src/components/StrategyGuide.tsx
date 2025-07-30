import React from 'react';

interface StrategyGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const StrategyGuide: React.FC<StrategyGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">📖 Guide des Stratégies</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold text-blue-600 mb-3">🎲 Stratégie Aléatoire</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>Principe :</strong> Sélection complètement aléatoire des numéros
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Avantages :</strong> Équiprobabilité totale, aucune biais statistique
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Inconvénients :</strong> Peut générer des combinaisons très improbables
              </p>
              <p className="text-gray-600">
                <strong>Quand l'utiliser :</strong> Pour des tirages purement aléatoires
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-green-600 mb-3">📊 Stratégie Statistique</h3>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>Principe :</strong> Privilégie les numéros les plus fréquents
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Avantages :</strong> Respecte les tendances historiques
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Inconvénients :</strong> Peut ignorer les numéros "froids"
              </p>
              <p className="text-gray-600">
                <strong>Quand l'utiliser :</strong> Quand vous croyez aux tendances
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-purple-600 mb-3">⚖️ Stratégie Équilibrée</h3>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>Principe :</strong> Mélange de numéros chauds et froids
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Avantages :</strong> Équilibre entre tendances et équiprobabilité
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Inconvénients :</strong> Stratégie intermédiaire
              </p>
              <p className="text-gray-600">
                <strong>Quand l'utiliser :</strong> Pour une approche pragmatique
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-orange-600 mb-3">💡 Conseils Généraux</h3>
            <div className="bg-orange-50 p-4 rounded-lg space-y-2">
              <div className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                <p className="text-gray-700">Diversifiez vos stratégies</p>
              </div>
              <div className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                <p className="text-gray-700">Analysez régulièrement les statistiques</p>
              </div>
              <div className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                <p className="text-gray-700">Gardez à l'esprit que le hasard reste le facteur principal</p>
              </div>
            </div>
          </section>

          <section>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-600 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">Avertissement Important</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Aucune stratégie ne garantit de gagner au loto. Le hasard reste le facteur déterminant.
                  </p>
                </div>
              </div>
            </div>
          </section>
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

export default StrategyGuide; 