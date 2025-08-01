import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: 'lotto' | 'euromillions';
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, gameType }) => {
  if (!isOpen) return null;

  const gameInfo = {
    lotto: {
      name: 'Lotto',
      icon: '🍀',
      rules: '6 numéros de 1 à 49 + 1 numéro chance de 1 à 45',
      strategies: [
        { name: 'Équilibré', desc: 'Équilibre entre numéros pairs/impairs et hauts/bas' },
        { name: 'Numéros Chauds', desc: 'Privilégie les numéros les plus fréquents' },
        { name: 'Numéros Froids', desc: 'Privilégie les numéros les moins fréquents' },
        { name: 'Somme Optimisée', desc: 'Optimise la somme totale de la grille' },
        { name: 'Analyse des Écarts', desc: 'Analyse les écarts entre numéros consécutifs' },
        { name: 'Aléatoire Équilibré', desc: 'Aléatoire avec contraintes d\'équilibre' }
      ]
    },
    euromillions: {
      name: 'Euromillions',
      icon: '⭐',
      rules: '5 numéros de 1 à 50 + 2 étoiles de 1 à 12',
      strategies: [
        { name: 'Équilibré', desc: 'Mélange de numéros chauds et froids avec analyse des patterns' },
        { name: 'Fréquence', desc: 'Privilégie les numéros les plus fréquents historiquement' },
        { name: 'Chaud', desc: 'Privilégie les numéros qui sortent souvent récemment' },
        { name: 'Froid', desc: 'Privilégie les numéros qui ne sortent plus depuis longtemps' },
        { name: 'Pattern', desc: 'Privilégie les patterns les plus probables' },
        { name: 'Aléatoire', desc: 'Sélection complètement aléatoire' }
      ]
    }
  };

  const currentGame = gameInfo[gameType];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {currentGame.icon} Aide - {currentGame.name}
          </h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Règles du jeu */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: '#2c3e50', marginBottom: '1rem' }}>📋 Règles du jeu :</h4>
            <div style={{ 
              padding: '1rem', 
              background: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <strong>{currentGame.rules}</strong>
            </div>
          </div>

          {/* Fonctionnalités */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: '#2c3e50', marginBottom: '1rem' }}>🎯 Fonctionnalités :</h4>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ 
                padding: '1rem', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '8px'
              }}>
                <strong>🎲 Générateur :</strong> Créez des grilles avec différentes stratégies ou générez une grille par stratégie.
              </div>
              
              <div style={{ 
                padding: '1rem', 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                borderRadius: '8px'
              }}>
                <strong>📊 Stats Rapides :</strong> Consultez les numéros les plus fréquents et cliquez dessus pour voir leur historique.
              </div>
              
              <div style={{ 
                padding: '1rem', 
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: 'white',
                borderRadius: '8px'
              }}>
                <strong>📈 Historique :</strong> Parcourez tous les tirages avec recherche et filtrage par année.
              </div>
              
              <div style={{ 
                padding: '1rem', 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                borderRadius: '8px'
              }}>
                <strong>✏️ Encodage :</strong> Saisissez manuellement un tirage avec validation automatique.
              </div>
              
              <div style={{ 
                padding: '1rem', 
                background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                color: 'white',
                borderRadius: '8px'
              }}>
                <strong>📁 Upload :</strong> Importez des fichiers CSV (unique ou multiple) avec validation.
              </div>
            </div>
          </div>

          {/* Stratégies */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: '#2c3e50', marginBottom: '1rem' }}>🎯 Stratégies de génération :</h4>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {currentGame.strategies.map((strategy, index) => (
                <div key={index} style={{ 
                  padding: '0.75rem', 
                  background: '#f8f9fa', 
                  borderRadius: '6px',
                  border: '1px solid #e9ecef'
                }}>
                  <strong>{strategy.name} :</strong> {strategy.desc}
                </div>
              ))}
            </div>
          </div>

          {/* Conseils */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: '#2c3e50', marginBottom: '1rem' }}>💡 Conseils d'utilisation :</h4>
            <div style={{ 
              padding: '1rem', 
              background: '#fff3cd', 
              borderRadius: '8px',
              border: '1px solid #ffeaa7',
              color: '#856404'
            }}>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                <li>Commencez par explorer les statistiques pour comprendre les tendances</li>
                <li>Testez différentes stratégies de génération</li>
                <li>Utilisez la saisie manuelle pour enregistrer vos propres tirages</li>
                <li>Importez vos données existantes via fichiers CSV</li>
                <li>N'oubliez pas que le hasard reste le facteur principal</li>
              </ul>
            </div>
          </div>

          {/* Format des fichiers */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: '#2c3e50', marginBottom: '1rem' }}>📋 Format des fichiers CSV :</h4>
            <div style={{ 
              padding: '1rem', 
              background: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #e9ecef',
              fontFamily: 'monospace',
              fontSize: '0.9rem'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Lotto :</strong> date,n1,n2,n3,n4,n5,n6,complementaire
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Euromillions :</strong> date,n1,n2,n3,n4,n5,e1,e2
              </div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                Exemple : 2024-01-15,12,23,34,45,6,7,8
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal; 