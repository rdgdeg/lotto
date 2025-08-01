import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface StatItem {
  numero: number;
  frequence: number;
  pourcentage: number;
}

interface QuickStatsProps {
  gameType: 'lotto' | 'euromillions';
}

const QuickStats: React.FC<QuickStatsProps> = ({ gameType }) => {
  const [stats, setStats] = useState<{
    numeros: StatItem[];
    etoiles?: StatItem[];
    complementaires?: StatItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<{
    numero: number;
    type: 'numero' | 'etoile' | 'complementaire';
  } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, [gameType]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/${gameType}/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des stats:', err);
      setError('Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  const handleNumberClick = async (numero: number, type: 'numero' | 'etoile' | 'complementaire') => {
    try {
      setSelectedNumber({ numero, type });
      setShowHistory(true);
      
      // Adapter le type pour l'API
      let apiType = type;
      if (gameType === 'lotto' && type === 'etoile') {
        apiType = 'complementaire';
      }
      
      const response = await axios.get(`http://localhost:8000/api/${gameType}/number/${numero}?type=${apiType}`);
      setHistory(response.data.draws || []);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'historique:', err);
      setHistory([]);
    }
  };

  const StatCard = ({ item, type }: { item: StatItem; type: 'numero' | 'etoile' | 'complementaire' }) => (
    <div
      className="stat-item"
      onClick={() => handleNumberClick(item.numero, type)}
      style={{ cursor: 'pointer' }}
    >
      <div className="stat-number">{item.numero}</div>
      <div className="stat-label">
        {item.frequence} fois ({item.pourcentage.toFixed(1)}%)
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span style={{ marginLeft: '1rem' }}>Chargement des statistiques...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        background: '#fee', 
        color: '#c33', 
        padding: '1rem', 
        borderRadius: '8px',
        border: '1px solid #fcc'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="card-header">
        <span>📊</span>
        <h2 className="card-title">Statistiques Rapides</h2>
      </div>

      {stats && (
        <>
          {/* Numéros les plus fréquents */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>
              🔢 Numéros les plus fréquents :
            </h3>
            <div className="stats-grid">
              {stats.numeros?.slice(0, 10).map((item) => (
                <StatCard key={item.numero} item={item} type="numero" />
              ))}
            </div>
          </div>

          {/* Étoiles/Bonus les plus fréquents */}
          {gameType === 'euromillions' && stats.etoiles && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>
                ⭐ Étoiles les plus fréquentes :
              </h3>
              <div className="stats-grid">
                {stats.etoiles.slice(0, 6).map((item) => (
                  <StatCard key={item.numero} item={item} type="etoile" />
                ))}
              </div>
            </div>
          )}

          {/* Numéros chance les plus fréquents (Lotto) */}
          {gameType === 'lotto' && stats.complementaires && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>
                🍀 Numéros chance les plus fréquents :
              </h3>
              <div className="stats-grid">
                {stats.complementaires.slice(0, 6).map((item) => (
                  <StatCard key={item.numero} item={item} type="complementaire" />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal d'historique */}
      {showHistory && selectedNumber && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                Historique du {selectedNumber.type === 'numero' ? 'numéro' : 
                              selectedNumber.type === 'etoile' ? 'étoile' : 'numéro chance'} {selectedNumber.numero}
              </h3>
              <button className="modal-close" onClick={() => setShowHistory(false)}>×</button>
            </div>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {history.length > 0 ? (
                <div>
                  <p style={{ marginBottom: '1rem', color: '#666' }}>
                    Ce {selectedNumber.type === 'numero' ? 'numéro' : 
                        selectedNumber.type === 'etoile' ? 'étoile' : 'numéro chance'} est apparu dans {history.length} tirage(s) :
                  </p>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {history.map((draw, index) => (
                      <div key={index} style={{ 
                        padding: '0.75rem', 
                        background: '#f8f9fa', 
                        borderRadius: '6px',
                        border: '1px solid #e9ecef'
                      }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                          {new Date(draw.date).toLocaleDateString('fr-FR')}
                        </div>
                        <div>
                          <strong>Numéros:</strong> {draw.numeros?.join(' - ') || `${draw.n1} - ${draw.n2} - ${draw.n3} - ${draw.n4} - ${draw.n5}${draw.n6 ? ` - ${draw.n6}` : ''}`}
                        </div>
                        {gameType === 'euromillions' && (
                          <div>
                            <strong>Étoiles:</strong> {draw.etoiles?.join(' - ') || `${draw.e1} - ${draw.e2}`}
                          </div>
                        )}
                        {gameType === 'lotto' && draw.complementaire && (
                          <div>
                            <strong>Chance:</strong> {draw.complementaire}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                  Aucun tirage trouvé pour ce {selectedNumber.type === 'numero' ? 'numéro' : 
                                              selectedNumber.type === 'etoile' ? 'étoile' : 'numéro chance'}.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        background: '#f8f9fa', 
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: '#666'
      }}>
        <strong>💡 Astuce :</strong> Cliquez sur un numéro pour voir son historique complet de tirages.
      </div>
    </div>
  );
};

export default QuickStats; 