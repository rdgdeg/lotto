import React, { useState, useEffect, useMemo } from 'react';
import GridGenerator from '../components/GridGenerator';
import GridDisplay from '../components/GridDisplay';
import GridAnalysis from '../components/GridAnalysis';
import DetailedStatsVisualization from '../components/DetailedStatsVisualization';
import CompleteNumberStats from '../components/CompleteNumberStats';
import DetailedNumberStats from '../components/DetailedNumberStats';
import NumberStatisticsPage from '../components/NumberStatisticsPage';
import AnnualStatistics from '../components/AnnualStatistics';
import CompleteDrawHistory from '../components/CompleteDrawHistory';
import ManualDrawInput from '../components/ManualDrawInput';
import ImportCSV from '../components/ImportCSV';
import DataManagement from '../components/DataManagement';
import UnifiedHelpGuide from '../components/UnifiedHelpGuide';
import SimpleUsageGuide from '../components/SimpleUsageGuide';
import DailyDrawInput from '../components/DailyDrawInput';
import StatisticsUpdateNotification from '../components/StatisticsUpdateNotification';
import FileUploadWithValidation from '../components/FileUploadWithValidation';
import MultipleFileUpload from '../components/MultipleFileUpload';
import QuickNumberStats from '../components/QuickNumberStats';
import MainContent from '../components/MainContent';
import DataExport from '../components/DataExport';
import DataDiagnostic from '../components/DataDiagnostic';

const Lotto: React.FC = () => {
  const [grids, setGrids] = useState<number[][]>([]);
  const [selectedGridForAnalysis, setSelectedGridForAnalysis] = useState<number[] | null>(null);
  const [openedModal, setOpenedModal] = useState<string | null>(null);
  const [detailedStats, setDetailedStats] = useState<any>(null);
  const [showCompleteStats, setShowCompleteStats] = useState<boolean>(false);
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [showCompleteHistory, setShowCompleteHistory] = useState<boolean>(false);
  const [showAnnualStats, setShowAnnualStats] = useState<boolean>(false);
  const [showQuickStats, setShowQuickStats] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showDailyInput, setShowDailyInput] = useState<boolean>(false);
  const [showFileUpload, setShowFileUpload] = useState<boolean>(false);
  const [showMultipleFileUpload, setShowMultipleFileUpload] = useState<boolean>(false);
  const [showDataExport, setShowDataExport] = useState<boolean>(false);
  const [showDataDiagnostic, setShowDataDiagnostic] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    message: string;
    type: 'success' | 'info' | 'warning';
  }>({
    isVisible: false,
    message: '',
    type: 'info'
  });

  // Données de test pour les statistiques
  const mockStats = useMemo(() => ({
    top_numeros: [
      { numero: 7, frequence: 15, pourcentage: 25.5 },
      { numero: 12, frequence: 14, pourcentage: 23.8 },
      { numero: 23, frequence: 13, pourcentage: 22.1 },
      { numero: 34, frequence: 12, pourcentage: 20.4 },
      { numero: 45, frequence: 11, pourcentage: 18.7 }
    ],
    top_chance: [
      { numero: 3, frequence: 8, pourcentage: 13.6 },
      { numero: 8, frequence: 7, pourcentage: 11.9 },
      { numero: 1, frequence: 6, pourcentage: 10.2 },
      { numero: 9, frequence: 5, pourcentage: 8.5 },
      { numero: 5, frequence: 4, pourcentage: 6.8 }
    ]
  }), []);

  useEffect(() => {
    setDetailedStats(mockStats);
  }, [mockStats]);

  const handleGenerateGrids = (newGrids: number[][]) => {
    setGrids(newGrids);
  };

  const handleClearGrids = () => {
    setGrids([]);
  };

  const handleManualDrawSubmit = (drawData: any) => {
    console.log('Tirage manuel soumis:', drawData);
    alert('Tirage enregistré avec succès !');
  };

  const handleDailyInputSuccess = (message: string) => {
    console.log('Tirage ajouté:', message);
    setNotification({
      isVisible: true,
      message: `${message} - Les statistiques ont été mises à jour automatiquement !`,
      type: 'success'
    });
    setShowDailyInput(false);
  };

  const handleFileUploadSuccess = (message: string) => {
    console.log('Fichier importé:', message);
    setNotification({
      isVisible: true,
      message: `${message} - Les statistiques ont été mises à jour automatiquement !`,
      type: 'success'
    });
    setShowFileUpload(false);
  };

  const handleImportSuccess = (message: string) => {
    console.log('Import réussi:', message);
    setOpenedModal(null);
  };



  return (
    <MainContent>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            🍀
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Lotto</h1>
            <p className="text-gray-600 text-lg">Générateur et analyseur de grilles</p>
          </div>
        </div>

        {/* Navigation simplifiée */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setOpenedModal('help')}
              className="btn-lotto text-base px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              🎯 Guide Simple - Tout en un
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => setOpenedModal('usageGuide')}
                className="btn-info whitespace-nowrap flex-shrink-0 text-sm px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                📖 Comment utiliser ?
              </button>
              
              <button
                onClick={() => setOpenedModal('quickStats')}
                className="btn-lotto whitespace-nowrap flex-shrink-0 text-xs px-3 py-2"
              >
                📊 Stats Rapides
              </button>
              
              <button
                onClick={() => setOpenedModal('completeHistory')}
                className="btn-lotto whitespace-nowrap flex-shrink-0 text-xs px-3 py-2"
              >
                📅 Historique
              </button>
              
              <button
                onClick={() => setOpenedModal('help')}
                className="btn-info whitespace-nowrap flex-shrink-0 text-xs px-3 py-2"
              >
                ❓ Aide
              </button>
              
              <button
                onClick={() => setOpenedModal('dailyInput')}
                className="btn-info whitespace-nowrap flex-shrink-0 text-xs px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white"
              >
                ✏️ Ajout Quotidien
              </button>
              
              <button
                onClick={() => setShowFileUpload(true)}
                className="btn-info whitespace-nowrap flex-shrink-0 text-xs px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white"
              >
                📁 Upload Fichier
              </button>
              
              <button
                onClick={() => setShowMultipleFileUpload(true)}
                className="btn-info whitespace-nowrap flex-shrink-0 text-xs px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                📚 Upload Multiple
              </button>
              
              <button
                onClick={() => setShowDataExport(true)}
                className="btn-info whitespace-nowrap flex-shrink-0 text-xs px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white"
              >
                📥 Export Données
              </button>
              <button
                onClick={() => setShowDataDiagnostic(true)}
                className="btn-info whitespace-nowrap flex-shrink-0 text-xs px-3 py-2 bg-red-500 hover:bg-red-600 text-white"
              >
                🔍 Diagnostic
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto">
        {/* Section principale */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Générateur de grilles */}
          <div className="card animate-fade-in-up">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🎲</span>
                Générateur de Grilles
              </h2>
              <GridGenerator onGenerate={handleGenerateGrids} gameType="lotto" />
            </div>
          </div>

          {/* Affichage des grilles */}
          <div className="card animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="mr-2">📋</span>
                  Grilles Générées
                </h2>
                {grids.length > 0 && (
                  <button
                    onClick={handleClearGrids}
                    className="btn-danger text-sm px-3 py-1"
                  >
                    🗑️ Effacer
                  </button>
                )}
              </div>
              <GridDisplay 
                grids={grids} 
                gameType="lotto"
                onClear={handleClearGrids}
                onAnalyzeGrid={setSelectedGridForAnalysis}
              />
            </div>
          </div>
        </div>

        {/* Analyse de grilles */}
        {selectedGridForAnalysis && (
          <div className="card animate-fade-in-up mb-8" style={{animationDelay: '0.4s'}}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="mr-2">🔍</span>
                  Analyse de Grille
                </h2>
                <button
                  onClick={() => setSelectedGridForAnalysis(null)}
                  className="btn-danger text-sm px-3 py-1"
                >
                  ✕ Fermer
                </button>
              </div>
              <GridAnalysis 
                grid={selectedGridForAnalysis}
                gameType="lotto"
                onClose={() => setSelectedGridForAnalysis(null)}
              />
            </div>
          </div>
        )}



        {/* Section des statistiques */}
        {detailedStats && (
          <div className="card mb-8 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-2">📊</span>
                Statistiques Détaillées
              </h2>
              <DetailedStatsVisualization 
                stats={detailedStats} 
                gameType="lotto"
                isOpen={false}
                onClose={() => {}}
              />
            </div>
          </div>
        )}

        {/* Section d'informations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">6 Numéros</h3>
              <p className="text-gray-600 text-sm">Sélectionnez 6 numéros entre 1 et 49</p>
            </div>
          </div>
          
          <div className="card animate-fade-in-up" style={{animationDelay: '0.8s'}}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍀</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">1 Numéro Chance</h3>
              <p className="text-gray-600 text-sm">Plus un numéro chance entre 1 et 10</p>
            </div>
          </div>
          
          <div className="card animate-fade-in-up" style={{animationDelay: '1s'}}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Statistiques IA</h3>
              <p className="text-gray-600 text-sm">Analyse intelligente des tendances</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showHelp && (
        <UnifiedHelpGuide 
          onClose={() => setShowHelp(false)} 
          gameType="lotto" 
        />
      )}
      
      {showCompleteStats && (
        <CompleteNumberStats
          onClose={() => setShowCompleteStats(false)}
          gameType="lotto"
          numbers={detailedStats.top_numeros}
          stars={detailedStats.top_etoiles}
          isOpen={showCompleteStats}
        />
      )}
      
      {showAnnualStats && (
        <AnnualStatistics
          onClose={() => setShowAnnualStats(false)}
          gameType="lotto"
          isOpen={showAnnualStats}
        />
      )}
      
      {showCompleteHistory && (
        <CompleteDrawHistory
          onClose={() => setShowCompleteHistory(false)}
          gameType="lotto"
          isOpen={showCompleteHistory}
        />
      )}
      
      {showManualInput && (
        <ManualDrawInput
          onClose={() => setShowManualInput(false)}
          onSubmit={handleManualDrawSubmit}
          gameType="lotto"
          isOpen={showManualInput}
        />
      )}
      
      {showDailyInput && (
        <DailyDrawInput
          onClose={() => setShowDailyInput(false)}
          gameType="lotto"
          onSuccess={handleDailyInputSuccess}
          isOpen={showDailyInput}
        />
      )}

      {showQuickStats && (
        <QuickNumberStats
          gameType="lotto"
          onClose={() => setShowQuickStats(false)}
          isOpen={showQuickStats}
        />
      )}

      {showFileUpload && (
        <FileUploadWithValidation
          gameType="loto"
          onUploadSuccess={handleFileUploadSuccess}
          onClose={() => setShowFileUpload(false)}
          isOpen={showFileUpload}
        />
      )}

      {showMultipleFileUpload && (
        <MultipleFileUpload
          gameType="loto"
          onUploadSuccess={handleFileUploadSuccess}
          onClose={() => setShowMultipleFileUpload(false)}
          isOpen={showMultipleFileUpload}
        />
      )}

      {showDataExport && (
        <DataExport
          gameType="loto"
          onClose={() => setShowDataExport(false)}
          isOpen={showDataExport}
        />
      )}

      {showDataDiagnostic && (
        <DataDiagnostic
          onClose={() => setShowDataDiagnostic(false)}
          isOpen={showDataDiagnostic}
        />
      )}

      {/* Modals basés sur openedModal */}
      {openedModal === 'usageGuide' && (
        <SimpleUsageGuide 
          onClose={() => setOpenedModal(null)}
          isOpen={openedModal === 'usageGuide'}
        />
      )}
      
      {openedModal === 'help' && (
        <UnifiedHelpGuide 
          onClose={() => setOpenedModal(null)}
          gameType="lotto"
        />
      )}
      
      {openedModal === 'quickStats' && (
        <QuickNumberStats
          gameType="lotto"
          onClose={() => setOpenedModal(null)}
          isOpen={openedModal === 'quickStats'}
        />
      )}
      
      {openedModal === 'completeHistory' && (
        <CompleteDrawHistory 
          onClose={() => setOpenedModal(null)} 
          gameType="lotto"
          isOpen={openedModal === 'completeHistory'}
        />
      )}
      
      {openedModal === 'dailyInput' && (
        <DailyDrawInput 
          onClose={() => setOpenedModal(null)}
          gameType="lotto"
          onSuccess={handleDailyInputSuccess}
          isOpen={openedModal === 'dailyInput'}
        />
      )}

      <StatisticsUpdateNotification
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
        message={notification.message}
        type={notification.type}
      />
    </MainContent>
  );
};

export default Lotto; 