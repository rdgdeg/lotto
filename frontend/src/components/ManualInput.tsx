import React, { useState } from 'react';
import axios from 'axios';

interface ManualInputProps {
  gameType: 'lotto' | 'euromillions';
}

const ManualInput: React.FC<ManualInputProps> = ({ gameType }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    n1: '', n2: '', n3: '', n4: '', n5: '', n6: '',
    e1: '', e2: '',
    complementaire: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const drawData = {
        date: formData.date,
        n1: parseInt(formData.n1),
        n2: parseInt(formData.n2),
        n3: parseInt(formData.n3),
        n4: parseInt(formData.n4),
        n5: parseInt(formData.n5),
        ...(gameType === 'lotto' && { n6: parseInt(formData.n6) }),
        ...(gameType === 'euromillions' && { e1: parseInt(formData.e1), e2: parseInt(formData.e2) }),
        ...(gameType === 'lotto' && { complementaire: parseInt(formData.complementaire) })
      };

      await axios.post(`http://localhost:8000/api/${gameType}/`, drawData);
      setSuccess(true);
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        n1: '', n2: '', n3: '', n4: '', n5: '', n6: '',
        e1: '', e2: '',
        complementaire: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <div className="card-header">
        <span>✏️</span>
        <h2 className="card-title">Encodage Manuel</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Date */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            📅 Date du tirage :
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Numéros principaux */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            🔢 Numéros ({gameType === 'lotto' ? '1-49' : '1-50'}) :
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.5rem' }}>
            {[1, 2, 3, 4, 5].map(num => (
              <input
                key={num}
                type="number"
                value={formData[`n${num}` as keyof typeof formData]}
                onChange={(e) => handleInputChange(`n${num}`, e.target.value)}
                placeholder={`N${num}`}
                min="1"
                max={gameType === 'lotto' ? '49' : '50'}
                required
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  textAlign: 'center'
                }}
              />
            ))}
            {gameType === 'lotto' && (
              <input
                type="number"
                value={formData.n6}
                onChange={(e) => handleInputChange('n6', e.target.value)}
                placeholder="N6"
                min="1"
                max="49"
                required
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  textAlign: 'center'
                }}
              />
            )}
          </div>
        </div>

        {/* Étoiles (Euromillions) ou Numéro chance (Lotto) */}
        {gameType === 'euromillions' ? (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              ⭐ Étoiles (1-12) :
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="number"
                value={formData.e1}
                onChange={(e) => handleInputChange('e1', e.target.value)}
                placeholder="Étoile 1"
                min="1"
                max="12"
                required
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  textAlign: 'center'
                }}
              />
              <input
                type="number"
                value={formData.e2}
                onChange={(e) => handleInputChange('e2', e.target.value)}
                placeholder="Étoile 2"
                min="1"
                max="12"
                required
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  textAlign: 'center'
                }}
              />
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              🍀 Numéro chance (1-45) :
            </label>
            <input
              type="number"
              value={formData.complementaire}
              onChange={(e) => handleInputChange('complementaire', e.target.value)}
              placeholder="Numéro chance"
              min="1"
              max="45"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '1rem',
                textAlign: 'center'
              }}
            />
          </div>
        )}

        {/* Messages */}
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

        {success && (
          <div style={{ 
            background: '#efe', 
            color: '#363', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            border: '1px solid #cfc'
          }}>
            ✅ Tirage enregistré avec succès !
          </div>
        )}

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-success"
          style={{ width: '100%' }}
        >
          {loading ? '🔄 Enregistrement...' : '💾 Enregistrer le tirage'}
        </button>
      </form>
    </div>
  );
};

export default ManualInput; 