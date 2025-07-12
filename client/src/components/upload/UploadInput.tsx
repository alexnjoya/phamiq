import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Send, Bot } from 'lucide-react';

interface UploadInputProps {
  selectedFiles: File[];
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onClear: () => void;
  onCameraCapture: () => void;
  onSend: () => void;
  isAnalyzing: boolean;
  multiSpectralMode: boolean;
  onToggleMultiSpectralMode: () => void;
}

const UploadInput: React.FC<UploadInputProps> = ({
  selectedFiles,
  onFileSelect,
  onDrop,
  onDragOver,
  onClear,
  onCameraCapture,
  onSend,
  isAnalyzing,
  multiSpectralMode,
  onToggleMultiSpectralMode,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fixed bottom-0 left-0 w-full md:left-24 md:w-[calc(100%-6rem)] z-30 flex justify-center" style={{ background: 'transparent', boxShadow: 'none', border: 'none' }}>
      <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl px-2 sm:px-4 md:px-6 py-4">
        <div className="relative">
          <div
            className="flex items-center w-full bg-white/80 rounded-2xl px-4 py-2 md:py-3 border-2 border-gray-300 focus-within:ring-2 focus-within:ring-gray-500 transition-all gap-2 md:gap-4 min-h-[56px] backdrop-blur"
            onDrop={onDrop}
            onDragOver={onDragOver}
            tabIndex={0}
            onKeyDown={selectedFiles.length > 0 && !isAnalyzing
              ? (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onSend();
                  }
                }
              : undefined
            }
          >
            {/* Thumbnails inside input if files are selected */}
            {selectedFiles.length > 0 && (
              <div className="flex items-center gap-2 mr-3 flex-shrink-0">
                {selectedFiles.slice(0, 3).map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={file.type.startsWith('image/') ? URL.createObjectURL(file) : '/placeholder.svg'}
                      alt={`Uploaded file ${index + 1}`}
                      className="w-8 h-8 object-cover rounded border border-gray-200"
                    />
                    {index === 2 && selectedFiles.length > 3 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                        <span className="text-white text-xs">+{selectedFiles.length - 3}</span>
                      </div>
                    )}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={e => { e.stopPropagation(); onClear(); }}
                  className="w-5 h-5 bg-white border border-gray-300 hover:bg-gray-50 p-0"
                  style={{ zIndex: 2 }}
                  tabIndex={-1}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            <Upload className="w-6 h-6 text-gray-400 flex-shrink-0" />
            <span
              className="flex-1 text-gray-500 text-sm md:text-base select-none text-left cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFiles.length > 0 
                ? `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} selected`
                : multiSpectralMode 
                  ? 'Upload multispectral data (.txt/.zip) or multiple files for analysis'
                  : 'Upload crop image for analysis'
              }
            </span>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors w-10 h-10 md:w-12 md:h-12"
              tabIndex={-1}
            >
              <Upload className="w-5 h-5 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onCameraCapture(); }}
              className="flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors w-10 h-10 md:w-12 md:h-12 ml-2"
              tabIndex={-1}
            >
              <Camera className="w-5 h-5 text-gray-700" />
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 text-gray-600 hover:bg-gray-50"
              title="Send"
              disabled={selectedFiles.length === 0}
              onClick={e => { e.stopPropagation(); onSend(); }}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          {/* Multi-spectral Analysis Toggle below input */}
          <div className="flex justify-center mt-3">
            <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-2 sm:p-3 border">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Multi-spectral Analysis</span>
              <button
                onClick={e => { e.stopPropagation(); onToggleMultiSpectralMode(); }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${multiSpectralMode ? 'bg-gray-600' : 'bg-gray-200'}`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${multiSpectralMode ? 'translate-x-5' : 'translate-x-1'}`}
                />
              </button>
              <span className="text-[10px] sm:text-xs text-gray-500">
                {multiSpectralMode ? 'Enhanced accuracy' : 'Standard mode'}
              </span>
            </div>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.txt,.zip,application/zip,application/x-zip-compressed,*/*"
          onChange={onFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default UploadInput; 