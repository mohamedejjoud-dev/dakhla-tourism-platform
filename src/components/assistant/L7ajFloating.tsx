import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  X, 
  Send, 
  Maximize2, 
  Trash2, 
  AlertCircle, 
  Bot, 
  Compass, 
  Waves, 
  Fish, 
  SunMedium 
} from 'lucide-react';
import { useL7ajChat } from '@/hooks/useL7ajChat';

export const L7ajFloating: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, loading, rateLimited, retryAfter, sendMessage, clearChat } = useL7ajChat();
  const isRtl = i18n.dir() === 'rtl';

  const quickPrompts = [
    { label: t('assistant.quickPromptKitesurf'), icon: Waves },
    { label: t('assistant.quickPromptOysters'), icon: Fish },
    { label: t('assistant.quickPromptDune'), icon: SunMedium },
    { label: t('assistant.quickPromptPort'), icon: Compass },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading || rateLimited) return;
    const text = inputText;
    setInputText('');
    sendMessage(text);
  };

  return (
    <aside aria-label="L7aj AI Assistant" className="fixed bottom-6 end-6 z-40">
      
      {/* Floating Trigger Button (when closed) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-ocean-900 via-lagoon-700 to-lagoon-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 border-2 border-white/20"
          aria-label={t('assistant.name')}
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-sand-300" />
            <span className="absolute -top-1 -end-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="absolute -top-1 -end-1 w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          </div>
          <div className="flex flex-col text-start">
            <span className="font-extrabold text-xs tracking-wide">
              {t('assistant.name')}
            </span>
            <span className="text-[10px] text-sand-200/90 hidden sm:inline">
              IA • Guide Local
            </span>
          </div>
        </button>
      )}

      {/* Floating Chat Drawer (when open) */}
      {isOpen && (
        <div 
          className="w-[90vw] sm:w-[380px] h-[540px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-sand-200/90 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
          role="dialog"
          aria-label={t('assistant.name')}
        >
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-ocean-900 to-lagoon-800 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-sand-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                  <span>{t('assistant.name')}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                </h3>
                <p className="text-[10px] text-sand-200/80">
                  Dakhla Local Concierge
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1">
              <Link
                to="/assistant"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-sand-200 hover:text-white hover:bg-white/10 transition-colors"
                title={t('assistant.expand')}
              >
                <Maximize2 className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={clearChat}
                className="p-1.5 rounded-lg text-sand-200 hover:text-white hover:bg-white/10 transition-colors"
                title={t('assistant.clear')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-sand-200 hover:text-white hover:bg-white/10 transition-colors"
                title={t('assistant.collapse')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-sand-50/40 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-ocean-900 text-sand-300 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-3 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-lagoon-600 text-white rounded-ee-sm shadow-sm'
                      : 'bg-white text-slate-850 border border-sand-200/90 rounded-es-sm shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-ocean-900 text-sand-300 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-sand-200/90 rounded-2xl rounded-es-sm p-3 flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-lagoon-500 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-lagoon-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-lagoon-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Rate Limit Alert */}
          {rateLimited && (
            <div className="p-2.5 mx-3 mb-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{t('assistant.rateLimitNotice', { seconds: retryAfter })}</span>
            </div>
          )}

          {/* Quick Prompts Chips */}
          <div className="px-3 py-2 bg-white border-t border-sand-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {quickPrompts.map((p, idx) => {
              const Icon = p.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(p.label)}
                  disabled={loading || rateLimited}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-sand-100 hover:bg-sand-200/80 text-slate-700 whitespace-nowrap transition-colors disabled:opacity-40"
                >
                  <Icon className="w-3 h-3 text-lagoon-600" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-sand-100 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('assistant.placeholder')}
              disabled={loading || rateLimited}
              maxLength={400}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-sand-200 text-xs focus:outline-none focus:ring-2 focus:ring-lagoon-500/20 focus:border-lagoon-500 disabled:bg-sand-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading || rateLimited}
              className="p-2.5 rounded-xl bg-lagoon-600 hover:bg-lagoon-500 text-white font-bold transition-colors disabled:opacity-40 shadow-sm"
              aria-label={t('assistant.send')}
            >
              <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </form>

        </div>
      )}

    </aside>
  );
};
