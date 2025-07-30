import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Euromillions from './pages/Euromillions';
import Lotto from './pages/Lotto';

// Contexte pour l'état de la sidebar
interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/euromillions" element={<Euromillions />} />
            <Route path="/lotto" element={<Lotto />} />
          </Routes>
        </div>
      </Router>
    </SidebarContext.Provider>
  );
}

export default App;
