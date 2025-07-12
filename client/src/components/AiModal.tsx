import React from 'react';

interface AiModalProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

const AiModal: React.FC<AiModalProps> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 z-50 transition-opacity" onClick={onClose} />
      {/* Modal panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 rounded-l-2xl flex flex-col animate-slide-in">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-full focus:outline-none">
            <span className="sr-only">Close</span>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto scrollbar-hide">
          {children || <div className="text-gray-700">More queries coming soon!</div>}
        </div>
      </div>
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </>
  );
};

export default AiModal; 