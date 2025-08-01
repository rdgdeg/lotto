import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: '/', label: 'Accueil', icon: '🏠', color: 'purple' },
    { path: '/euromillions', label: 'Euromillions', icon: '🎰', color: 'blue' },
    { path: '/lotto', label: 'Lotto', icon: '🍀', color: 'green' }
  ];

  const getActiveColor = (color: string) => {
    switch (color) {
      case 'purple': return 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg';
      case 'blue': return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg';
      case 'green': return 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg';
      default: return 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg';
    }
  };

  const getHoverColor = (color: string) => {
    switch (color) {
      case 'purple': return 'hover:bg-purple-50 hover:text-purple-600';
      case 'blue': return 'hover:bg-blue-50 hover:text-blue-600';
      case 'green': return 'hover:bg-green-50 hover:text-green-600';
      default: return 'hover:bg-gray-50 hover:text-gray-600';
    }
  };

  return (
    <>
      {/* Navigation principale */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-lg border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                🎰
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Lotto Generator
                </span>
                <span className="text-xs text-gray-500 -mt-1">Pro</span>
              </div>
            </div>

            {/* Menu desktop */}
            <div className="hidden md:flex items-center space-x-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? getActiveColor(item.color)
                      : `text-gray-700 ${getHoverColor(item.color)}`
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Bouton mobile */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Menu"
              >
                <span className="text-gray-600 text-xl">
                  {isMobileMenuOpen ? '✕' : '☰'}
                </span>
              </button>
            </div>
          </div>

          {/* Menu mobile */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? getActiveColor(item.color)
                        : `text-gray-700 ${getHoverColor(item.color)}`
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Espace pour la navigation fixe */}
      <div className="h-16"></div>
    </>
  );
};

export default Navigation; 