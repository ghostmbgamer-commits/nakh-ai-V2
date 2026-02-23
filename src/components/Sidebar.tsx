import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, MessageSquare, Trash2, Settings, X, Edit3, Search } from 'lucide-react';
import { ChatSession } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  chats: ChatSession[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onOpenSettings: () => void;
  language: 'fa' | 'en' | 'auto';
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
  language
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const startEditing = (chat: ChatSession) => {
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const saveEditing = () => {
    if (editingId) {
      onRenameChat(editingId, editTitle);
      setEditingId(null);
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isPersian = language === 'fa';

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        className={cn(
          "fixed md:relative top-0 h-full w-[280px] bg-black border-white/5 z-50 flex flex-col transition-all duration-300 ease-in-out",
           "rtl:right-0 ltr:left-0 rtl:border-l ltr:border-r",
           !isOpen && "rtl:translate-x-full ltr:-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 md:overflow-hidden md:border-none"
        )}
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center relative overflow-hidden">
               {/* Custom SVG Logo based on user request */}
               <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="50" r="12" fill="black"/>
                  <circle cx="50" cy="50" r="12" fill="black"/>
                  <circle cx="80" cy="50" r="12" fill="black"/>
                  <path d="M20 50 C 20 20, 50 80, 50 50 C 50 20, 80 80, 80 50" stroke="black" strokeWidth="4" fill="none" />
               </svg>
            </div>
            <span className="font-black text-lg tracking-tighter uppercase text-white">
              {isPersian ? 'هوش مصنوعی نخ' : 'Nakh AI'}
            </span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-zinc-500 hover:text-white transition-colors">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-6 pb-4 space-y-3">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white text-black hover:bg-zinc-200 font-bold transition-all text-sm active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>{isPersian ? 'گفتگوی جدید' : 'New Chat'}</span>
          </button>

          {/* Search Bar */}
          <div className="relative">
            <input 
              type="text" 
              placeholder={isPersian ? 'جستجو...' : 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-lg py-2 px-9 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
            />
            <Search size={14} className="absolute top-2.5 left-3 text-zinc-600 rtl:right-3 rtl:left-auto" />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
          <div className="text-[10px] font-bold text-zinc-600 px-3 mb-4 uppercase tracking-[0.2em]">
            {isPersian ? 'تاریخچه' : 'History'}
          </div>
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "group flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all relative overflow-hidden",
                currentChatId === chat.id 
                  ? "bg-zinc-900 text-white" 
                  : "text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-200"
              )}
              onClick={() => {
                onSelectChat(chat.id);
                if (window.innerWidth < 768) setIsOpen(false);
              }}
            >
              <MessageSquare size={14} strokeWidth={1.5} className={cn("shrink-0", currentChatId === chat.id ? "text-white" : "opacity-40")} />
              
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
                <span className="text-xs truncate flex-1 font-medium">{chat.title}</span>
              )}

              {/* Hover Actions */}
              {!editingId && (
                <div className={cn(
                  "flex items-center gap-1 transition-opacity absolute bg-black/90 rounded p-1",
                  "rtl:left-2 ltr:right-2",
                  currentChatId === chat.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); startEditing(chat); }}
                    className="p-1 hover:text-white transition-colors"
                  >
                    <Edit3 size={12} strokeWidth={1} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                    className="p-1 hover:text-white transition-colors"
                  >
                    <Trash2 size={12} strokeWidth={1} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-zinc-500 hover:text-white transition-all"
          >
            <Settings size={16} strokeWidth={1} />
            <span className="font-bold text-xs uppercase tracking-widest">
              {isPersian ? 'تنظیمات' : 'Settings'}
            </span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};
