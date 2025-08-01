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
    numeros: StatItem[] | Record<string, any>;
    etoiles?: StatItem[] | Record<string, any>;
    complementaires?: StatItem[] | Record<string, any>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<{
    numero: number;
    type: 'numero' | 'etoile' | 'complementaire';
  } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterMonth, setFilterMonth] = useState<string>('');

  useEffect(() => {
    fetchStats();
  }, [gameType, filterYear, filterMonth]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      let url = `http://localhost:8000/api/${gameType}/stats`;
      const params = new URLSearchParams();
      
      if (filterYear) params.append('year', filterYear);
      if (filterMonth) params.append('month', filterMonth);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url);
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
      style={{ 
        cursor: 'pointer',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.2s ease-in-out',
        border: '2px solid transparent'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = '#fff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      <div style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        marginBottom: '0.5rem',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
      }}>
        {item.numero}
      </div>
      <div style={{ 
        fontSize: '1.2rem', 
        fontWeight: 'bold',
        marginBottom: '0.25rem'
      }}>
        {item.frequence} fois
      </div>
      <div style={{ 
        fontSize: '1rem', 
        opacity: 0.9,
        background: 'rgba(255, 255, 255, 0.2)',
        padding: '0.25rem 0.5rem',
        borderRadius: '6px',
        display: 'inline-block'
      }}>
        {item.pourcentage > 0 ? item.pourcentage.toFixed(1) : '0.0'}%
      </div>
    </div>
  );

  // Fonction pour convertir un objet en tableau de StatItem
  const convertToStatItems = (data: any): StatItem[] => {
    if (Array.isArray(data)) {
      return data;
    }
    
    if (typeof data === 'object' && data !== null) {
      return Object.entries(data).map(([numero, value]: [string, any]) => {
        const frequence = typeof value === 'object' ? value.frequence || value.count || 0 : value;
        const pourcentage = typeof value === 'object' ? value.pourcentage || 0 : 0;
        
        return {
          numero: parseInt(numero),
          frequence: frequence,
          pourcentage: pourcentage > 0 ? pourcentage : 0
        };
      }).sort((a, b) => b.frequence - a.frequence);
    }
    
    return [];
  };

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

  // Convertir les données en tableaux
  const numerosItems = convertToStatItems(stats?.numeros || []);
  const etoilesItems = convertToStatItems(stats?.etoiles || []);
  const complementairesItems = convertToStatItems(stats?.complementaires || []);

  // Années disponibles (exemple)
  const years = ['2023', '2024', '2025'];
  const months = [
    { value: '1', label: 'Janvier' },
    { value: '2', label: 'Février' },
    { value: '3', label: 'Mars' },
    { value: '4', label: 'Avril' },
    { value: '5', label: 'Mai' },
    { value: '6', label: 'Juin' },
    { value: '7', label: 'Juillet' },
    { value: '8', label: 'Août' },
    { value: '9', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' }
  ];

  return (
    <div>
      <div className="card-header">
        <span>📊</span>
        <h2 className="card-title">Statistiques Rapides</h2>
      </div>

      {/* Filtres */}
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1rem', 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderRadius: '12px',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#2c3e50', fontSize: '1.1rem' }}>
          🔍 Filtres de période
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>
              📅 Année :
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ced4da',
                fontSize: '1rem',
                background: 'white'
              }}
            >
              <option value="">Toutes les années</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>
              📅 Mois :
            </label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ced4da',
                fontSize: '1rem',
                background: 'white'
              }}
            >
              <option value="">Tous les mois</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        {(filterYear || filterMonth) && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '0.5rem', 
            background: '#e3f2fd', 
            borderRadius: '6px',
            fontSize: '0.9rem',
            color: '#1976d2'
          }}>
            <strong>Filtre actif :</strong> {filterYear && `Année ${filterYear}`} {filterYear && filterMonth && ' - '} {filterMonth && months.find(m => m.value === filterMonth)?.label}
          </div>
        )}
      </div>

      {stats && (
        <>
          {/* Numéros les plus fréquents */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              marginBottom: '1.5rem', 
              color: '#2c3e50',
              fontSize: '1.3rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>🔢</span>
              Numéros les plus fréquents
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
              gap: '1rem' 
            }}>
              {numerosItems.slice(0, 10).map((item) => (
                <StatCard key={item.numero} item={item} type="numero" />
              ))}
            </div>
          </div>

          {/* Étoiles/Bonus les plus fréquents */}
          {gameType === 'euromillions' && etoilesItems.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                marginBottom: '1.5rem', 
                color: '#2c3e50',
                fontSize: '1.3rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>⭐</span>
                Étoiles les plus fréquentes
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                gap: '1rem' 
              }}>
                {etoilesItems.slice(0, 6).map((item) => (
                  <StatCard key={item.numero} item={item} type="etoile" />
                ))}
              </div>
            </div>
          )}

          {/* Numéros chance les plus fréquents (Lotto) */}
          {gameType === 'lotto' && complementairesItems.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                marginBottom: '1.5rem', 
                color: '#2c3e50',
                fontSize: '1.3rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>🍀</span>
                Numéros chance les plus fréquents
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                gap: '1rem' 
              }}>
                {complementairesItems.slice(0, 6).map((item) => (
                  <StatCard key={item.numero} item={item} type="complementaire" />
                ))}
              </div>
            </div>
          )}

          {/* Tableau détaillé pour Euromillions */}
          {gameType === 'euromillions' && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                marginBottom: '1rem', 
                color: '#2c3e50',
                fontSize: '1.3rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>📋</span>
                Tableau détaillé des fréquences
              </h3>
              <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '1rem',
                overflowX: 'auto',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                border: '1px solid #dee2e6'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ 
                      borderBottom: '2px solid #dee2e6',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white'
                    }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Numéro</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>Fréquence</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>Pourcentage</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {numerosItems.slice(0, 15).map((item, index) => (
                      <tr key={`numero-${item.numero}`} style={{ 
                        borderBottom: '1px solid #dee2e6',
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa'}
                      >
                        <td style={{ padding: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>{item.numero}</td>
                        <td style={{ padding: '1rem', textAlign: 'center', fontSize: '1.1rem' }}>{item.frequence}</td>
                        <td style={{ padding: '1rem', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold', color: '#667eea' }}>
                          {item.pourcentage > 0 ? item.pourcentage.toFixed(1) : '0.0'}%
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <span style={{ 
                            background: '#667eea', 
                            color: 'white', 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '6px',
                            fontSize: '0.9rem'
                          }}>
                            Numéro
                          </span>
                        </td>
                      </tr>
                    ))}
                    {etoilesItems.slice(0, 6).map((item, index) => (
                      <tr key={`etoile-${item.numero}`} style={{ 
                        borderBottom: '1px solid #dee2e6',
                        backgroundColor: '#fff3e0',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffe0b2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff3e0'}
                      >
                        <td style={{ padding: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>{item.numero}</td>
                        <td style={{ padding: '1rem', textAlign: 'center', fontSize: '1.1rem' }}>{item.frequence}</td>
                        <td style={{ padding: '1rem', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold', color: '#ff9800' }}>
                          {item.pourcentage > 0 ? item.pourcentage.toFixed(1) : '0.0'}%
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <span style={{ 
                            background: '#ff9800', 
                            color: 'white', 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '6px',
                            fontSize: '0.9rem'
                          }}>
                            Étoile
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', 
        borderRadius: '12px',
        fontSize: '0.9rem',
        color: '#1976d2',
        border: '1px solid #90caf9'
      }}>
        <strong>💡 Astuce :</strong> Cliquez sur un numéro pour voir son historique complet de tirages. Utilisez les filtres pour analyser des périodes spécifiques.
      </div>
    </div>
  );
};

export default QuickStats; 