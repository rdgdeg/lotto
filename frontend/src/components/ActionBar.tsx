import React from 'react';

interface ActionBarProps {
  gameType: 'lotto' | 'euromillions';
  onAction: (action: string) => void;
  className?: string;
}

const ActionBar: React.FC<ActionBarProps> = ({ gameType, onAction, className = '' }) => {
  const isLotto = gameType === 'lotto';
  const primaryColor = isLotto ? 'green' : 'blue';
  const primaryGradient = isLotto 
    ? 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' 
    : 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800';

  const actions = [
    {
      id: 'guide',
      label: '🎯 Guide Simple',
      className: `bg-gradient-to-r ${primaryGradient} text-white font-medium`,
      priority: 'primary'
    },
    {
      id: 'usage',
      label: '📖 Comment utiliser ?',
      className: 'bg-green-600 hover:bg-green-700 text-white',
      priority: 'secondary'
    },
    {
      id: 'quickStats',
      label: '📊 Stats Rapides',
      className: 'bg-gray-600 hover:bg-gray-700 text-white',
      priority: 'secondary'
    },
    {
      id: 'advancedGenerator',
      label: isLotto ? '🎰 Générateur Avancé' : '⚡ Générateur',
      className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      priority: 'secondary'
    },
    {
      id: 'advancedStats',
      label: isLotto ? '📈 Stats Avancées' : '📊 Expert',
      className: 'bg-indigo-500 hover:bg-indigo-600 text-white',
      priority: 'secondary'
    },
    {
      id: 'history',
      label: '📅 Historique',
      className: 'bg-purple-500 hover:bg-purple-600 text-white',
      priority: 'secondary'
    },
    {
      id: 'dailyInput',
      label: '✏️ Ajout Quotidien',
      className: 'bg-orange-500 hover:bg-orange-600 text-white',
      priority: 'secondary'
    },
    {
      id: 'fileUpload',
      label: '📁 Upload Fichier',
      className: 'bg-purple-500 hover:bg-purple-600 text-white',
      priority: 'secondary'
    },
    {
      id: 'multipleUpload',
      label: '📚 Upload Multiple',
      className: 'bg-indigo-500 hover:bg-indigo-600 text-white',
      priority: 'secondary'
    },
    {
      id: 'dataExport',
      label: '📥 Export Données',
      className: 'bg-blue-500 hover:bg-blue-600 text-white',
      priority: 'secondary'
    },
    {
      id: 'diagnostic',
      label: '🔍 Diagnostic',
      className: 'bg-red-500 hover:bg-red-600 text-white',
      priority: 'secondary'
    },
    {
      id: 'help',
      label: '❓ Aide',
      className: 'bg-gray-500 hover:bg-gray-600 text-white',
      priority: 'secondary'
    }
  ];

  const primaryActions = actions.filter(action => action.priority === 'primary');
  const secondaryActions = actions.filter(action => action.priority === 'secondary');

  return (
    <div className={`mb-8 ${className}`}>
      {/* Actions principales */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {primaryActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className={`text-sm px-4 py-2 rounded-md shadow-md transition-all duration-200 transform hover:scale-105 ${action.className}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions secondaires */}
      <div className="flex flex-wrap gap-2">
        {secondaryActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            className={`whitespace-nowrap flex-shrink-0 text-xs px-3 py-2 rounded-lg transition-all duration-200 ${action.className}`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActionBar; 