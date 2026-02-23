import React, { useState, useEffect, useRef } from 'react';
import { Menu, Send, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { useChat } from './hooks/useChat';
import { Sidebar } from './components/Sidebar';
import { MessageBubble } from './components/MessageBubble';
import { SettingsModal } from './components/SettingsModal';
import { cn } from './lib/utils';

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

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
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
    <div className={cn(
      "flex h-screen w-full overflow-hidden font-sans transition-colors duration-300 select-none",
      isLight ? "bg-white text-black" : "bg-black text-white"
    )}>
      
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
      />

      <main className="flex-1 flex flex-col h-full relative w-full overflow-hidden">
        
        {/* Top Bar */}
        <header className={cn(
          "h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b z-20 absolute top-0 left-0 right-0",
          isLight ? "bg-white/80 border-black/5" : "bg-black/80 border-white/5",
          "backdrop-blur-xl"
        )}>
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-zinc-500/10 rounded-lg transition-colors text-zinc-500 active:scale-95"
            >
              <Menu size={18} strokeWidth={1.5} />
            </button>
            <div className="flex flex-col">
              <span className="font-bold text-[10px] md:text-xs uppercase tracking-widest truncate max-w-[150px] md:max-w-[200px]">
                {currentChat?.title || (settings.language === 'en' ? 'New Chat' : 'گفتگوی جدید')}
              </span>
            </div>
          </div>
          <div className="text-zinc-500">
            <Sparkles size={16} strokeWidth={1.5} />
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto pt-16 md:pt-20 pb-4 px-4 md:px-0 custom-scrollbar scroll-smooth overscroll-none">
          <div className="max-w-3xl mx-auto min-h-full flex flex-col">
            
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 md:p-8">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-6 md:mb-8 animate-float relative">
                  {/* Glowing Thread Logo */}
                  <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse-glow" />
                  <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cyan-500 relative z-10">
                    <circle cx="20" cy="50" r="12" fill="currentColor"/>
                    <circle cx="50" cy="50" r="12" fill="currentColor"/>
                    <circle cx="80" cy="50" r="12" fill="currentColor"/>
                    <path d="M20 50 C 20 20, 50 80, 50 50 C 50 20, 80 80, 80 50" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tighter uppercase text-glow">
                  {settings.language === 'fa' ? 'هوش مصنوعی نخ' : 'Nakh AI'}
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 w-full max-w-xl mt-12">
                   {(settings.language === 'en' 
                     ? ['Instagram post ideas', 'React programming', 'Sci-fi short story', 'Psychology advice']
                     : ['ایده برای پست اینستاگرام', 'برنامه‌نویسی ری‌اکت', 'داستان کوتاه علمی تخیلی', 'مشاوره روانشناسی']
                   ).map((suggestion, i) => (
                      <button 
                        key={i}
                        onClick={() => sendMessage(suggestion)}
                        className={cn(
                          "p-3 md:p-4 rounded-xl border transition-all text-[10px] md:text-xs font-bold uppercase tracking-widest text-right rtl:text-right ltr:text-left active:scale-[0.98]",
                          isLight ? "bg-zinc-50 border-black/5 hover:bg-zinc-100 hover:border-cyan-500/30" : "bg-zinc-900/30 border-white/5 hover:bg-zinc-900/50 hover:border-cyan-500/30"
                        )}
                      >
                        {suggestion}
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
                  />
                ))}
                {isLoading && (
                  <div className="flex justify-start w-full mb-10">
                     <div className="flex gap-4">
                        <div className={cn(
                          "w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center",
                          isLight ? "bg-black text-white" : "bg-white text-black"
                        )}>
                           <Sparkles size={12} strokeWidth={1.5} className="animate-spin-slow" />
                        </div>
                        <div className="flex items-center gap-1.5 px-2">
                          <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                          <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
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
          "p-4 md:p-6 z-20",
          isLight ? "bg-white" : "bg-black"
        )}>
          <div className="max-w-3xl mx-auto relative">
            <form 
              onSubmit={handleSubmit}
              className={cn(
                "relative flex items-end gap-2 border rounded-xl p-1 transition-all duration-300",
                isLight ? "bg-zinc-50 border-black/10 focus-within:border-black" : "bg-zinc-900/50 border-white/10 focus-within:border-white"
              )}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={settings.language === 'en' ? 'Message...' : 'پیام...'}
                className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 md:max-h-48 py-3 px-4 text-sm placeholder:text-zinc-600 custom-scrollbar"
                rows={1}
                style={{ minHeight: '44px' }}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              <div className="pb-1 pr-1 rtl:pl-1 rtl:pr-0">
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "p-2.5 rounded-lg transition-all disabled:opacity-20 active:scale-90",
                    isLight ? "bg-black text-white" : "bg-white text-black"
                  )}
                >
                  <Send size={16} strokeWidth={2} className={settings.language === 'fa' ? 'rotate-180' : ''} />
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
