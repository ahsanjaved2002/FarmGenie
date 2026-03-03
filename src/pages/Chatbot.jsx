import { useEffect, useRef } from "react";
import { Sprout, Sparkles } from "lucide-react";
import ChatMessage from "../chatbot/components/ChatMessage";
import ChatInput from "../chatbot/components/ChatInput";
import { useSimpleFarmingChat } from "../chatbot/hooks/useSimpleFarmingChat";
import { ScrollArea } from "../chatbot/components/ui/scroll-area";
import appLogo from "../images/appLogo.png";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation("common");
  const {
    messages,
    sendMessage,
    isLoading,
  } = useSimpleFarmingChat();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Auto-scroll during generation
  useEffect(() => {
    let scrollInterval;
    if (isLoading && scrollRef.current) {
      scrollInterval = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100); // Scroll every 100ms during generation
    }

    return () => {
      if (scrollInterval) {
        clearInterval(scrollInterval);
      }
    };
  }, [isLoading]);

  const handleRegenerate = (messageIndex) => {
    regenerateAt(messageIndex);
  };

  const handleEdit = (messageIndex, newContent) => {
    editAndRegenerate(messageIndex, newContent);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-green-50">
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
                  alt={t("appName")}
                  className="h-20 w-auto bg-transparent object-contain filter drop-shadow-lg"
                />
              </div>
            </div>

            {/* Welcome Text */}
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-emerald-600 animate-pulse" />
                <h1 className="text-4xl leading-[1.5] font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                  {t("chatHeroTitle")}
                </h1>
                <Sparkles className="h-6 w-6 text-emerald-600 animate-pulse" />
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t("chatHeroSubtitle")}
              </p>
            </div>

            {/* Suggestion Cards */}
            <div className="w-full max-w-3xl pt-6">
              <p className="text-sm font-medium text-gray-500 mb-4 flex items-center justify-center gap-2">
                <span className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300"></span>
                {t("chatTryAsking")}
                <span className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300"></span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    key: "chatExample1",
                    icon: "🌱",
                  },
                  {
                    key: "chatExample2",
                    icon: "🔄",
                  },
                  {
                    key: "chatExample3",
                    icon: "🐛",
                  },
                  {
                    key: "chatExample4",
                    icon: "💧",
                  },
                ].map((example) => (
                  <button
                    key={example.key}
                    onClick={() => sendMessage(t(example.key))}
                    className="group relative p-5 rounded-2xl border-2 border-emerald-200 bg-white hover:bg-gradient-to-br hover:from-emerald-50 hover:to-green-50 hover:border-emerald-400 transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-xl transform hover:-translate-y-1 overflow-hidden text-left rtl:text-right"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl group-hover:scale-125 transition-transform duration-300">
                        {example.icon}
                      </span>
                      <span className="flex-1 text-gray-700 group-hover:text-emerald-700">
                        {t(example.key)}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rtl:origin-right"></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-6 pb-4">
              {messages.map((msg, idx) => {
                const isAssistant = msg.role === "assistant";
                const selectedContent = msg.versions[msg.currentVersionIndex];

                // Show typing indicator for empty assistant messages (during regeneration)
                if (
                  isAssistant &&
                  (!selectedContent || selectedContent.trim() === "")
                ) {
                  return (
                    <div
                      key={idx}
                      className="flex gap-4 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 shadow-sm"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
                        <Sprout className="h-5 w-5 text-white animate-pulse" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <p className="text-sm font-semibold text-emerald-700">
                          Farm Expert
                        </p>
                        <div className="flex gap-2">
                          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    </div>
                  );
                }

                const versionInfo =
                  msg.versions.length > 1
                    ? {
                        current: msg.currentVersionIndex + 1,
                        total: msg.versions.length,
                        onPrev: () => changeVersion(idx, "prev"),
                        onNext: () => changeVersion(idx, "next"),
                      }
                    : undefined;

                return (
                  <ChatMessage
                    key={idx}
                    role={msg.role}
                    content={selectedContent}
                    isGenerating={
                      isLoading && idx === messages.length - 1 && isAssistant
                    }
                    onRegenerate={
                      isAssistant ? () => handleRegenerate(idx) : undefined
                    }
                    onEdit={
                      msg.role === "user"
                        ? (newContent) => handleEdit(idx, newContent)
                        : undefined
                    }
                    versionInfo={versionInfo}
                  />
                );
              })}
              {isLoading &&
                messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex gap-4 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
                      <Sprout className="h-5 w-5 text-white animate-pulse" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="text-sm font-semibold text-emerald-700">
                        Farm Expert
                      </p>
                      <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </ScrollArea>
        )}

        {/* Input Area */}
        <div className="sticky bottom-0 rounded-2xl  mt-6 pb-2">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-emerald-200 p-1">
            <ChatInput onSend={sendMessage} disabled={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
