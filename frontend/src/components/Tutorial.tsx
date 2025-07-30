import React, { useState } from 'react';

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: 'euromillions' | 'lotto';
}

const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose, gameType }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Bienvenue dans le tutoriel !",
      content: (
        <div className="space-y-4">
          <p>Ce tutoriel vous guidera à travers les fonctionnalités principales de l'application.</p>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Jeu actuel :</strong> {gameType === 'euromillions' ? 'Euromillions' : 'Lotto'}
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Génération de grilles",
      content: (
        <div className="space-y-4">
          <p>Utilisez le générateur pour créer des combinaisons de numéros :</p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Choisissez le nombre de grilles à générer</li>
            <li>Sélectionnez une stratégie (aléatoire, statistique, équilibrée)</li>
            <li>Cliquez sur "Générer les Grilles"</li>
          </ul>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Conseil :</strong> Commencez par générer quelques grilles pour tester les fonctionnalités.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Statistiques et analyse",
      content: (
        <div className="space-y-4">
          <p>Analysez les tendances des numéros :</p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Consultez les statistiques détaillées</li>
            <li>Identifiez les numéros "chauds" et "froids"</li>
            <li>Utilisez les filtres pour affiner votre analyse</li>
          </ul>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Rappel :</strong> Les statistiques ne garantissent pas de gains, mais peuvent vous aider à faire des choix éclairés.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Saisie manuelle",
      content: (
        <div className="space-y-4">
          <p>Enregistrez vos propres tirages :</p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Utilisez le bouton "Tirage Manuel"</li>
            <li>Saisissez les numéros et la date</li>
            <li>Ou utilisez "Générer Aléatoirement" pour remplir automatiquement</li>
          </ul>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>Fonctionnalité :</strong> Gardez une trace de vos tirages personnels pour analyse.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Guide complet",
      content: (
        <div className="space-y-4">
          <p>Pour plus d'informations détaillées :</p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Consultez le "Guide Complet" pour les stratégies</li>
            <li>Lisez les explications sur chaque mode de génération</li>
            <li>Comprenez l'interprétation des statistiques</li>
          </ul>
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Important :</strong> Le loto reste un jeu de hasard. Jouez de manière responsable.
            </p>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            🎓 Tutoriel - {gameType === 'euromillions' ? 'Euromillions' : 'Lotto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Indicateur de progression */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Étape {currentStep + 1} sur {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Contenu de l'étape */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {steps[currentStep].title}
          </h3>
          <div className="text-gray-700">
            {steps[currentStep].content}
          </div>
        </div>

        {/* Boutons de navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-md transition-colors ${
              currentStep === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            ← Précédent
          </button>

          <button
            onClick={nextStep}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {currentStep === steps.length - 1 ? 'Terminer' : 'Suivant →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial; 