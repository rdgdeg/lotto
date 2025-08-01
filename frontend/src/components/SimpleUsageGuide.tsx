import React from 'react';

interface SimpleUsageGuideProps {
  onClose: () => void;
  isOpen: boolean;
}

const SimpleUsageGuide: React.FC<SimpleUsageGuideProps> = ({ onClose, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📖 Guide d'Utilisation Simple</h2>
            <p className="text-gray-600">Comment utiliser votre application Euromillions</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Étape 1 */}
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">🎯 Cliquez sur "Guide Simple"</h3>
                <p className="text-blue-700">
                  Le bouton principal "🎯 Guide Simple - Tout en un" vous donne accès à toutes les fonctionnalités 
                  dans une interface guidée et intuitive.
                </p>
              </div>
            </div>
          </div>

          {/* Étape 2 */}
          <div className="bg-green-50 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">📊 Explorez les statistiques</h3>
                <p className="text-green-700">
                  Dans le guide simple, vous pouvez naviguer entre 4 sections :
                </p>
                <ul className="text-green-700 mt-2 space-y-1">
                  <li>• <strong>Vue d'ensemble</strong> : Introduction et aperçu</li>
                  <li>• <strong>Numéros</strong> : Les plus et moins fréquents</li>
                  <li>• <strong>Prédictions</strong> : Numéros en retard et tendances</li>
                  <li>• <strong>Générateur</strong> : Créer votre grille optimisée</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Étape 3 */}
          <div className="bg-purple-50 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-800 mb-2">🎲 Générez votre grille</h3>
                <p className="text-purple-700">
                  Dans la section "Générateur", cliquez sur "🎲 Générer ma grille optimisée" 
                  pour obtenir une combinaison basée sur nos analyses statistiques.
                </p>
              </div>
            </div>
          </div>

          {/* Étape 4 */}
          <div className="bg-orange-50 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-800 mb-2">⚡ Fonctionnalités avancées (optionnel)</h3>
                <p className="text-orange-700">
                  Si vous voulez plus de détails, utilisez les boutons "📊 Expert" et "⚡ Générateur" 
                  pour des analyses plus approfondies.
                </p>
              </div>
            </div>
          </div>

          {/* Conseils */}
          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">💡 Conseils importants</h3>
            <ul className="text-yellow-700 space-y-2">
              <li>• <strong>Commencez simple</strong> : Utilisez d'abord le "Guide Simple"</li>
              <li>• <strong>Explorez progressivement</strong> : Passez aux fonctionnalités avancées quand vous êtes à l'aise</li>
              <li>• <strong>Jouez responsablement</strong> : L'Euromillions reste un jeu de hasard</li>
              <li>• <strong>Importez vos données</strong> : Pour des analyses plus précises, importez l'historique des tirages</li>
            </ul>
          </div>

          {/* Avertissement */}
          <div className="bg-red-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-3">⚠️ Avertissement</h3>
            <p className="text-red-700">
              Cette application fournit des analyses statistiques basées sur l'historique des tirages. 
              L'Euromillions reste un jeu de hasard et aucune garantie de gain n'est possible. 
              Jouez de manière responsable et ne dépensez que ce que vous pouvez vous permettre de perdre.
            </p>
          </div>
        </div>

        {/* Bouton de fermeture */}
        <div className="mt-8 text-center">
          <button
            onClick={onClose}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            J'ai compris, commençons !
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleUsageGuide; 