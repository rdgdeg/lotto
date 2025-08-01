import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Euromillions from './pages/Euromillions';
import Lotto from './pages/Lotto';

function App() {
  return (
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
  );
}

export default App;
