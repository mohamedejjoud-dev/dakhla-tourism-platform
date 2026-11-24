import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  X, 
  Send, 
  Maximize2, 
  Trash2, 
  AlertCircle, 
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    const handleOpenAi = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-dakhlin-ai', handleOpenAi);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-dakhlin-ai', handleOpenAi);
    };
  }, [isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading || rateLimited) return;
    const text = inputText;
    setInputText('');
    sendMessage(text);
  };

  return (
    <aside aria-label="El Haj AI Assistant" className="fixed bottom-3 end-3 sm:bottom-5 sm:end-5 z-40">
      
      {/* Floating Trigger Button (when closed) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-full bg-[#176B87] hover:bg-[#13586F] text-white shadow-md hover:shadow-lg hover:scale-102 active:scale-95 transition-all duration-200 border border-white/20"
          aria-label={t('nav.askAi', 'Ask El Haj')}
        >
          <div className="relative">
            <img 
              src="/images/elhaj-avatar.webp" 
              alt="El Haj" 
              className="w-7 h-7 sm:w-6 sm:h-6 rounded-full object-cover ring-1 ring-white/60 shadow-2xs" 
            />
            <span className="absolute -top-0.5 -end-0.5 w-2 h-2 rounded-full bg-[#35A7A0]" />
          </div>
          <span className="font-medium text-xs tracking-wide text-white hidden sm:inline pe-1">
            {t('nav.askAi', 'Ask El Haj')}
          </span>
        </button>
      )}

      {/* Floating Chat Drawer (when open) */}
      {isOpen && (
        <div 
          className="w-[92vw] sm:w-[380px] h-[500px] max-h-[calc(100dvh-4.5rem)] bg-white rounded-2xl shadow-xl border border-[#E8E5DE] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
          role="dialog"
          aria-label={t('assistant.name', 'El Haj')}
        >
          
          {/* Header - Always Sticky at the top */}
          <div className="p-3 bg-[#176B87] text-white flex items-center justify-between shadow-xs shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <img 
                src="/images/elhaj-avatar.webp" 
                alt="El Haj" 
                className="w-7 h-7 rounded-full object-cover border border-white/40 shadow-xs" 
              />
              <div>
                <h3 className="font-semibold text-xs tracking-wide text-white flex items-center gap-1.5 leading-none">
                  <span>{t('assistant.name', 'El Haj')}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#35A7A0] inline-block" />
                </h3>
                <p className="text-[10px] text-white/80 font-normal mt-0.5">
                  El Haj Concierge
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1">
              <Link
                to="/assistant"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title={t('assistant.expand')}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={clearChat}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title={t('assistant.clear')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-white bg-white/15 hover:bg-white/25 transition-colors focus:outline-none"
                title={t('assistant.collapse')}
                aria-label="Fermer le chat"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 space-y-3 bg-[#FCFBF8] text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <img 
                    src="/images/elhaj-avatar.webp" 
                    alt="L7aj" 
                    className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5 border border-[#E8E5DE]" 
                  />
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-2.5 sm:p-3 leading-relaxed font-normal ${
                    msg.role === 'user'
                      ? 'bg-[#176B87] text-white rounded-ee-sm shadow-2xs'
                      : 'bg-white text-[#1F2933] border border-[#E8E5DE] rounded-es-sm shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start">
                <img 
                  src="/images/elhaj-avatar.webp" 
                  alt="L7aj" 
                  className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5 border border-[#E8E5DE]" 
                />
                <div className="bg-white border border-[#E8E5DE] rounded-2xl rounded-es-sm p-2 flex items-center gap-1 text-[#667580]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#35A7A0] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#35A7A0] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#35A7A0] animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Rate Limit Alert */}
          {rateLimited && (
            <div className="p-2 mx-3 mb-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{t('assistant.rateLimitNotice', { seconds: retryAfter })}</span>
            </div>
          )}

          {/* Quick Prompts Chips */}
          <div className="px-3 py-1.5 bg-white border-t border-[#E8E5DE] flex items-center gap-1 overflow-x-auto scrollbar-none">
            {quickPrompts.map((p, idx) => {
              const Icon = p.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(p.label)}
                  disabled={loading || rateLimited}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#FCFBF8] hover:bg-[#F3E8D2]/40 text-[#1F2933] whitespace-nowrap border border-[#E8E5DE] transition-colors disabled:opacity-40"
                >
                  <Icon className="w-3 h-3 text-[#35A7A0]" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-[#E8E5DE] flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('assistant.placeholder')}
              disabled={loading || rateLimited}
              maxLength={400}
              className="flex-1 px-3 py-1.5 rounded-xl border border-[#E8E5DE] text-xs text-[#1F2933] focus:outline-none focus:ring-1 focus:ring-[#176B87] focus:border-[#176B87] disabled:bg-[#FCFBF8]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading || rateLimited}
              className="p-2 rounded-xl bg-[#176B87] hover:bg-[#13586F] text-white font-medium transition-colors disabled:opacity-40 shadow-xs"
              aria-label={t('assistant.send')}
            >
              <Send className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </form>

        </div>
      )}

    </aside>
  );
};
