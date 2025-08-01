import React from 'react';

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

const MainContent: React.FC<MainContentProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={`min-h-screen transition-all duration-300 main-content-wrapper ${className}`}
      style={{
        paddingTop: '1rem',
        paddingBottom: '1.5rem',
        paddingLeft: '1rem',
        paddingRight: '1rem'
      }}
    >
      {children}
    </div>
  );
};

export default MainContent; 