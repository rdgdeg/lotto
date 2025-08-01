import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Composants à créer
import Generator from '../components/Generator';
import QuickStats from '../components/QuickStats';
import DrawHistory from '../components/DrawHistory';
import ManualInput from '../components/ManualInput';
import FileUpload from '../components/FileUpload';
import HelpModal from '../components/HelpModal';

const Euromillions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generator' | 'stats' | 'history' | 'input' | 'upload'>('generator');
  const [showHelp, setShowHelp] = useState(false);

  const tabs = [
    { id: 'generator', label: '🎲 Générateur', icon: '🎲' },
    { id: 'stats', label: '📊 Stats Rapides', icon: '📊' },
    { id: 'history', label: '📈 Historique', icon: '📈' },
    { id: 'input', label: '✏️ Encodage', icon: '✏️' },
    { id: 'upload', label: '📁 Upload', icon: '📁' }
  ] as const;

  return (
    <div className="App">
      {/* Navigation */}
      <nav className="nav-container">
        <div className="nav-content">
          <Link to="/" className="nav-logo">
            🎰 LOTTO MANAGER
          </Link>
          <ul className="nav-links">
            <li><Link to="/" className="nav-link">Accueil</Link></li>
            <li><Link to="/lotto" className="nav-link">Lotto</Link></li>
            <li><Link to="/euromillions" className="nav-link active">Euromillions</Link></li>
            <li>
              <button 
                onClick={() => setShowHelp(true)}
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ❓ Aide
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-container">
        {/* Game Info Card */}
        <div className="card">
          <div className="card-header">
            <span>⭐</span>
            <h1 className="card-title">Euromillions</h1>
          </div>
          
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
            <div>
              <strong>5 numéros de 1 à 50</strong>
            </div>
            <div>
              <strong>2 étoiles de 1 à 12</strong>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ marginBottom: '0.5rem' }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="card">
          {activeTab === 'generator' && (
            <Generator gameType="euromillions" />
          )}
          
          {activeTab === 'stats' && (
            <QuickStats gameType="euromillions" />
          )}
          
          {activeTab === 'history' && (
            <DrawHistory gameType="euromillions" />
          )}
          
          {activeTab === 'input' && (
            <ManualInput gameType="euromillions" />
          )}
          
          {activeTab === 'upload' && (
            <FileUpload gameType="euromillions" />
          )}
        </div>
      </main>

      {/* Help Modal */}
      {showHelp && (
        <HelpModal 
          isOpen={showHelp} 
          onClose={() => setShowHelp(false)}
          gameType="euromillions"
        />
      )}
    </div>
  );
};

export default Euromillions; 