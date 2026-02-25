import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Menu, Send, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useChat } from './hooks/useChat';
import { Sidebar } from './components/Sidebar';
import { MessageBubble } from './components/MessageBubble';
import { SettingsModal } from './components/SettingsModal';
import { cn } from './lib/utils';

const SUGGESTIONS_POOL_FA = [
  'یک حقیقت جالب بگو',
  'یک شعر کوتاه از مولانا',
  'دستور پخت یک غذای سریع',
  'یک جوک بامزه',
  'ایده برای آخر هفته',
  'یک کتاب خوب معرفی کن',
  'خلاصه آخرین اخبار تکنولوژی',
  'یک معمای سخت',
  'روش‌های افزایش تمرکز',
  'یک داستان کوتاه ترسناک'
];

const SUGGESTIONS_POOL_EN = [
  'Tell me a fun fact',
  'A short poem by Rumi',
  'Quick recipe idea',
  'Tell me a joke',
  'Weekend activity idea',
  'Recommend a good book',
  'Latest tech news summary',
  'A hard riddle',
  'Tips for better focus',
  'A short horror story'
];

function App() {
  const {
    chats,
    currentChatId,
    createNewChat,
    deleteChat,
    updateChatTitle,
    sendMessage,
    editMessage,
    settings,
    setSettings,
    isLoading,
    setCurrentChatId
  } = useChat();

  // Sidebar closed by default on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Random suggestions
  const suggestions = useMemo(() => {
    const pool = settings.language === 'en' ? SUGGESTIONS_POOL_EN : SUGGESTIONS_POOL_FA;
    // Shuffle and pick 4
    return [...pool].sort(() => 0.5 - Math.random()).slice(0, 4);
  }, [settings.language, currentChatId]); // Refresh on new chat or language change

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentChat = chats.find(c => c.id === currentChatId);
  const messages = currentChat ? currentChat.messages : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSubmit = React.useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    
    sendMessage(input);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [input, isLoading, sendMessage]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const isLight = settings.theme === 'light';

  return (
    <div 
      className={cn(
        "flex h-screen w-full overflow-hidden font-sans transition-colors duration-500 select-none relative",
        isLight ? "bg-[#f4f4f5] text-zinc-900" : "bg-black text-white"
      )}
    >
      {/* Dynamic Background Glow */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000"
        style={{
          background: isLight 
            ? `radial-gradient(circle at 50% -20%, ${settings.accentColor}15, transparent 70%),
               radial-gradient(circle at 100% 100%, ${settings.accentColor}10, transparent 50%),
               linear-gradient(to bottom, #ffffff 0%, #f4f4f5 100%)`
            : `radial-gradient(circle at 50% -20%, ${settings.accentColor}10, transparent 70%),
               radial-gradient(circle at 100% 100%, ${settings.accentColor}05, transparent 50%)`
        }}
      />
      
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <Sidebar
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
            chats={chats}
            currentChatId={currentChatId}
            onNewChat={createNewChat}
            onSelectChat={(id) => { setCurrentChatId(id); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
            onDeleteChat={deleteChat}
            onRenameChat={updateChatTitle}
            onOpenSettings={() => setIsSettingsOpen(true)}
            language={settings.language}
            accentColor={settings.accentColor}
          />
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col h-full relative w-full overflow-hidden z-10 transition-all duration-300">
        
        {/* Top Bar */}
        <header className={cn(
          "h-14 md:h-16 flex items-center justify-between px-4 md:px-6 z-20 absolute top-0 left-0 right-0 transition-all duration-300",
          isLight ? "bg-white/40 border-black/5" : "bg-black/40 border-white/5",
          "backdrop-blur-xl border-b"
        )}>
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl transition-all active:scale-95 z-50 relative"
              style={{ color: isLight ? '#000' : '#fff', backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}
            >
              <Menu size={18} strokeWidth={1.5} />
            </button>
            <div className="flex flex-col">
              <span className="font-bold text-[10px] md:text-xs uppercase tracking-widest truncate max-w-[150px] md:max-w-[200px] opacity-80">
                {currentChat?.title || (settings.language === 'en' ? 'New Chat' : 'گفتگوی جدید')}
              </span>
            </div>
          </div>
          <div className="opacity-50" style={{ color: settings.accentColor }}>
            <Sparkles size={16} strokeWidth={1.5} />
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto pt-16 md:pt-20 pb-4 px-4 md:px-0 custom-scrollbar scroll-smooth overscroll-none">
          <div className="max-w-3xl mx-auto min-h-full flex flex-col">
            
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 md:p-8">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center mb-8 md:mb-10 animate-float relative">
                  {/* Glowing Thread Logo */}
                  <div 
                    className="absolute inset-0 blur-3xl rounded-full animate-pulse-glow opacity-30" 
                    style={{ backgroundColor: settings.accentColor }}
                  />
                  <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10" style={{ color: settings.accentColor }}>
                    <circle cx="20" cy="50" r="12" fill="currentColor"/>
                    <circle cx="50" cy="50" r="12" fill="currentColor"/>
                    <circle cx="80" cy="50" r="12" fill="currentColor"/>
                    <path d="M20 50 C 20 20, 50 80, 50 50 C 50 20, 80 80, 80 50" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter uppercase" style={{ color: isLight ? '#000' : '#fff' }}>
                  {settings.language === 'fa' ? 'هوش مصنوعی نخ' : 'Nakh AI'}
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl mt-12">
                   {suggestions.map((suggestion, i) => (
                      <button 
                        key={i}
                        onClick={() => sendMessage(suggestion)}
                        className={cn(
                          "p-4 rounded-[1.5rem] border transition-all text-xs font-bold uppercase tracking-widest text-right rtl:text-right ltr:text-left active:scale-[0.98] shadow-sm backdrop-blur-md group relative overflow-hidden",
                          isLight 
                            ? "bg-white/60 border-black/5 hover:bg-white/80 hover:border-black/10 text-zinc-800" 
                            : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-zinc-200"
                        )}
                        style={{ borderColor: `${settings.accentColor}15` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        <span className="relative z-10">{suggestion}</span>
                      </button>
                   ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 py-4 md:py-8 px-2 md:px-8">
                {messages.map((msg, idx) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isLast={idx === messages.length - 1}
                    onRetry={() => sendMessage(messages[messages.length - 2].content, true)}
                    onEdit={(content) => editMessage(currentChatId!, msg.id, content)}
                    language={settings.language}
                    accentColor={settings.accentColor}
                    theme={settings.theme}
                  />
                ))}
                {isLoading && (
                  <div className="flex justify-start w-full mb-10 px-4">
                     <div className="flex gap-4 items-center">
                        <div 
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md border",
                            isLight ? "bg-white border-black/5" : "bg-black border-white/10"
                          )}
                          style={{ color: settings.accentColor }}
                        >
                           <Sparkles size={14} strokeWidth={1.5} className="animate-spin-slow" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className={cn(
                            "text-[10px] font-bold opacity-50 uppercase tracking-widest",
                            isLight ? "text-zinc-500" : "text-zinc-400"
                          )}>
                            {settings.language === 'fa' ? 'در حال فکر کردن...' : 'Thinking...'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full animate-bounce" style={{ animationDelay: '0ms', backgroundColor: settings.accentColor }} />
                            <div className="w-1 h-1 rounded-full animate-bounce" style={{ animationDelay: '200ms', backgroundColor: settings.accentColor }} />
                            <div className="w-1 h-1 rounded-full animate-bounce" style={{ animationDelay: '400ms', backgroundColor: settings.accentColor }} />
                          </div>
                        </div>
                     </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className={cn(
          "p-4 md:p-8 z-20 pb-8 md:pb-12 transition-colors duration-500",
          isLight 
            ? "bg-gradient-to-t from-[#f4f4f5] via-[#f4f4f5] to-transparent" 
            : "bg-gradient-to-t from-black via-black to-transparent"
        )}>
          <div className="max-w-3xl mx-auto relative">
            <form 
              onSubmit={handleSubmit}
              className={cn(
                "relative flex items-end gap-2 border rounded-[2rem] p-2 transition-all duration-500 shadow-2xl backdrop-blur-xl",
                isLight ? "border-black/5" : "border-white/10"
              )}
              style={{ 
                backgroundColor: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.03)',
                boxShadow: `0 20px 40px -10px ${settings.accentColor}10`,
                borderColor: `${settings.accentColor}20`
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={settings.language === 'en' ? 'Message...' : 'پیام...'}
                className={cn(
                  "w-full bg-transparent border-none focus:ring-0 focus:outline-none resize-none max-h-32 md:max-h-48 py-4 px-6 text-sm custom-scrollbar outline-none ring-0",
                  isLight ? "placeholder:text-black/40 text-black" : "placeholder:text-white/40 text-white"
                )}
                rows={1}
                style={{ minHeight: '56px' }}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              <div className="pb-1 pr-1 rtl:pl-1 rtl:pr-0">
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-20 active:scale-90 shadow-lg",
                    isLight ? "text-white" : "text-black"
                  )}
                  style={{ backgroundColor: settings.accentColor, color: settings.accentColor === '#ffffff' ? '#000000' : '#ffffff' }}
                >
                  <Send size={20} strokeWidth={2.5} className={settings.language === 'fa' ? 'rotate-180' : ''} />
                </button>
              </div>
            </form>
          </div>
        </div>

      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />

    </div>
  );
}

export default App;
