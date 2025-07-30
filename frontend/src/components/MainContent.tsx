import React from 'react';
import { useSidebar } from '../App';

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

const MainContent: React.FC<MainContentProps> = ({ children, className = '' }) => {
  const { isCollapsed } = useSidebar();

  return (
    <div 
      className={`min-h-screen transition-all duration-300 main-content-wrapper ${className}`}
      style={{
        marginLeft: isCollapsed ? '4rem' : '16rem',
        paddingTop: '1.5rem',
        paddingBottom: '1.5rem',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem'
      }}
    >
      {children}
    </div>
  );
};

export default MainContent; 