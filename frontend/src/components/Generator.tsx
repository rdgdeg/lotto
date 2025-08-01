import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Strategy {
  id: string;
  name: string;
  description: string;
  best_for: string;
}

interface GeneratedGrid {
  grid: {
    numeros: number[];
    complementaire?: number;
    etoiles?: number[];
  };
  metadata: {
    strategy: string;
    confidence: number;
    patterns_used: any;
    description: string;
  };
}

interface GeneratorProps {
  gameType: 'lotto' | 'euromillions';
}

const Generator: React.FC<GeneratorProps> = ({ gameType }) => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [generationMode, setGenerationMode] = useState<'single' | 'all'>('single');
  const [generatedGrids, setGeneratedGrids] = useState<GeneratedGrid[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStrategies();
  }, [gameType]);

  const fetchStrategies = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/${gameType}/advanced/strategies`);
      const strategiesData = response.data.strategies || response.data;
      setStrategies(strategiesData);
      if (strategiesData.length > 0) {
        setSelectedStrategy(strategiesData[0].id || strategiesData[0].name);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des stratégies:', err);
      setError('Impossible de charger les stratégies');
    }
  };

  const generateGrids = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const grids: GeneratedGrid[] = [];
      
      if (generationMode === 'single') {
        // Générer une seule grille avec la stratégie sélectionnée
        const response = await axios.get(`http://localhost:8000/api/${gameType}/advanced/generate-grid?strategy=${selectedStrategy}`);
        grids.push(response.data);
      } else {
        // Générer une grille pour chaque stratégie
        for (const strategy of strategies) {
          try {
            const response = await axios.get(`http://localhost:8000/api/${gameType}/advanced/generate-grid?strategy=${strategy.id || strategy.name}`);
            grids.push(response.data);
          } catch (err) {
            console.error(`Erreur avec la stratégie ${strategy.name}:`, err);
          }
        }
      }
      
      setGeneratedGrids(grids);
    } catch (err) {
      setError('Erreur lors de la génération des grilles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearGrids = () => {
    setGeneratedGrids([]);
  };

  const formatGrid = (grid: GeneratedGrid) => {
    const { numeros, complementaire, etoiles } = grid.grid;
    
    if (gameType === 'lotto') {
      return (
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Numéros:</strong> {numeros.join(' - ')}
          </div>
          <div>
            <strong>Chance:</strong> {complementaire}
          </div>
          <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.8 }}>
            Stratégie: {grid.metadata.strategy} (Confiance: {Math.round(grid.metadata.confidence * 100)}%)
          </div>
        </div>
      );
    } else {
      return (
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Numéros:</strong> {numeros.join(' - ')}
          </div>
          <div>
            <strong>Étoiles:</strong> {etoiles?.join(' - ')}
          </div>
          <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.8 }}>
            Stratégie: {grid.metadata.strategy} (Confiance: {Math.round(grid.metadata.confidence * 100)}%)
          </div>
        </div>
      );
    }
  };

  return (
    <div>
      <div className="card-header">
        <span>🎲</span>
        <h2 className="card-title">Générateur de Grilles</h2>
      </div>

      {/* Mode de génération */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Mode de génération :</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="radio"
              name="generationMode"
              value="single"
              checked={generationMode === 'single'}
              onChange={(e) => setGenerationMode(e.target.value as 'single' | 'all')}
            />
            Une grille avec stratégie sélectionnée
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="radio"
              name="generationMode"
              value="all"
              checked={generationMode === 'all'}
              onChange={(e) => setGenerationMode(e.target.value as 'single' | 'all')}
            />
            Une grille par stratégie
          </label>
        </div>
      </div>

      {/* Sélection de stratégie */}
      {generationMode === 'single' && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Stratégie :</h3>
          <select
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '1rem'
            }}
          >
            {strategies.map((strategy) => (
              <option key={strategy.id || strategy.name} value={strategy.id || strategy.name}>
                {strategy.name} - {strategy.description}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Boutons d'action */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={generateGrids}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? '🔄 Génération...' : '🎲 Générer'}
        </button>
        
        {generatedGrids.length > 0 && (
          <button
            onClick={clearGrids}
            className="btn btn-danger"
          >
            🗑️ Effacer
          </button>
        )}
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div style={{ 
          background: '#fee', 
          color: '#c33', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1rem',
          border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}

      {/* Affichage des grilles générées */}
      {generatedGrids.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>
            Grilles générées ({generatedGrids.length}) :
          </h3>
          <div>
            {generatedGrids.map((grid, index) => (
              <div key={index}>
                {formatGrid(grid)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informations sur les stratégies */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>ℹ️ Informations sur les stratégies :</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {strategies.map((strategy) => (
            <div key={strategy.id || strategy.name} style={{ padding: '0.5rem' }}>
              <strong>{strategy.name}</strong>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                {strategy.description}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#888' }}>
                Idéal pour : {strategy.best_for}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Generator; 