import React, { useState } from 'react';

interface UnifiedHelpGuideProps {
  onClose: () => void;
  gameType: 'euromillions' | 'lotto';
}

const UnifiedHelpGuide: React.FC<UnifiedHelpGuideProps> = ({ onClose, gameType }) => {
  const [activeSection, setActiveSection] = useState('guide');

  const sections = [
    { id: 'guide', label: '📚 Guide Complet', icon: '📚' },
    { id: 'tutorial', label: '🎓 Tutoriel', icon: '🎓' },
    { id: 'tips', label: '💡 Conseils', icon: '💡' },
    { id: 'faq', label: '❓ FAQ', icon: '❓' }
  ];

  const gameInfo = {
    euromillions: {
      name: 'Euromillions',
      numbers: '5 numéros de 1 à 50',
      stars: '2 étoiles de 1 à 12',
      description: 'Jeu européen avec jackpot record'
    },
    lotto: {
      name: 'Lotto',
      numbers: '6 numéros de 1 à 49',
      stars: '1 numéro chance de 1 à 10',
      description: 'Jeu français classique'
    }
  };

  const currentGame = gameInfo[gameType];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">🎰 {currentGame.name} - Centre d'Aide</h1>
              <p className="text-blue-100 mt-2">Guide complet, tutoriel et conseils pour optimiser vos chances</p>
            </div>
            <button
              onClick={onClose}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ✕ Fermer
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-gray-50 border-b">
          <div className="flex flex-wrap gap-2 p-4">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {section.icon} {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === 'guide' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <h2 className="text-xl font-semibold text-blue-800 mb-2">🎯 Comment jouer au {currentGame.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-blue-700 mb-2">Numéros principaux</h3>
                    <p className="text-blue-600">{currentGame.numbers}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-700 mb-2">Numéros secondaires</h3>
                    <p className="text-blue-600">{currentGame.stars}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🎲 Générateur de Grilles</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• <strong>Génération simple :</strong> Grilles aléatoires classiques</li>
                    <li>• <strong>Génération avancée :</strong> Basée sur les statistiques</li>
                    <li>• <strong>Stratégies multiples :</strong> Fréquence, patterns, chaud/froid</li>
                    <li>• <strong>Analyse personnalisée :</strong> Évaluez vos propres grilles</li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Statistiques Avancées</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• <strong>Fréquences :</strong> Numéros les plus/moins sortis</li>
                    <li>• <strong>Combinaisons :</strong> Paires et triplets fréquents</li>
                    <li>• <strong>Patterns :</strong> Pairs/impairs, hauts/bas</li>
                    <li>• <strong>Analyse temporelle :</strong> Tendances récentes</li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-3">✅ Bonnes Pratiques</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">🎯 Diversification</h4>
                    <p className="text-green-600 text-sm">Mélangez numéros pairs/impairs et hauts/bas</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">📈 Statistiques</h4>
                    <p className="text-green-600 text-sm">Utilisez les données historiques pour guider vos choix</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">🎲 Modération</h4>
                    <p className="text-green-600 text-sm">Jouez de manière responsable et dans vos moyens</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'tutorial' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-purple-800 mb-4">🎓 Tutoriel Pas à Pas</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</div>
                    <div>
                      <h3 className="font-semibold text-purple-700">Générer vos premières grilles</h3>
                      <p className="text-purple-600">Cliquez sur "Générer" pour créer des grilles aléatoires. Commencez par 3-5 grilles pour vous familiariser.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</div>
                    <div>
                      <h3 className="font-semibold text-purple-700">Explorer les statistiques</h3>
                      <p className="text-purple-600">Consultez les "Stats Avancées" pour comprendre les tendances et patterns historiques.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</div>
                    <div>
                      <h3 className="font-semibold text-purple-700">Utiliser le générateur avancé</h3>
                      <p className="text-purple-600">Testez différentes stratégies : fréquence, patterns, analyse chaud/froid.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">4</div>
                    <div>
                      <h3 className="font-semibold text-purple-700">Analyser vos grilles</h3>
                      <p className="text-purple-600">Entrez vos numéros personnels pour obtenir une analyse détaillée et des conseils.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Interface Principale</h3>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600">🎲</span>
                      <span><strong>Générateur :</strong> Créez vos grilles</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">📊</span>
                      <span><strong>Statistiques :</strong> Analysez les tendances</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-600">📅</span>
                      <span><strong>Historique :</strong> Consultez les tirages</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-orange-600">✏️</span>
                      <span><strong>Saisie :</strong> Entrez vos numéros</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">⚡ Fonctionnalités Avancées</h3>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600">🔥</span>
                      <span><strong>Stats Avancées :</strong> Analyses détaillées</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-600">⚡</span>
                      <span><strong>Générateur Avancé :</strong> Stratégies multiples</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600">🔍</span>
                      <span><strong>Recherche :</strong> Trouvez des numéros</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">📈</span>
                      <span><strong>Analyses :</strong> Évaluez vos grilles</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'tips' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-yellow-800 mb-4">💡 Conseils d'Expert</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-yellow-700 mb-3">🎯 Stratégies de Sélection</h3>
                    <ul className="space-y-2 text-yellow-600">
                      <li>• <strong>Équilibre :</strong> Mélangez pairs et impairs</li>
                      <li>• <strong>Répartition :</strong> Numéros hauts et bas</li>
                      <li>• <strong>Somme :</strong> Évitez les extrêmes</li>
                      <li>• <strong>Écarts :</strong> Variez les différences</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-yellow-700 mb-3">📊 Utilisation des Stats</h3>
                    <ul className="space-y-2 text-yellow-600">
                      <li>• <strong>Fréquences :</strong> Privilégiez les numéros moyens</li>
                      <li>• <strong>Combinaisons :</strong> Incluez des paires fréquentes</li>
                      <li>• <strong>Patterns :</strong> Respectez les tendances</li>
                      <li>• <strong>Temporalité :</strong> Considérez les cycles</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-2xl mb-2">🎲</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Génération Intelligente</h3>
                  <p className="text-gray-600 text-sm">Utilisez le générateur avancé avec différentes stratégies pour maximiser vos chances.</p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-2xl mb-2">📈</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Analyse Continue</h3>
                  <p className="text-gray-600 text-sm">Suivez régulièrement les statistiques pour adapter vos stratégies.</p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-2xl mb-2">🎯</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Persévérance</h3>
                  <p className="text-gray-600 text-sm">La régularité et la patience sont clés dans les jeux de hasard.</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-3">⚠️ Points d'Attention</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">🎲 Hasard</h4>
                    <p className="text-red-600 text-sm">Aucune stratégie ne garantit la victoire. Le hasard reste le facteur principal.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">💰 Responsabilité</h4>
                    <p className="text-red-600 text-sm">Jouez uniquement avec l'argent que vous pouvez vous permettre de perdre.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'faq' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">❓ Questions Fréquentes</h2>
              
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">🤔 Comment fonctionne le générateur avancé ?</h3>
                  <p className="text-gray-600">Le générateur utilise des algorithmes basés sur les statistiques historiques pour créer des grilles optimisées selon différentes stratégies (fréquence, patterns, analyse chaud/froid).</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">📊 Les statistiques garantissent-elles un gain ?</h3>
                  <p className="text-gray-600">Non, les statistiques améliorent seulement les probabilités. Le hasard reste le facteur principal dans les jeux de loterie.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">🎯 Quelle stratégie est la meilleure ?</h3>
                  <p className="text-gray-600">Il n'y a pas de stratégie "meilleure". Nous recommandons de tester différentes approches et de combiner plusieurs méthodes.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">📅 Les données sont-elles à jour ?</h3>
                  <p className="text-gray-600">Oui, nous mettons à jour régulièrement notre base de données avec les derniers tirages pour des analyses précises.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">💾 Mes grilles sont-elles sauvegardées ?</h3>
                  <p className="text-gray-600">Actuellement, les grilles ne sont pas sauvegardées automatiquement. Nous recommandons de noter vos sélections importantes.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">🔒 Mes données sont-elles sécurisées ?</h3>
                  <p className="text-gray-600">Oui, nous ne collectons aucune donnée personnelle. Toutes les analyses sont effectuées localement dans votre navigateur.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedHelpGuide; 