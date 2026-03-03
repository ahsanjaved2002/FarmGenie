import React from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

export const VoiceInput = ({ 
  isListening, 
  transcript, 
  isSupported, 
  error,
  onStartListening,
  onStopListening,
  onTranscriptComplete,
  disabled = false 
}) => {
  const handleClick = () => {
    if (isListening) {
      onStopListening();
      if (transcript.trim()) {
        onTranscriptComplete(transcript.trim());
      }
    } else {
      onStartListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
        <Volume2 className="h-4 w-4 text-yellow-600" />
        <span className="text-xs text-yellow-700">Voice not supported</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Voice Input Button */}
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/50'
            : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isListening ? 'Click to stop recording' : 'Click to start voice input'}
      >
        {isListening ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </button>

      {/* Voice Status Indicator */}
      {isListening && (
        <div className="flex items-center gap-2 text-xs text-red-600 animate-pulse">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
          <span>Listening...</span>
        </div>
      )}

      {/* Transcript Display */}
      {transcript && (
        <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-700 italic">"{transcript}"</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Instructions */}
      {!isListening && !transcript && !error && (
        <div className="text-xs text-gray-500 text-center">
          Click to speak
        </div>
      )}
      
      {/* Success message when transcript is ready */}
      {!isListening && transcript && !error && (
        <div className="text-xs text-green-600 text-center">
          Text added to input ✓
        </div>
      )}
    </div>
  );
};
