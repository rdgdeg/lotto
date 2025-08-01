import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Lotto from './pages/Lotto';
import Euromillions from './pages/Euromillions';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lotto" element={<Lotto />} />
          <Route path="/euromillions" element={<Euromillions />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
