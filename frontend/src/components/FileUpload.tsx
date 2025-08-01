import React, { useState } from 'react';
import axios from 'axios';

interface FileUploadProps {
  gameType: 'lotto' | 'euromillions';
}

const FileUpload: React.FC<FileUploadProps> = ({ gameType }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadMode, setUploadMode] = useState<'single' | 'multiple'>('single');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (uploadMode === 'single') {
      setFiles(selectedFiles.slice(0, 1));
    } else {
      setFiles(selectedFiles);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setLoading(true);
    setSuccess([]);
    setErrors([]);

    const results: string[] = [];
    const errorResults: string[] = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(
          `http://localhost:8000/api/import/${gameType}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        results.push(`${file.name}: ${response.data.message || 'Importé avec succès'}`);
      } catch (err: any) {
        errorResults.push(`${file.name}: ${err.response?.data?.detail || 'Erreur lors de l\'import'}`);
      }
    }

    setSuccess(results);
    setErrors(errorResults);
    setLoading(false);
    
    if (results.length > 0) {
      setFiles([]);
    }
  };

  const clearResults = () => {
    setSuccess([]);
    setErrors([]);
  };

  return (
    <div>
      <div className="card-header">
        <span>📁</span>
        <h2 className="card-title">Upload de Fichiers</h2>
      </div>

      {/* Mode d'upload */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Mode d'upload :</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="radio"
              name="uploadMode"
              value="single"
              checked={uploadMode === 'single'}
              onChange={(e) => setUploadMode(e.target.value as 'single' | 'multiple')}
            />
            Upload unique
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="radio"
              name="uploadMode"
              value="multiple"
              checked={uploadMode === 'multiple'}
              onChange={(e) => setUploadMode(e.target.value as 'single' | 'multiple')}
            />
            Upload multiple
          </label>
        </div>
      </div>

      {/* Sélection de fichiers */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          📂 Sélectionner {uploadMode === 'single' ? 'un fichier' : 'des fichiers'} CSV :
        </label>
        <input
          type="file"
          multiple={uploadMode === 'multiple'}
          accept=".csv"
          onChange={handleFileSelect}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Liste des fichiers sélectionnés */}
      {files.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#2c3e50' }}>Fichiers sélectionnés :</h4>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {files.map((file, index) => (
              <div key={index} style={{ 
                padding: '0.5rem', 
                background: '#f8f9fa', 
                borderRadius: '6px',
                border: '1px solid #e9ecef',
                fontSize: '0.9rem'
              }}>
                📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={handleUpload}
          disabled={loading || files.length === 0}
          className="btn btn-primary"
        >
          {loading ? '🔄 Upload...' : '📤 Uploader'}
        </button>
        
        {(success.length > 0 || errors.length > 0) && (
          <button
            onClick={clearResults}
            className="btn btn-secondary"
          >
            🗑️ Effacer les résultats
          </button>
        )}
      </div>

      {/* Résultats */}
      {success.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#2c3e50' }}>✅ Succès :</h4>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {success.map((message, index) => (
              <div key={index} style={{ 
                padding: '0.75rem', 
                background: '#efe', 
                color: '#363',
                borderRadius: '6px',
                border: '1px solid #cfc',
                fontSize: '0.9rem'
              }}>
                {message}
              </div>
            ))}
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#2c3e50' }}>❌ Erreurs :</h4>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {errors.map((message, index) => (
              <div key={index} style={{ 
                padding: '0.75rem', 
                background: '#fee', 
                color: '#c33',
                borderRadius: '6px',
                border: '1px solid #fcc',
                fontSize: '0.9rem'
              }}>
                {message}
              </div>
            ))}
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
        <h4 style={{ marginBottom: '0.5rem', color: '#2c3e50' }}>📋 Format attendu :</h4>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Lotto :</strong> date,n1,n2,n3,n4,n5,n6,complementaire
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Euromillions :</strong> date,n1,n2,n3,n4,n5,e1,e2
        </div>
        <div style={{ fontSize: '0.8rem', color: '#888' }}>
          Exemple : 2024-01-15,12,23,34,45,6,7,8 (Lotto) ou 2024-01-15,12,23,34,45,6,7,8 (Euromillions)
        </div>
      </div>
    </div>
  );
};

export default FileUpload; 