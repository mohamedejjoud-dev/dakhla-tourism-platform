import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bot, 
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
    { title: t('assistant.quickPromptKitesurf'), desc: 'Lagune, PK25, vent & écoles', icon: Waves },
    { title: t('assistant.quickPromptOysters'), desc: 'Parcs ostréicoles & dégustation', icon: Fish },
    { title: t('assistant.quickPromptDune'), desc: 'Merveille géologique & flamants', icon: SunMedium },
    { title: t('assistant.quickPromptPort'), desc: 'Mégaprojet façade atlantique', icon: Compass },
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <SeoMeta
        title="L7aj AI Concierge — Local Dakhla Expert"
        description={t('assistant.greeting')}
        canonicalPath="/assistant"
      />
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-ocean-950 via-ocean-900 to-lagoon-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lagoon-500 to-ocean-700 flex items-center justify-center text-white shadow-lg border border-white/20">
            <Bot className="w-9 h-9 text-sand-200" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-300 text-xs font-bold border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>L7aj • Concierge Virtuel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t('assistant.name')}
            </h1>
            <p className="text-sm text-sand-200 max-w-xl">
              {t('assistant.tagline')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={clearChat}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sand-100 text-xs font-bold transition-colors border border-white/20"
        >
          <Trash2 className="w-4 h-4" />
          <span>{t('assistant.clear')}</span>
        </button>
      </div>

      {/* Main Split Layout: Topics Sidebar + Chat Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar: Suggested Inquiries & Tips */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-sand-200/90 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-ocean-900 flex items-center gap-1.5 pb-2 border-b border-sand-100">
              <Sparkles className="w-4 h-4 text-lagoon-600" />
              <span>Questions Suggérées</span>
            </h3>

            <div className="space-y-2">
              {topics.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendMessage(item.title)}
                    disabled={loading || rateLimited}
                    className="w-full text-start p-3 rounded-xl border border-sand-200 bg-sand-50/50 hover:bg-lagoon-50/70 hover:border-lagoon-300 transition-all text-xs space-y-1 disabled:opacity-40 group"
                  >
                    <div className="flex items-center gap-2 font-bold text-ocean-900 group-hover:text-lagoon-700">
                      <Icon className="w-3.5 h-3.5 text-lagoon-600 shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 ps-5.5">
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-sand-100 text-[11px] text-slate-500 space-y-2">
              <div className="flex items-center gap-1.5 text-lagoon-700 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Source de Vérité</span>
              </div>
              <p className="leading-relaxed">
                Les recommandations de L7aj s'appuient strictement sur le catalogue des lieux vérifiés et les données officielles de la région Dakhla-Oued Ed-Dahab.
              </p>
            </div>
          </div>
        </aside>

        {/* Right Main Conversational Viewport */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-sand-200/90 shadow-sm flex flex-col h-[650px] overflow-hidden">
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-sand-50/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-ocean-900 text-sand-300 flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl p-4 leading-relaxed text-sm ${
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
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-ocean-900 text-sand-300 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-sand-200/90 rounded-2xl rounded-es-sm p-4 flex items-center gap-2 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-lagoon-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-lagoon-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-lagoon-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Rate Limit Alert */}
          {rateLimited && (
            <div className="p-3 mx-4 mb-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{t('assistant.rateLimitNotice', { seconds: retryAfter })}</span>
            </div>
          )}

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-sand-200 flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('assistant.placeholder')}
              disabled={loading || rateLimited}
              maxLength={400}
              className="flex-1 px-4 py-3 rounded-2xl border border-sand-200 text-sm focus:outline-none focus:ring-2 focus:ring-lagoon-500/20 focus:border-lagoon-500 disabled:bg-sand-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading || rateLimited}
              className="px-6 py-3 rounded-2xl bg-lagoon-600 hover:bg-lagoon-500 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              <span>{t('assistant.send')}</span>
              <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
