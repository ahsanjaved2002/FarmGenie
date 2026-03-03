import React from 'react';
import { Mic, MicOff } from 'lucide-react';

export const VoiceButton = ({ 
  isListening, 
  isSupported, 
  onStartListening,
  onStopListening,
  disabled = false 
}) => {
  const handleClick = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  if (!isSupported) {
    return null; // Don't show anything if not supported
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
        isListening
          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/50'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isListening ? 'Click to stop recording' : 'Click to start voice input'}
    >
      {isListening ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </button>
  );
};
