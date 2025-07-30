import React from 'react';

interface DetailedHelpGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const DetailedHelpGuide: React.FC<DetailedHelpGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">📚 Guide Complet des Stratégies</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Stratégies de Génération */}
          <section>
            <h3 className="text-xl font-semibold text-blue-600 mb-3">🎯 Stratégies de Génération</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">🎲 Génération Aléatoire</h4>
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
                  <strong>Quand l'utiliser :</strong> Pour des tirages purement aléatoires, quand vous voulez éviter tout biais
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">📊 Génération Statistique</h4>
                <p className="text-gray-700 mb-2">
                  <strong>Principe :</strong> Privilégie les numéros les plus fréquents dans l'historique
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Avantages :</strong> Respecte les tendances historiques, numéros "chauds"
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Inconvénients :</strong> Peut ignorer les numéros "froids" qui pourraient sortir
                </p>
                <p className="text-gray-600">
                  <strong>Quand l'utiliser :</strong> Quand vous croyez aux tendances et aux numéros qui "doivent" sortir
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">⚖️ Génération Équilibrée</h4>
                <p className="text-gray-700 mb-2">
                  <strong>Principe :</strong> Mélange de numéros chauds et froids pour optimiser les chances
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Avantages :</strong> Équilibre entre tendances et équiprobabilité
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Inconvénients :</strong> Stratégie intermédiaire, moins "pure" que les autres
                </p>
                <p className="text-gray-600">
                  <strong>Quand l'utiliser :</strong> Pour une approche pragmatique, quand vous voulez couvrir tous les cas
                </p>
              </div>
            </div>
          </section>

          {/* Paramètres de Génération */}
          <section>
            <h3 className="text-xl font-semibold text-orange-600 mb-3">⚙️ Paramètres de Génération</h3>
            
            <div className="space-y-3">
              <div className="bg-orange-50 p-3 rounded-lg">
                <h4 className="font-semibold text-orange-800">Nombre de Grilles</h4>
                <p className="text-gray-600">Détermine combien de combinaisons seront générées. Plus vous en générez, plus vous avez de chances, mais plus c'est coûteux.</p>
              </div>

              <div className="bg-orange-50 p-3 rounded-lg">
                <h4 className="font-semibold text-orange-800">Poids Statistique</h4>
                <p className="text-gray-600">Dans la génération statistique, détermine à quel point les numéros fréquents sont favorisés (0-100%).</p>
              </div>

              <div className="bg-orange-50 p-3 rounded-lg">
                <h4 className="font-semibold text-orange-800">Période d'Analyse</h4>
                <p className="text-gray-600">Sur combien de tirages passés baser les statistiques (derniers mois, année, etc.).</p>
              </div>
            </div>
          </section>

          {/* Interprétation des Statistiques */}
          <section>
            <h3 className="text-xl font-semibold text-red-600 mb-3">📈 Interprétation des Statistiques</h3>
            
            <div className="space-y-3">
              <div className="bg-red-50 p-3 rounded-lg">
                <h4 className="font-semibold text-red-800">Numéros Chauds (&gt;20%)</h4>
                <p className="text-gray-600">Numéros qui sortent très fréquemment. Peuvent être "usés" ou au contraire dans une série gagnante.</p>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <h4 className="font-semibold text-yellow-800">Numéros Équilibrés (10-20%)</h4>
                <p className="text-gray-600">Fréquence normale, bonne stabilité statistique. Souvent un bon choix.</p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-semibold text-blue-800">Numéros Froids (&lt;10%)</h4>
                <p className="text-gray-600">Numéros qui sortent rarement. Peuvent être "en retard" et prêts à sortir.</p>
              </div>
            </div>
          </section>

          {/* Conseils Généraux */}
          <section>
            <h3 className="text-xl font-semibold text-green-600 mb-3">💡 Conseils Généraux</h3>
            
            <div className="bg-green-50 p-4 rounded-lg space-y-3">
              <div className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <p className="text-gray-700">Diversifiez vos stratégies : ne misez pas tout sur une seule approche</p>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <p className="text-gray-700">Analysez régulièrement les nouvelles statistiques</p>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <p className="text-gray-700">Gardez à l'esprit que le hasard reste le facteur principal</p>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <p className="text-gray-700">Ne dépensez que ce que vous pouvez vous permettre de perdre</p>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <p className="text-gray-700">Considérez le loto comme un divertissement, pas un investissement</p>
              </div>
            </div>
          </section>

          {/* Avertissement */}
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
                    Ce guide est fourni à titre informatif uniquement.
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

export default DetailedHelpGuide; 