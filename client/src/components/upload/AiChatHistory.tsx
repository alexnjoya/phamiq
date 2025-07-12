import React from 'react';

interface AiChatHistoryProps {
  aiChatMode: boolean;
  aiChatHistory: { role: 'user' | 'assistant'; content: string }[];
  aiLoading: boolean;
}

const AiChatHistory: React.FC<AiChatHistoryProps> = ({
  aiChatMode,
  aiChatHistory,
  aiLoading,
}) => {
  if (!aiChatMode) return null;

  return (
    <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-2 sm:px-4 md:px-6 pb-2">
      <div className="flex flex-col gap-3 mt-4">
        {aiChatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-2xl px-4 py-2 max-w-[80%] ${msg.role === 'user' ? 'bg-teal-100 text-gray-900' : 'bg-gray-100 text-gray-800'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {aiLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-2 max-w-[80%] bg-gray-100 text-gray-400 animate-pulse">AI is typing...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiChatHistory; 