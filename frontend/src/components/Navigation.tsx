import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../App';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: '/', label: 'Accueil', icon: '🏠', color: 'purple' },
    { path: '/euromillions', label: 'Euromillions', icon: '🎰', color: 'blue' },
    { path: '/lotto', label: 'Lotto', icon: '🍀', color: 'green' }
  ];

  const getItemColor = (color: string) => {
    switch (color) {
      case 'purple': return 'hover:bg-purple-50 hover:text-purple-600';
      case 'blue': return 'hover:bg-blue-50 hover:text-blue-600';
      case 'green': return 'hover:bg-green-50 hover:text-green-600';
      default: return 'hover:bg-gray-50 hover:text-gray-600';
    }
  };

  const getActiveColor = (color: string) => {
    switch (color) {
      case 'purple': return 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg';
      case 'blue': return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg';
      case 'green': return 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg';
      default: return 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg';
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white shadow-xl border-r border-gray-200 transition-all duration-300 z-50 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
              🎰
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Lotto
                </span>
                <span className="text-xs text-gray-500 -mt-1">Generator</span>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 group ${
                isActive(item.path)
                  ? getActiveColor(item.color)
                  : `text-gray-700 ${getItemColor(item.color)}`
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Collapse Button */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 flex items-center justify-center"
            aria-label={isCollapsed ? "Étendre le menu" : "Réduire le menu"}
          >
            <span className="text-gray-600">
              {isCollapsed ? '→' : '←'}
            </span>
          </button>
        </div>
      </div>

      {/* Top Bar for Mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 p-4 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              🎰
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Lotto Generator
            </span>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Menu"
          >
            <span className="text-gray-600">☰</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Navigation; 