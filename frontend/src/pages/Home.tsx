import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="App">
      {/* Navigation */}
      <nav className="nav-container">
        <div className="nav-content">
          <Link to="/" className="nav-logo">
            🎰 LOTTO MANAGER
          </Link>
          <ul className="nav-links">
            <li><Link to="/" className="nav-link active">Accueil</Link></li>
            <li><Link to="/lotto" className="nav-link">Lotto</Link></li>
            <li><Link to="/euromillions" className="nav-link">Euromillions</Link></li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-container">
        <div className="card fade-in-up">
          <div className="card-header">
            <span>🏠</span>
            <h1 className="card-title">Bienvenue sur LOTTO MANAGER</h1>
          </div>
          
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#666' }}>
            Votre application complète pour gérer et analyser les tirages du Lotto et d'Euromillions.
          </p>

          <div className="grid-container">
            {/* Lotto Card */}
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="card-header">
                <span>🍀</span>
                <h2 className="card-title">Lotto</h2>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <p><strong>6 numéros de 1 à 49</strong></p>
                <p><strong>1 numéro chance de 1 à 45</strong></p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Fonctionnalités :</h3>
                <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0 }}>
                  <li>🎲 Générateur avec stratégies avancées</li>
                  <li>📊 Statistiques rapides</li>
                  <li>📈 Historique complet</li>
                  <li>✏️ Encodage manuel</li>
                  <li>📁 Upload de fichiers</li>
                </ul>
              </div>

              <Link to="/lotto" className="btn btn-success">
                Accéder au Lotto
              </Link>
            </div>

            {/* Euromillions Card */}
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="card-header">
                <span>⭐</span>
                <h2 className="card-title">Euromillions</h2>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <p><strong>5 numéros de 1 à 50</strong></p>
                <p><strong>2 étoiles de 1 à 12</strong></p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Fonctionnalités :</h3>
                <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0 }}>
                  <li>🎲 Générateur avec stratégies avancées</li>
                  <li>📊 Statistiques rapides</li>
                  <li>📈 Historique complet</li>
                  <li>✏️ Encodage manuel</li>
                  <li>📁 Upload de fichiers</li>
                </ul>
              </div>

              <Link to="/euromillions" className="btn btn-primary">
                Accéder à Euromillions
              </Link>
            </div>
          </div>

          {/* Help Section */}
          <div className="card">
            <div className="card-header">
              <span>❓</span>
              <h2 className="card-title">Aide et Informations</h2>
            </div>
            
            <div className="grid-container">
              <div>
                <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>🎯 Stratégies de Génération</h3>
                <p>Chaque jeu propose des stratégies spécifiques pour générer des grilles optimisées selon différentes approches statistiques.</p>
              </div>
              
              <div>
                <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>📊 Statistiques</h3>
                <p>Consultez les numéros les plus fréquents, cliquez dessus pour voir leur historique complet de tirages.</p>
              </div>
              
              <div>
                <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>📈 Historique</h3>
                <p>Parcourez tous les tirages enregistrés avec des options de recherche et de filtrage avancées.</p>
              </div>
              
              <div>
                <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>📁 Import/Export</h3>
                <p>Importez vos données via fichiers CSV ou encodez manuellement les tirages un par un.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home; 