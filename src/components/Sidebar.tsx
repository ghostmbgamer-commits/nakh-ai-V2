import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, MessageSquare, Trash2, Settings as SettingsIcon, X, Edit2, Search } from 'lucide-react';
import { ChatSession } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  chats: ChatSession[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onOpenSettings: () => void;
  language: 'fa' | 'en' | 'auto';
  accentColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setIsOpen,
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  onOpenSettings,
  language,
  accentColor
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEditStart = (e: React.MouseEvent, chat: ChatSession) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const saveEditing = () => {
    if (editingId && editTitle.trim()) {
      onRenameChat(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 h-full w-[280px] md:w-[320px] flex flex-col border-r border-white/5 bg-black/80 backdrop-blur-2xl shadow-2xl",
          "md:relative md:translate-x-0" // Reset transform on desktop if we want it always visible, but here we want it toggleable
        )}
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between gap-3">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 opacity-20 animate-pulse-glow" style={{ backgroundColor: accentColor || '#06b6d4' }} />
                 <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: accentColor || '#06b6d4' }}>
                    <circle cx="20" cy="50" r="12" fill="currentColor"/>
                    <circle cx="50" cy="50" r="12" fill="currentColor"/>
                    <circle cx="80" cy="50" r="12" fill="currentColor"/>
                    <path d="M20 50 C 20 20, 50 80, 50 50 C 50 20, 80 80, 80 50" stroke="currentColor" strokeWidth="8" fill="none" />
                  </svg>
              </div>
              <span className="font-black text-sm tracking-widest uppercase text-white">
                {language === 'fa' ? 'هوش مصنوعی نخ' : 'Nakh AI'}
              </span>
           </div>
           <button 
             onClick={() => setIsOpen(false)} 
             className="md:hidden p-2 text-zinc-500 hover:text-white transition-colors"
           >
             <X size={18} />
           </button>
        </div>

        {/* Search & New Chat */}
        <div className="p-4 space-y-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg group relative overflow-hidden"
            style={{ backgroundColor: accentColor || '#06b6d4', color: accentColor === '#ffffff' ? '#000000' : '#ffffff' }}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Plus size={16} strokeWidth={2.5} />
            <span className="relative z-10">{language === 'fa' ? 'گفتگوی جدید' : 'NEW CHAT'}</span>
          </button>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={14} />
            <input 
              type="text" 
              placeholder={language === 'fa' ? 'جستجو...' : 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-all"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-2 space-y-1">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={cn(
                "group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border border-transparent",
                currentChatId === chat.id 
                  ? "bg-white/5 border-white/5 shadow-lg" 
                  : "hover:bg-white/5 text-zinc-400 hover:text-zinc-200"
              )}
            >
              <MessageSquare size={16} className={cn(
                "shrink-0 transition-colors",
                currentChatId === chat.id ? "opacity-100" : "opacity-50 group-hover:opacity-100"
              )} style={{ color: currentChatId === chat.id ? (accentColor || '#fff') : undefined }} />
              
              {editingId === chat.id ? (
                <div className="flex items-center flex-1 gap-1" onClick={e => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-black border border-white/20 rounded px-2 py-1 text-xs focus:outline-none text-white"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && saveEditing()}
                    onBlur={saveEditing}
                  />
                </div>
              ) : (
                <div className="flex flex-col flex-1 min-w-0">
                  <span className={cn(
                    "text-xs truncate font-bold transition-colors",
                    currentChatId === chat.id ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                  )}>{chat.title}</span>
                  {searchQuery && chat.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase())) && (
                    <span className="text-[10px] text-zinc-600 truncate italic">
                      {chat.messages.find(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))?.content}
                    </span>
                  )}
                </div>
              )}

              {/* Hover Actions */}
              <div className={cn(
                "flex items-center gap-1 opacity-0 transition-opacity",
                (currentChatId === chat.id || editingId === chat.id) ? "opacity-100" : "group-hover:opacity-100"
              )}>
                <button
                  onClick={(e) => handleEditStart(e, chat)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                  className="p-1.5 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
          
          {filteredChats.length === 0 && (
            <div className="text-center py-8 text-zinc-600 text-xs">
              {language === 'fa' ? 'گفتگویی یافت نشد' : 'No chats found'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-zinc-400 hover:text-white group"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
               <SettingsIcon size={16} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-bold uppercase tracking-wider">{language === 'fa' ? 'تنظیمات' : 'Settings'}</span>
              <span className="text-[10px] text-zinc-600">Theme, Language, Prompt</span>
            </div>
          </button>
        </div>
      </motion.aside>
    </>
  );
};
