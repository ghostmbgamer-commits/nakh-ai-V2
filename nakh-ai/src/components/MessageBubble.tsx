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
  onEdit: (content: string) => void;
  language: 'fa' | 'en' | 'auto';
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLast, onRetry, onEdit, language }) => {
  const isUser = message.role === 'user';
  const isPersian = language === 'fa' || (language === 'auto' && /[\u0600-\u06FF]/.test(message.content));
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  const cleanContent = message.content.replace(/\\u200c/g, '\u200c');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex w-full mb-8 group",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "flex max-w-[90%] md:max-w-[85%] gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-colors",
          isUser 
            ? "bg-zinc-900 border-white/5 text-zinc-400" 
            : "bg-cyan-500/10 border-cyan-500/20 text-cyan-500"
        )}>
          {isUser ? <User size={14} strokeWidth={1.5} /> : <Bot size={14} strokeWidth={1.5} />}
        </div>

        {/* Bubble */}
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <div className={cn(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed break-words relative shadow-sm border transition-all select-text",
            isUser 
              ? "bg-zinc-900 text-white border-white/5 rounded-tr-none" 
              : "bg-zinc-900/50 backdrop-blur-md text-zinc-100 border-white/10 rounded-tl-none shadow-md",
            isPersian ? "text-right" : "text-left"
          )} dir={isPersian ? "rtl" : "ltr"}>
            {isUser ? (
              <p className="whitespace-pre-wrap">{cleanContent}</p>
            ) : (
              <div className="markdown-body prose prose-sm prose-invert max-w-none">
                <ReactMarkdown>{cleanContent}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={cn(
            "flex items-center gap-3 text-[10px] text-zinc-400 uppercase tracking-widest font-bold px-1",
            isUser ? "flex-row-reverse" : "flex-row"
          )}>
            <span className="opacity-50">{formatTime(message.timestamp)}</span>
            
            {!isUser && (
              <>
                <button onClick={copyToClipboard} className="hover:text-cyan-500 transition-colors flex items-center gap-1">
                  <Copy size={10} strokeWidth={2} />
                  {language === 'fa' ? 'کپی' : 'COPY'}
                </button>
                <button onClick={onRetry} className="hover:text-cyan-500 transition-colors flex items-center gap-1">
                  <RefreshCw size={10} strokeWidth={2} />
                  {language === 'fa' ? 'تلاش دوباره' : 'RETRY'}
                </button>
              </>
            )}

            {isUser && isLast && (
              <button onClick={() => onEdit(message.content)} className="hover:text-white transition-colors flex items-center gap-1">
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
