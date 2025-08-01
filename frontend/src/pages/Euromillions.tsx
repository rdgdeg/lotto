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
import AdvancedStats from '../components/AdvancedStats';
import AdvancedGenerator from '../components/AdvancedGenerator';
import SimplifiedEuromillionsDashboard from '../components/SimplifiedEuromillionsDashboard';
import SimpleUsageGuide from '../components/SimpleUsageGuide';
import DailyDrawInput from '../components/DailyDrawInput';
import StatisticsUpdateNotification from '../components/StatisticsUpdateNotification';
import FileUploadWithValidation from '../components/FileUploadWithValidation';
import QuickNumberStats from '../components/QuickNumberStats';
import MainContent from '../components/MainContent';
import DataDiagnostic from '../components/DataDiagnostic';
import ActionBar from '../components/ActionBar';

const Euromillions: React.FC = () => {
  const [grids, setGrids] = useState<number[][]>([]);
  const [selectedGridForAnalysis, setSelectedGridForAnalysis] = useState<number[] | null>(null);
  const [openedModal, setOpenedModal] = useState<string | null>(null);
  const [detailedStats, setDetailedStats] = useState<any>(null);
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    message: string;
    type: 'success' | 'info' | 'warning';
  }>({
    isVisible: false,
    message: '',
    type: 'info'
  });
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showDataDiagnostic, setShowDataDiagnostic] = useState(false);

  // Mock stats pour le développement
  const mockStats = useMemo(() => ({
    top_numeros: [7, 23, 11, 19, 3],
    top_etoiles: [2, 8]
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
    console.log('Données de tirage manuel:', drawData);
    setOpenedModal(null);
  };

  const handleImportSuccess = (message: string) => {
    console.log('Import réussi:', message);
    setOpenedModal(null);
  };

  const handleDailyInputSuccess = (message: string) => {
    console.log('Tirage ajouté:', message);
    setNotification({
      isVisible: true,
      message: `${message} - Les statistiques ont été mises à jour automatiquement !`,
      type: 'success'
    });
    setOpenedModal(null);
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'guide':
        setOpenedModal('simplifiedDashboard');
        break;
      case 'usage':
        setOpenedModal('usageGuide');
        break;
      case 'quickStats':
        setOpenedModal('quickStats');
        break;
      case 'advancedGenerator':
        setOpenedModal('advancedGenerator');
        break;
      case 'advancedStats':
        setOpenedModal('advancedStats');
        break;
      case 'history':
        setOpenedModal('drawHistory');
        break;
      case 'dailyInput':
        setOpenedModal('dailyInput');
        break;
      case 'fileUpload':
        setShowFileUpload(true);
        break;
      case 'multipleUpload':
        // Pas d'action multiple upload pour Euromillions pour l'instant
        console.log('Upload multiple non disponible pour Euromillions');
        break;
      case 'dataExport':
        // Pas d'action export pour Euromillions pour l'instant
        console.log('Export non disponible pour Euromillions');
        break;
      case 'diagnostic':
        setShowDataDiagnostic(true);
        break;
      case 'help':
        setOpenedModal('help');
        break;
      default:
        console.log('Action non reconnue:', action);
    }
  };

  return (
    <MainContent>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            🎰
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Euromillions</h1>
            <p className="text-gray-600 text-lg">Générateur et analyseur de grilles avancé</p>
          </div>
        </div>

        {/* Barre d'actions unifiée */}
        <ActionBar gameType="euromillions" onAction={handleAction} />
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
              <GridGenerator onGenerate={handleGenerateGrids} gameType="euromillions" />
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
                gameType="euromillions"
                onClear={handleClearGrids}
                onAnalyzeGrid={setSelectedGridForAnalysis}
              />
            </div>
          </div>
        </div>

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
                gameType="euromillions"
                isOpen={false}
                onClose={() => {}}
              />
            </div>
          </div>
        )}

        {/* Section d'analyse de grille */}
        {selectedGridForAnalysis && (
          <div className="card mb-8 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🔍</span>
                Analyse de Grille
              </h2>
              <GridAnalysis 
                grid={selectedGridForAnalysis}
                gameType="euromillions"
                onClose={() => setSelectedGridForAnalysis(null)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      {openedModal === 'simplifiedDashboard' && (
        <SimplifiedEuromillionsDashboard 
          onClose={() => setOpenedModal(null)}
          isOpen={openedModal === 'simplifiedDashboard'}
        />
      )}
      
      {openedModal === 'advancedStats' && (
        <AdvancedStats 
          gameType="euromillions"
          onClose={() => setOpenedModal(null)}
          isOpen={openedModal === 'advancedStats'}
        />
      )}
      
      {openedModal === 'advancedGenerator' && (
        <AdvancedGenerator 
          gameType="euromillions"
          onClose={() => setOpenedModal(null)}
          isOpen={openedModal === 'advancedGenerator'}
        />
      )}
      
      {openedModal === 'completeStats' && (
        <CompleteNumberStats 
          onClose={() => setOpenedModal(null)} 
          gameType="euromillions"
          numbers={detailedStats?.top_numeros || []}
          stars={detailedStats?.top_etoiles || []}
          isOpen={openedModal === 'completeStats'}
        />
      )}
      
      {openedModal === 'detailedStats' && (
        <DetailedNumberStats 
          onClose={() => setOpenedModal(null)} 
          gameType="euromillions"
          isOpen={openedModal === 'detailedStats'}
        />
      )}
      
      {openedModal === 'numberStats' && (
        <NumberStatisticsPage 
          onClose={() => setOpenedModal(null)} 
          gameType="euromillions"
          isOpen={openedModal === 'numberStats'}
        />
      )}
      
      {openedModal === 'annualStats' && (
        <AnnualStatistics 
          onClose={() => setOpenedModal(null)} 
          gameType="euromillions"
          isOpen={openedModal === 'annualStats'}
        />
      )}
      
      {openedModal === 'completeHistory' && (
        <CompleteDrawHistory 
          onClose={() => setOpenedModal(null)} 
          gameType="euromillions"
          isOpen={openedModal === 'completeHistory'}
        />
      )}
      
      {openedModal === 'drawHistory' && (
        <CompleteDrawHistory 
          onClose={() => setOpenedModal(null)} 
          gameType="euromillions"
          isOpen={openedModal === 'drawHistory'}
        />
      )}
      
      {openedModal === 'manualInput' && (
        <ManualDrawInput 
          onClose={() => setOpenedModal(null)}
          onSubmit={handleManualDrawSubmit}
          gameType="euromillions"
          isOpen={openedModal === 'manualInput'}
        />
      )}
      
      {openedModal === 'importCSV' && (
        <ImportCSV 
          onClose={() => setOpenedModal(null)}
          gameType="euromillions"
          onImportSuccess={handleImportSuccess}
          isOpen={openedModal === 'importCSV'}
        />
      )}
      
      {openedModal === 'dataManagement' && (
        <DataManagement 
          onClose={() => setOpenedModal(null)} 
          gameType="euromillions"
          isOpen={openedModal === 'dataManagement'}
        />
      )}
      
      {openedModal === 'usageGuide' && (
        <SimpleUsageGuide 
          onClose={() => setOpenedModal(null)}
          isOpen={openedModal === 'usageGuide'}
        />
      )}
      
      {openedModal === 'help' && (
        <UnifiedHelpGuide 
          onClose={() => setOpenedModal(null)}
          gameType="euromillions"
        />
      )}
      
      {openedModal === 'dailyInput' && (
        <DailyDrawInput 
          onClose={() => setOpenedModal(null)}
          gameType="euromillions"
          onSuccess={handleDailyInputSuccess}
          isOpen={openedModal === 'dailyInput'}
        />
      )}

      {showFileUpload && (
        <FileUploadWithValidation
          gameType="euromillions"
          onUploadSuccess={(message) => {
            setNotification({
              isVisible: true,
              message: message,
              type: 'success'
            });
            setShowFileUpload(false);
          }}
          onClose={() => setShowFileUpload(false)}
          isOpen={showFileUpload}
        />
      )}

      {showDataDiagnostic && (
        <DataDiagnostic
          onClose={() => setShowDataDiagnostic(false)}
          isOpen={showDataDiagnostic}
        />
      )}

      {openedModal === 'quickStats' && (
        <QuickNumberStats
          gameType="euromillions"
          onClose={() => setOpenedModal(null)}
          isOpen={openedModal === 'quickStats'}
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

export default Euromillions; 