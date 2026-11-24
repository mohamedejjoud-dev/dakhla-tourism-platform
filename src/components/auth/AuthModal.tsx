import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Mail, Lock, User, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultTab?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'signin',
}) => {
  const { t } = useTranslation();
  const { authModalOpen, closeAuthModal, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();

  const isModalOpen = isOpen !== undefined ? isOpen : authModalOpen;
  const handleClose = onClose || closeAuthModal;

  const [mode, setMode] = useState<'signin' | 'signup'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleClose();
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, handleClose]);

  if (!isModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setErrorMsg(error.message.includes('Invalid login') ? t('auth.errorInvalidCredentials') : error.message);
        } else {
          handleClose();
        }
      } else {
        if (!fullName.trim()) {
          setErrorMsg(t('auth.fullName') + ' required');
          setLoading(false);
          return;
        }
        const { error } = await signUpWithEmail(email, password, fullName);
        if (error) {
          setErrorMsg(error.message.includes('already registered') ? t('auth.errorEmailExists') : error.message);
        } else {
          handleClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-[#176B87]/60 backdrop-blur-sm flex items-start sm:items-center justify-center animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div 
        className="relative w-full max-w-md my-auto bg-white rounded-3xl shadow-xl border border-[#E8E5DE] max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Always at top end */}
        <button
          onClick={handleClose}
          className="absolute top-4 end-4 z-30 p-2 rounded-xl text-[#667580] hover:text-[#1F2933] hover:bg-[#FCFBF8] transition-colors focus:outline-none"
          aria-label="Close auth dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto overscroll-contain flex-1">

          {/* Modal Header */}
          <div className="p-8 pb-3 text-center space-y-3">
            <img 
              src="/images/logo-symbol.svg" 
              alt="Dakhlin" 
              className="w-12 h-14 object-contain mx-auto" 
            />
            <div>
              <h2 className="text-2xl font-bold text-[#1F2933] tracking-tight">
                {mode === 'signin' ? t('auth.signIn') : t('auth.signUp')}
              </h2>
              <p className="text-xs text-[#667580] uppercase tracking-wider font-semibold mt-1">
                Dakhlin • Espace Voyageur
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="px-8 pt-1">
            <div className="grid grid-cols-2 p-1 bg-[#FCFBF8] rounded-2xl text-xs font-semibold text-center border border-[#E8E5DE]">
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMsg(null); }}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'signin' 
                    ? 'bg-white text-[#176B87] shadow-2xs font-bold' 
                    : 'text-[#667580] hover:text-[#1F2933]'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('auth.signIn')}</span>
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(null); }}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'signup' 
                    ? 'bg-white text-[#176B87] shadow-2xs font-bold' 
                    : 'text-[#667580] hover:text-[#1F2933]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('auth.signUp')}</span>
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mx-8 mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 pt-5 space-y-4">
            
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F2933] uppercase tracking-wider font-mono">
                  {t('auth.fullName')}
                </label>
                <div className="relative">
                  <User className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667580]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Youssef El Alami"
                    className="w-full ps-11 pe-4 py-2.5 rounded-xl border border-[#E8E5DE] bg-[#FCFBF8] text-[#1F2933] text-sm focus:outline-none focus:ring-1 focus:ring-[#176B87] focus:border-[#176B87] transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1F2933] uppercase tracking-wider font-mono">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667580]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full ps-11 pe-4 py-2.5 rounded-xl border border-[#E8E5DE] bg-[#FCFBF8] text-[#1F2933] text-sm focus:outline-none focus:ring-1 focus:ring-[#176B87] focus:border-[#176B87] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1F2933] uppercase tracking-wider font-mono">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667580]" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full ps-11 pe-4 py-2.5 rounded-xl border border-[#E8E5DE] bg-[#FCFBF8] text-[#1F2933] text-sm focus:outline-none focus:ring-1 focus:ring-[#176B87] focus:border-[#176B87] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#176B87] hover:bg-[#13586F] text-white font-semibold text-xs tracking-wider uppercase shadow-xs transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? t('common.loading') : (mode === 'signin' ? t('auth.submitSignIn') : t('auth.submitSignUp'))}
            </button>
          </form>

          {/* Divider */}
          <div className="px-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E8E5DE]" />
            <span className="text-[11px] text-[#667580] font-mono uppercase tracking-widest">{t('auth.or')}</span>
            <div className="flex-1 h-px bg-[#E8E5DE]" />
          </div>

          {/* Google OAuth Button */}
          <div className="p-8 pt-4 pb-8">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-4 rounded-xl border border-[#E8E5DE] bg-white hover:bg-[#FCFBF8] text-[#1F2933] font-semibold text-xs flex items-center justify-center gap-2.5 shadow-xs transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{t('auth.googleSignIn')}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
