import React, { useState, useEffect } from 'react';

interface StatisticsUpdateNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  message: string;
  type: 'success' | 'info' | 'warning';
}

const StatisticsUpdateNotification: React.FC<StatisticsUpdateNotificationProps> = ({
  isVisible,
  onClose,
  message,
  type
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-fermeture après 5 secondes

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`max-w-sm w-full border rounded-lg shadow-lg p-4 ${getTypeStyles()}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-2xl">{getIcon()}</span>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <span className="sr-only">Fermer</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsUpdateNotification; 