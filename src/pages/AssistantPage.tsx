import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Send, 
  Trash2, 
  AlertCircle, 
  Waves, 
  Fish, 
  SunMedium, 
  Compass, 
  ShieldCheck, 
  Sparkles
} from 'lucide-react';
import { useL7ajChat } from '@/hooks/useL7ajChat';
import { SeoMeta } from '@/components/seo/SeoMeta';

export const AssistantPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, loading, rateLimited, retryAfter, sendMessage, clearChat } = useL7ajChat();
  const isRtl = i18n.dir() === 'rtl';

  const topics = [
    { title: t('assistant.quickPromptKitesurf'), desc: 'Lagune, PK25, vent & écoles certifiées', icon: Waves },
    { title: t('assistant.quickPromptOysters'), desc: 'Parcs ostréicoles de Talhamar & dégustation', icon: Fish },
    { title: t('assistant.quickPromptDune'), desc: 'Merveille géologique & flamants roses', icon: SunMedium },
    { title: t('assistant.quickPromptPort'), desc: 'Mégaprojet façade atlantique & énergie', icon: Compass },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading || rateLimited) return;
    const text = inputText;
    setInputText('');
    sendMessage(text);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      <SeoMeta
        title="L7aj AI Concierge — Local Dakhla Expert"
        description={t('assistant.greeting')}
        canonicalPath="/assistant"
      />
      
      {/* Editorial Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-editorial border border-sand-300/20 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -end-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-5">
          <img 
            src="/images/elhaj-avatar.jpg" 
            alt="L7aj Concierge IA" 
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-xl" 
          />
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/10 text-emerald-300 text-[11px] font-mono font-bold border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>L7aj • Concierge Virtuel 24/7</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-sand-50">
              {t('assistant.name')}
            </h1>
            <p className="text-xs sm:text-sm text-sand-200/90 max-w-xl font-normal">
              {t('assistant.tagline')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={clearChat}
          className="relative z-10 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sand-100 text-xs font-semibold uppercase tracking-wider transition-colors border border-white/15"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t('assistant.clear')}</span>
        </button>
      </div>

      {/* Main Split Layout: Topics Sidebar + Chat Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar: Suggested Inquiries & Tips (4 Cols) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-sand-200/90 shadow-editorial space-y-5">
            <h3 className="font-serif font-bold text-lg text-ocean-950 flex items-center gap-2 pb-3 border-b border-sand-100">
              <Sparkles className="w-4 h-4 text-lagoon-600" />
              <span>Questions Suggérées</span>
            </h3>

            <div className="space-y-2.5">
              {topics.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendMessage(item.title)}
                    disabled={loading || rateLimited}
                    className="w-full text-start p-3.5 rounded-2xl border border-sand-200/80 bg-sand-50/50 hover:bg-sand-100 hover:border-sand-300 transition-all text-xs space-y-1 disabled:opacity-40 group"
                  >
                    <div className="flex items-center gap-2 font-bold text-ocean-950 group-hover:text-lagoon-700">
                      <Icon className="w-3.5 h-3.5 text-lagoon-600 shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 ps-5.5 font-light">
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-sand-100 text-xs text-slate-500 space-y-2">
              <div className="flex items-center gap-1.5 text-lagoon-700 font-bold font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>Source de Vérité Régionale</span>
              </div>
              <p className="leading-relaxed font-light text-[11px]">
                Les réponses de L7aj s'appuient strictement sur la géographie officielle et le catalogue de lieux vérifiés de Dakhla-Oued Ed-Dahab.
              </p>
            </div>
          </div>
        </aside>

        {/* Right Main Conversational Viewport (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-sand-200/90 shadow-editorial flex flex-col h-[650px] overflow-hidden">
          
          {/* Chat Messages Scrollable Box */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 bg-sand-25/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <img 
                    src="/images/elhaj-avatar.jpg" 
                    alt="L7aj" 
                    className="w-8 h-8 rounded-full object-cover shrink-0 shadow-xs border border-sand-300 mt-0.5" 
                  />
                )}
                
                <div
                  className={`max-w-[78%] rounded-2xl p-4 sm:p-5 leading-relaxed text-xs sm:text-sm shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-sand-50 rounded-ee-sm'
                      : 'bg-white text-slate-850 border border-sand-200/80 rounded-es-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap font-normal leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3.5 justify-start">
                <img 
                  src="/images/elhaj-avatar.jpg" 
                  alt="L7aj" 
                  className="w-8 h-8 rounded-full object-cover shrink-0 shadow-xs border border-sand-300 mt-0.5" 
                />
                <div className="bg-white border border-sand-200/90 rounded-2xl rounded-es-sm p-4 flex items-center gap-2 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-lagoon-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-lagoon-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-lagoon-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Rate Limit Alert */}
          {rateLimited && (
            <div className="p-3 mx-6 mb-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{t('assistant.rateLimitNotice', { seconds: retryAfter })}</span>
            </div>
          )}

          {/* Input Box Footer */}
          <form onSubmit={handleSend} className="p-4 sm:p-5 bg-white border-t border-sand-200/80 flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('assistant.placeholder')}
              disabled={loading || rateLimited}
              maxLength={400}
              className="flex-1 px-4 py-3 rounded-xl border border-sand-200/90 bg-sand-50/40 text-ocean-950 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lagoon-500/20 focus:border-lagoon-500 disabled:bg-sand-50 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading || rateLimited}
              className="px-6 py-3 rounded-xl bg-lagoon-600 hover:bg-lagoon-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all disabled:opacity-40 flex items-center gap-2 shrink-0"
            >
              <span>{t('assistant.send')}</span>
              <Send className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
