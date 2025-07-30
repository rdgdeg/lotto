import React from 'react';

interface ContextualHelpProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}

const ContextualHelp: React.FC<ContextualHelpProps> = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">❓ {title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="text-gray-700">
          {content}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContextualHelp; 