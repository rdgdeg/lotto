import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">❓ Aide</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🎯 Comment utiliser l'application</h3>
            <p>Cette application vous permet de générer des grilles de loto et d'analyser les statistiques des tirages.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">📊 Fonctionnalités principales</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Génération de grilles aléatoires</li>
              <li>Analyse des statistiques</li>
              <li>Saisie manuelle de tirages</li>
              <li>Recherche dans l'historique</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">⚠️ Avertissement</h3>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-yellow-800">
                Le loto est un jeu de hasard. Aucune stratégie ne garantit de gains. 
                Jouez de manière responsable et ne dépensez que ce que vous pouvez vous permettre de perdre.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal; 