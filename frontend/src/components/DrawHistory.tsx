import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface DrawHistoryProps {
  gameType: 'lotto' | 'euromillions';
}

const DrawHistory: React.FC<DrawHistoryProps> = ({ gameType }) => {
  const [draws, setDraws] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<string>('');

  useEffect(() => {
    fetchDraws();
  }, [gameType]);

  const fetchDraws = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/${gameType}/`);
      setDraws(response.data || []);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'historique:', err);
      setError('Impossible de charger l\'historique');
    } finally {
      setLoading(false);
    }
  };

  const filteredDraws = draws.filter(draw => {
    const matchesSearch = searchTerm === '' || 
      draw.n1?.toString().includes(searchTerm) ||
      draw.n2?.toString().includes(searchTerm) ||
      draw.n3?.toString().includes(searchTerm) ||
      draw.n4?.toString().includes(searchTerm) ||
      draw.n5?.toString().includes(searchTerm) ||
      (draw.n6 && draw.n6.toString().includes(searchTerm)) ||
      (gameType === 'euromillions' && (draw.e1?.toString().includes(searchTerm) || draw.e2?.toString().includes(searchTerm))) ||
      (gameType === 'lotto' && draw.complementaire?.toString().includes(searchTerm));
    
    const matchesYear = filterYear === '' || 
      new Date(draw.date).getFullYear().toString() === filterYear;
    
    return matchesSearch && matchesYear;
  });

  const years = [...new Set(draws.map(draw => new Date(draw.date).getFullYear()))].sort((a, b) => b - a);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span style={{ marginLeft: '1rem' }}>Chargement de l'historique...</span>
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
        <span>📈</span>
        <h2 className="card-title">Historique Complet</h2>
      </div>

      {/* Filtres */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              🔍 Rechercher un numéro :
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Entrez un numéro..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <div style={{ minWidth: '150px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              📅 Année :
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '1rem'
              }}
            >
              <option value="">Toutes les années</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div style={{ fontSize: '0.9rem', color: '#666' }}>
          {filteredDraws.length} tirage(s) trouvé(s) sur {draws.length} total
        </div>
      </div>

      {/* Liste des tirages */}
      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {filteredDraws.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {filteredDraws.map((draw, index) => (
              <div key={index} style={{ 
                padding: '1rem', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {new Date(draw.date).toLocaleDateString('fr-FR')}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    #{draw.id}
                  </div>
                </div>
                
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Numéros:</strong> {draw.n1} - {draw.n2} - {draw.n3} - {draw.n4} - {draw.n5}
                  {draw.n6 && ` - ${draw.n6}`}
                </div>
                
                {gameType === 'euromillions' && (
                  <div>
                    <strong>Étoiles:</strong> {draw.e1} - {draw.e2}
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
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: '#666',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Aucun tirage trouvé</div>
            <div>Essayez de modifier vos critères de recherche</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawHistory; 