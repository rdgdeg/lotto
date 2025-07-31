import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HelpModal from '../components/HelpModal';
import StrategyGuide from '../components/StrategyGuide';
import ContextualHelp from '../components/ContextualHelp';
import MainContent from '../components/MainContent';
import TestLocalData from '../components/TestLocalData';
import DataExportImport from '../components/DataExportImport';

const Home: React.FC = () => {
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showStrategyGuide, setShowStrategyGuide] = useState<boolean>(false);
  const [showContextualHelp, setShowContextualHelp] = useState<boolean>(false);
  const [showTestData, setShowTestData] = useState<boolean>(false);
  const [showExportImport, setShowExportImport] = useState<boolean>(false);

  return (
    <MainContent>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Animated Logo */}
            <div className="mb-8 animate-fade-in-up">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl shadow-2xl mb-6">
                <span className="text-4xl">🎰</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Lotto Generator
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              Générateur intelligent de grilles avec analyse statistique avancée et intelligence artificielle
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <button
                onClick={() => setShowHelp(true)}
                className="btn-primary bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30"
              >
                ❓ Guide Complet
              </button>
              <button
                onClick={() => setShowStrategyGuide(true)}
                className="btn-secondary bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white"
              >
                📖 Stratégies Avancées
              </button>
              <button
                onClick={() => setShowContextualHelp(true)}
                className="btn-success bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white"
              >
                💡 Conseils IA
              </button>
              <button
                onClick={() => setShowTestData(true)}
                className="btn-warning bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white"
              >
                🧪 Test Données
              </button>
              <button
                onClick={() => setShowExportImport(true)}
                className="btn-info bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white"
              >
                📁 Export/Import
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              🚀 Fonctionnalités Avancées
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez nos outils intelligents pour optimiser vos chances de gagner
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Feature Card 1 */}
            <div className="card group">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">IA Avancée</h3>
                <p className="text-gray-600">
                  Algorithmes d'intelligence artificielle pour analyser les tendances et générer des grilles optimisées
                </p>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="card group">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Statistiques Détaillées</h3>
                <p className="text-gray-600">
                  Analyses complètes des numéros les plus fréquents, patterns et corrélations historiques
                </p>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="card group">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Stratégies Personnalisées</h3>
                <p className="text-gray-600">
                  Recommandations personnalisées basées sur vos préférences et l'historique des tirages
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Selector */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              🎯 Sélectionnez votre application
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choisissez le type de jeu pour lequel vous souhaitez générer des grilles optimisées
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Euromillions Card */}
            <div className="card group overflow-hidden">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                <div className="relative text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🎰</div>
                  <h2 className="text-3xl font-bold text-white mb-3">Euromillions</h2>
                  <p className="text-blue-100 text-lg">5 numéros (1-50) + 2 étoiles (1-12)</p>
                </div>
              </div>
              <div className="p-8">
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Génération de grilles IA</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Analyse statistique avancée</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Saisie manuelle des tirages</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Recherche historique complète</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Stratégies personnalisées</span>
                  </div>
                </div>
                <Link
                  to="/euromillions"
                  className="w-full btn-primary bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-center block"
                >
                  🚀 Lancer Euromillions
                </Link>
              </div>
            </div>

            {/* Lotto Card */}
            <div className="card group overflow-hidden">
              <div className="bg-gradient-to-br from-green-600 to-green-700 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                <div className="relative text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🍀</div>
                  <h2 className="text-3xl font-bold text-white mb-3">Lotto</h2>
                  <p className="text-green-100 text-lg">6 numéros (1-49) + 1 numéro chance (1-10)</p>
                </div>
              </div>
              <div className="p-8">
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Génération de grilles IA</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Analyse statistique avancée</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Saisie manuelle des tirages</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Recherche historique complète</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Stratégies personnalisées</span>
                  </div>
                </div>
                <Link
                  to="/lotto"
                  className="w-full btn-success bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-center block"
                >
                  🚀 Lancer Lotto
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">📈 Statistiques Impressionnantes</h2>
            <p className="text-xl text-gray-300">Notre plateforme en chiffres</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">10K+</div>
              <div className="text-gray-300">Grilles générées</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">5K+</div>
              <div className="text-gray-300">Utilisateurs actifs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">99.9%</div>
              <div className="text-gray-300">Précision IA</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">24/7</div>
              <div className="text-gray-300">Disponibilité</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">
            © 2024 Lotto Generator - Propulsé par l'Intelligence Artificielle
          </p>
        </div>
      </div>

      {/* Modals */}
      {showHelp && <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />}
      {showStrategyGuide && <StrategyGuide isOpen={showStrategyGuide} onClose={() => setShowStrategyGuide(false)} />}
      {showContextualHelp && (
        <ContextualHelp 
          isOpen={showContextualHelp} 
          onClose={() => setShowContextualHelp(false)}
          title="Conseils d'utilisation"
          content={
            <div className="space-y-4">
              <p>Voici quelques conseils pour bien utiliser l'application :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Commencez par explorer les statistiques pour comprendre les tendances</li>
                <li>Testez différentes stratégies de génération</li>
                <li>Utilisez la saisie manuelle pour enregistrer vos propres tirages</li>
                <li>Consultez le guide complet pour des explications détaillées</li>
                <li>N'oubliez pas que le hasard reste le facteur principal</li>
              </ul>
            </div>
          }
        />
      )}
      
      {/* Modal de test des données locales */}
      {showTestData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">🧪 Test des Données Locales</h2>
              <button
                onClick={() => setShowTestData(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <TestLocalData />
            </div>
          </div>
        </div>
      )}

      {/* Modal d'export/import */}
      {showExportImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">📁 Export/Import des Données</h2>
              <button
                onClick={() => setShowExportImport(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <DataExportImport />
            </div>
          </div>
        </div>
      )}
    </MainContent>
  );
};

export default Home; 