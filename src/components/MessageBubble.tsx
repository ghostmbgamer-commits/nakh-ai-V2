import React from 'react';
import { motion } from 'motion/react';
import { Message } from '../types';
import { Copy, RefreshCw, Edit2, User, Bot } from 'lucide-react';
import { cn, formatTime } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
  onRetry: () => void;
  onEdit: (newContent: string) => void;
  language: 'fa' | 'en' | 'auto';
  accentColor?: string;
  theme: 'light' | 'dark' | 'system';
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLast, onRetry, onEdit, language, accentColor, theme }) => {
  const isUser = message.role === 'user';
  const isPersian = language === 'fa' || (language === 'auto' && /[\u0600-\u06FF]/.test(message.content));
  const [displayedContent, setDisplayedContent] = React.useState(isUser ? message.content : '');
  
  // Determine if we are effectively in light mode
  const isLight = theme === 'light'; // Simplified for now, system would need media query check but let's stick to explicit for styling logic

  React.useEffect(() => {
    if (isUser) {
      setDisplayedContent(message.content);
      return;
    }

    // Typing effect for assistant messages
    let i = 0;
    const speed = 10; // ms per character
    const content = message.content;
    
    // If it's not the last message, don't animate
    if (!isLast) {
      setDisplayedContent(content);
      return;
    }

    setDisplayedContent('');
    const timer = setInterval(() => {
      setDisplayedContent(content.slice(0, i + 1));
      i++;
      if (i >= content.length) clearInterval(timer);
    }, speed);

    return () => clearInterval(timer);
  }, [message.content, isUser, isLast]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  const cleanContent = displayedContent.replace(/\\u200c/g, '\u200c');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex w-full mb-6 group",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "flex max-w-[85%] md:max-w-[75%] gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        <div className={cn(
          "w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg backdrop-blur-sm border",
          isUser 
            ? (isLight ? "bg-white border-black/5" : "bg-zinc-900 border-white/10") 
            : (isLight ? "bg-white border-black/5" : "bg-black border-white/10")
        )}>
          {isUser ? (
            <User size={16} className={isLight ? "text-zinc-600" : "text-zinc-400"} />
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute inset-0 rounded-full opacity-20 animate-pulse-glow" style={{ backgroundColor: accentColor || '#06b6d4' }} />
              <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: accentColor || '#06b6d4' }}>
                <circle cx="20" cy="50" r="12" fill="currentColor"/>
                <circle cx="50" cy="50" r="12" fill="currentColor"/>
                <circle cx="80" cy="50" r="12" fill="currentColor"/>
                <path d="M20 50 C 20 20, 50 80, 50 50 C 50 20, 80 80, 80 50" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </div>
          )}
        </div>

        {/* Bubble */}
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <div 
            className={cn(
              "px-6 py-4 rounded-[2rem] text-sm leading-relaxed break-words relative shadow-2xl border transition-all select-text backdrop-blur-xl",
              isUser 
                ? "rounded-tr-sm" 
                : "rounded-tl-sm",
              isPersian ? "text-right" : "text-left",
              // Text Color Logic
              isLight 
                ? "text-zinc-900" 
                : (isUser ? "text-white" : "text-zinc-100")
            )} 
            dir={isPersian ? "rtl" : "ltr"}
            style={{ 
              // Background Logic: Both get accent tint, but different opacities
              backgroundColor: isUser 
                ? `${accentColor || '#06b6d4'}${isLight ? '15' : '20'}` // User: 15% (light) or 20% (dark)
                : `${accentColor || '#06b6d4'}${isLight ? '08' : '10'}`, // AI: 8% (light) or 10% (dark)
              
              // Border Logic
              borderColor: `${accentColor || '#06b6d4'}${isLight ? '20' : '30'}`,

              // Shadow Logic
              boxShadow: isUser 
                ? `0 10px 30px -10px ${accentColor || '#ffffff'}15` 
                : `0 10px 30px -10px ${accentColor || '#000000'}05` 
            }}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap">{cleanContent}</p>
            ) : (
              <div className={cn(
                "markdown-body prose prose-sm max-w-none",
                isLight ? "prose-zinc" : "prose-invert"
              )}>
                <ReactMarkdown>{cleanContent}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={cn(
            "flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold px-2",
            isUser ? "flex-row-reverse" : "flex-row",
            isLight ? "text-zinc-400" : "text-zinc-500"
          )}>
            <span className="opacity-50">{formatTime(message.timestamp)}</span>
            
            {!isUser && (
              <>
                <button onClick={copyToClipboard} className={cn("transition-colors flex items-center gap-1", isLight ? "hover:text-black" : "hover:text-white")}>
                  <Copy size={10} strokeWidth={2} />
                  {language === 'fa' ? 'کپی' : 'COPY'}
                </button>
                <button onClick={onRetry} className={cn("transition-colors flex items-center gap-1", isLight ? "hover:text-black" : "hover:text-white")}>
                  <RefreshCw size={10} strokeWidth={2} />
                  {language === 'fa' ? 'تلاش دوباره' : 'RETRY'}
                </button>
              </>
            )}
            
            {isUser && (
              <button onClick={() => onEdit(message.content)} className={cn("transition-colors flex items-center gap-1", isLight ? "hover:text-black" : "hover:text-white")}>
                <Edit2 size={10} strokeWidth={2} />
                {language === 'fa' ? 'ویرایش' : 'EDIT'}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
