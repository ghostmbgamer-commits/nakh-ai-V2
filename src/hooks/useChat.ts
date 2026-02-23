import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatSession, Message, Settings, DEFAULT_SETTINGS, HIDDEN_IDENTITY_PROMPT } from '../types';
import { generateId } from '../lib/utils';

const STORAGE_KEY_CHATS = 'nakh_chats_v1';
const STORAGE_KEY_SETTINGS = 'nakh_settings_v1';

export function useChat() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  // Load from storage
  useEffect(() => {
    const storedChats = localStorage.getItem(STORAGE_KEY_CHATS);
    const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    
    if (storedChats) {
      setChats(JSON.parse(storedChats));
    }
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    } else {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  // Save to storage
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(chats));
    }
  }, [chats]);

  // Apply Settings (Theme, Language, etc.)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    
    const root = window.document.documentElement;
    
    // Theme Logic
    root.classList.remove('dark', 'light');
    if (settings.theme === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
    } else {
      root.classList.add(settings.theme);
    }

    // Language/Direction Logic
    if (settings.language === 'fa') {
      root.setAttribute('lang', 'fa');
      root.setAttribute('dir', 'rtl');
      root.style.direction = 'rtl';
    } else if (settings.language === 'en') {
      root.setAttribute('lang', 'en');
      root.setAttribute('dir', 'ltr');
      root.style.direction = 'ltr';
    } else {
      root.setAttribute('lang', 'fa');
      root.setAttribute('dir', 'rtl');
      root.style.direction = 'rtl';
    }

  }, [settings]);

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const createNewChat = useCallback(() => {
    const newChat: ChatSession = {
      id: generateId(),
      title: settingsRef.current.language === 'en' ? 'New Chat' : 'گفتگوی جدید',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    return newChat.id;
  }, []);

  const deleteChat = useCallback((id: string) => {
    setChats(prev => prev.filter(c => c.id !== id));
    if (currentChatId === id) {
      setCurrentChatId(null);
    }
  }, [currentChatId]);

  const updateChatTitle = useCallback((id: string, title: string) => {
    setChats(prev => prev.map(c => c.id === id ? { ...c, title } : c));
  }, []);

  const clearHistory = useCallback(() => {
    setChats([]);
    setCurrentChatId(null);
    localStorage.removeItem(STORAGE_KEY_CHATS);
  }, []);

  const sendMessage = useCallback(async (content: string, isRetry = false) => {
    let chatId = currentChatId;
    if (!chatId) {
      chatId = createNewChat();
      // Auto-title for new chat based on first message (first 5 words)
      const title = content.split(' ').slice(0, 5).join(' ');
      updateChatTitle(chatId, title);
    } else {
      // If it's the first message in an existing empty chat (rare but possible)
      const currentChat = chats.find(c => c.id === chatId);
      if (currentChat && currentChat.messages.length === 0) {
        const title = content.split(' ').slice(0, 5).join(' ');
        updateChatTitle(chatId, title);
      }
    }

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now()
    };

    // Optimistic update
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: [...c.messages, userMsg],
          updatedAt: Date.now()
        };
      }
      return c;
    }));

    setIsLoading(true);

    try {
      const currentChat = chats.find(c => c.id === chatId) || { messages: [] };
      const history = currentChat.messages;

      // Prepare messages in the requested format
      // The user requested:
      // { "role": "user", "parts": [{ "text": systemPrompt }] },
      // ...previous messages...
      // { "role": "user", "parts": [{ "text": userMessage }] }

      const currentSettings = settingsRef.current;
      const finalSystemPrompt = `IMPORTANT: You are Nakh AI (هوش مصنوعی نخ). 
You MUST speak ONLY in Persian (فارسی). 
DO NOT use Arabic or English unless specifically asked to translate.
Use Persian characters (گ، چ، پ، ژ).
Tone: Natural, friendly, helpful.

User System Instruction: ${currentSettings.systemPrompt}

Identity & Rules:
${HIDDEN_IDENTITY_PROMPT}`;

      const apiMessages = [
        { role: 'user', parts: [{ text: finalSystemPrompt }] },
        ...history.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        { role: 'user', parts: [{ text: content }] }
      ];

      const requestBody = {
        messages: apiMessages
      };

      const response = await fetch('https://ai-proxy.ghostmbgamer.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error(`Server Error ${response.status}`);

      const data = await response.json();
      let aiContent = '';
      
      // Handle the response format from the worker (Gemma 3)
      if (Array.isArray(data)) {
        // Handle array of chunks (aggregated stream)
        aiContent = data
          .map((chunk: any) => chunk.candidates?.[0]?.content?.parts?.[0]?.text || '')
          .join('');
      } else if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        aiContent = data.candidates[0].content.parts[0].text;
      } else if (data.choices?.[0]?.message?.content) {
        aiContent = data.choices[0].message.content;
      } else if (typeof data.reply === 'string') {
        aiContent = data.reply;
      } else {
        aiContent = JSON.stringify(data);
      }

      const aiMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: aiContent,
        timestamp: Date.now()
      };

      setChats(prev => prev.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            messages: [...c.messages, aiMsg],
            updatedAt: Date.now()
          };
        }
        return c;
      }));

    } catch (error: any) {
      console.error('Failed to send message:', error);
      const errorMessage = settingsRef.current.language === 'en' 
        ? `Error: ${error.message || 'Connection failed'}` 
        : `خطا: ${error.message || 'اتصال برقرار نشد'}`;
        
      const errorMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: errorMessage,
        timestamp: Date.now()
      };
      setChats(prev => prev.map(c => (c.id === chatId ? { ...c, messages: [...c.messages, errorMsg] } : c)));
    } finally {
      setIsLoading(false);
    }
  }, [currentChatId, chats, createNewChat, updateChatTitle]);

  const editMessage = useCallback((chatId: string, msgId: string, newContent: string) => {
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        const msgIndex = c.messages.findIndex(m => m.id === msgId);
        if (msgIndex === -1) return c;
        return { ...c, messages: c.messages.slice(0, msgIndex) };
      }
      return c;
    }));
    sendMessage(newContent);
  }, [sendMessage]);

  return {
    chats,
    currentChatId,
    setCurrentChatId,
    createNewChat,
    deleteChat,
    updateChatTitle,
    clearHistory,
    sendMessage,
    editMessage,
    settings,
    setSettings,
    isLoading
  };
}
