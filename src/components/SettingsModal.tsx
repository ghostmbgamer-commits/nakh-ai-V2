import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings as SettingsIcon, Moon, Sun, Monitor, Globe, User, MessageSquare, Palette } from 'lucide-react';
import { Settings, PERSONAS } from '../types';
import { cn } from '../lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdateSettings: (newSettings: Settings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  if (!isOpen) return null;

  const isLight = settings.theme === 'light';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={cn(
            "w-full max-w-md border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]",
            isLight ? "bg-white border-black/10" : "bg-black border-white/10"
          )}
        >
          {/* Header */}
          <div className={cn(
            "flex items-center justify-between p-5 border-b",
            isLight ? "border-black/5" : "border-white/5"
          )}>
            <h2 className={cn(
              "text-[10px] font-black flex items-center gap-3 uppercase tracking-[0.3em]",
              isLight ? "text-black" : "text-white"
            )}>
              <SettingsIcon size={14} strokeWidth={2} />
              <span>Settings</span>
            </h2>
            <button 
              onClick={onClose} 
              className={cn(
                "p-2 rounded-full transition-colors active:scale-90",
                isLight ? "hover:bg-black/5 text-zinc-400" : "hover:bg-white/5 text-zinc-500"
              )}
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
            
            {/* Appearance */}
            <section>
              <h3 className="text-[9px] font-bold text-zinc-500 mb-3 uppercase tracking-[0.2em]">Appearance</h3>
              <div className={cn(
                "flex rounded-lg p-1 border",
                isLight ? "bg-zinc-100 border-black/5" : "bg-zinc-900/50 border-white/5"
              )}>
                {(['light', 'system', 'dark'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => onUpdateSettings({ ...settings, theme: t })}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all text-[9px] font-bold uppercase tracking-widest active:scale-95",
                      settings.theme === t 
                        ? (isLight ? "bg-white text-black shadow-sm" : "bg-white text-black")
                        : "text-zinc-500 hover:text-zinc-400"
                    )}
                  >
                    {t === 'light' && <Sun size={11} strokeWidth={2} />}
                    {t === 'dark' && <Moon size={11} strokeWidth={2} />}
                    {t === 'system' && <Monitor size={11} strokeWidth={2} />}
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* System Prompt */}
            <section>
              <h3 className="text-[9px] font-bold text-zinc-500 mb-3 uppercase tracking-[0.2em]">System Prompt</h3>
              <textarea
                value={settings.systemPrompt}
                onChange={(e) => onUpdateSettings({ ...settings, systemPrompt: e.target.value })}
                className={cn(
                  "w-full h-32 border rounded-xl p-4 text-[11px] focus:outline-none resize-none transition-all custom-scrollbar",
                  isLight ? "bg-zinc-50 border-black/5 focus:border-black/20 text-black" : "bg-zinc-900/50 border-white/5 focus:border-white/20 text-zinc-300"
                )}
                placeholder="Custom instruction (optional)..."
              />
            </section>

            {/* Accent Color */}
            <section>
              <h3 className="text-[9px] font-bold text-zinc-500 mb-3 uppercase tracking-[0.2em]">Accent Color</h3>
              <div className="flex flex-wrap gap-2">
                {['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#ffffff'].map((color) => (
                  <button
                    key={color}
                    onClick={() => onUpdateSettings({ ...settings, accentColor: color })}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all active:scale-90",
                      settings.accentColor === color ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </section>

             {/* Language */}
             <section>
              <h3 className="text-[9px] font-bold text-zinc-500 mb-3 uppercase tracking-[0.2em]">Language</h3>
              <div className="flex gap-1.5">
                 <button
                    onClick={() => onUpdateSettings({ ...settings, language: 'fa' })}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all active:scale-95",
                      settings.language === 'fa' 
                        ? (isLight ? "bg-black border-black text-white" : "bg-white border-white text-black")
                        : (isLight ? "bg-zinc-50 border-black/5 text-zinc-500" : "bg-zinc-900/30 border-white/5 text-zinc-400")
                    )}
                  >
                    فارسی
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ ...settings, language: 'en' })}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all active:scale-95",
                      settings.language === 'en' 
                        ? (isLight ? "bg-black border-black text-white" : "bg-white border-white text-black")
                        : (isLight ? "bg-zinc-50 border-black/5 text-zinc-500" : "bg-zinc-900/30 border-white/5 text-zinc-400")
                    )}
                  >
                    English
                  </button>
              </div>
            </section>

            {/* Donation */}
            <section>
              <h3 className="text-[9px] font-bold text-zinc-500 mb-3 uppercase tracking-[0.2em]">Support</h3>
              <a 
                href="https://coffeebede.com/megabyte" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full transition-opacity hover:opacity-90 active:scale-[0.98]"
              >
                <img 
                  className="w-full h-auto rounded-xl shadow-lg border border-white/5" 
                  src="https://coffeebede.ir/DashboardTemplateV2/app-assets/images/banner/default-yellow.svg" 
                  alt="Donate"
                />
              </a>
            </section>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
