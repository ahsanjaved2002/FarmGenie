import { useEffect, useRef, useState } from "react";
import { Sprout, Sparkles, Send, Trash2 } from "lucide-react";
import { useSimpleFarmingChat } from "../hooks/useSimpleFarmingChat";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { VoiceButton } from "../components/VoiceButton";
import { ToastProvider } from "../hooks/use-toast";
import appLogo from "../images/appLogo.png";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";

const SimpleChatbot = () => {
  return (
    <ToastProvider>
      <SimpleChatbotContent />
    </ToastProvider>
  );
};

const SimpleChatbotContent = () => {
  const { t, i18n } = useTranslation("common");
  const currentLang = i18n.language;
  const { messages, sendMessage, isLoading, clearMessages } = useSimpleFarmingChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  
  // Voice input functionality
  const {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
    clearTranscript
  } = useVoiceInput();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]); // Only scroll when messages change, not when isLoading changes

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceTranscript = (transcriptText) => {
    // Append to existing input or replace if empty
    const newText = input.trim() ? `${input} ${transcriptText}` : transcriptText;
    setInput(newText);
    clearTranscript();
  };

  const handleVoiceStop = () => {
    stopListening();
    if (transcript.trim()) {
      handleVoiceTranscript(transcript);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-emerald-200 px-4 py-4 shadow-sm">
        <div className="container max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-2 rounded-xl">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {currentLang === 'ur' ? 'زرعی اسسٹنٹ' : 'Farming Assistant'}
              </h1>
              <p className="text-sm text-gray-600">
                {currentLang === 'ur' ? 'آپ کا ماہر زرعی رہنما' : 'Your expert farming guide'}
              </p>
            </div>
          </div>
          <button
            onClick={clearMessages}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border-2 border-emerald-200 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            <Trash2 className="h-4 w-4" />
            {currentLang === 'ur' ? 'باتیں صاف کریں' : 'Clear Chat'}
          </button>
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-12">
            {/* Hero Section */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-emerald-500 to-green-600 p-8 rounded-3xl shadow-2xl">
                <img
                  src={appLogo}
                  alt="FarmGenie"
                  className="h-20 w-auto bg-transparent object-contain filter drop-shadow-lg"
                />
              </div>
            </div>

            {/* Welcome Text */}
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-emerald-600 animate-pulse" />
                <h1 className="text-4xl leading-[1.5] font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                  {currentLang === 'ur' ? 'آپ کا زرعی اسسٹنٹ میں خوش آمدید' : 'Welcome to Your Farming Assistant'}
                </h1>
                <Sparkles className="h-6 w-6 text-emerald-600 animate-pulse" />
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                {currentLang === 'ur' 
                  ? 'میں کھیتی سے متعلق کچھ بھی بات کرنے کے لیے ہوں - آلات اور فصلوں سے لے کر زرعی زندگی کے کہانیاں بانٹنے تک۔ مجھ سے کچھ بھی پوچھیں!'
                  : "I'm here to chat about anything farming-related - from equipment and crops to just sharing stories about agricultural life. Ask me anything!"
                }
              </p>
            </div>

            {/* Suggestion Cards */}
            <div className="w-full max-w-3xl pt-6">
              <p className="text-sm font-medium text-gray-500 mb-4 flex items-center justify-center gap-2">
                <span className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300"></span>
                {currentLang === 'ur' ? 'یہ سوالات پوچھیں:' : 'Try asking about:'}
                <span className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300"></span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { 
                    text: currentLang === 'ur' ? 'السلام! آپ کیسے ہیں؟' : "Hi! How are you?", 
                    icon: "👋" 
                  },
                  { 
                    text: currentLang === 'ur' ? 'آپ میری مدد کیا کر سکتے ہیں؟' : "What can you help me with?", 
                    icon: "🤔" 
                  },
                  { 
                    text: currentLang === 'ur' ? 'مجھے جدید کھیتی کے بارے میں بتائیں' : "Tell me about modern farming", 
                    icon: "🚜" 
                  },
                  { 
                    text: currentLang === 'ur' ? 'کھیتی کا موسم کیسا چل رہا ہے؟' : "How's the farming season going?", 
                    icon: "🌾" 
                  },
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(example.text)}
                    className="group relative p-5 rounded-2xl border-2 border-emerald-200 bg-white hover:bg-gradient-to-br hover:from-emerald-50 hover:to-green-50 hover:border-emerald-400 transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-xl transform hover:-translate-y-1 overflow-hidden text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl group-hover:scale-125 transition-transform duration-300">
                        {example.icon}
                      </span>
                      <span className="flex-1 text-gray-700 group-hover:text-emerald-700">
                        {example.text}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 pr-4 overflow-y-auto" ref={scrollRef}>
            <div className="space-y-6 pb-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-4 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
                      <Sprout className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-2xl rounded-2xl p-4 ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                        : msg.isError
                        ? "bg-red-50 border border-red-200 text-red-800"
                        : "bg-white border-2 border-emerald-200 shadow-sm"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="text-sm font-medium">{msg.content}</p>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                    <div className="text-xs opacity-70 mt-2">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
                    <Sprout className="h-5 w-5 text-white animate-pulse" />
                  </div>
                  <div className="bg-white border-2 border-emerald-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="sticky bottom-0 rounded-2xl mt-6 pb-2">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-emerald-200 p-1">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={(e) => e.target.focus()} // Ensure focus works on laptop
                placeholder={currentLang === 'ur' 
                  ? 'مجھ سے کچھ بھی پوچھیں! کھیتی، آلات، فصلیں، یا صرف باتیں کریں...' 
                  : `Ask me anything! ${isSupported ? '(Type or use voice 🎤)' : '(Type your question)'}`
                }
                className="flex-1 px-4 py-3 bg-transparent outline-none text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 rounded-lg"
                disabled={isLoading}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              
              {/* Voice Button */}
              <VoiceButton
                isListening={isListening}
                isSupported={isSupported}
                onStartListening={startListening}
                onStopListening={handleVoiceStop}
                disabled={isLoading}
              />
              
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-3 rounded-xl hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
          
          {/* Voice Status Indicator */}
          {isListening && (
            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-red-600 animate-pulse">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              <span>Listening... Speak now</span>
            </div>
          )}
          
          {/* Voice Error Display */}
          {error && (
            <div className="flex items-center justify-center mt-2">
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default SimpleChatbot;
