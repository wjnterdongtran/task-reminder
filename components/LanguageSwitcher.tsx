'use client';

import { useTranslation } from '@/contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-400 font-mono tracking-wider">
        {t('common.language')}
      </span>
      <div className="relative inline-flex bg-slate-800/50 rounded-lg p-1 border border-slate-700/50 backdrop-blur-sm">
        <button
          onClick={() => setLocale('en')}
          className={`
            relative px-3 py-1.5 text-sm font-medium transition-all duration-300 rounded-md
            ${
              locale === 'en'
                ? 'text-white bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }
          `}
        >
          EN
        </button>
        <button
          onClick={() => setLocale('vi')}
          className={`
            relative px-3 py-1.5 text-sm font-medium transition-all duration-300 rounded-md
            ${
              locale === 'vi'
                ? 'text-white bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }
          `}
        >
          VI
        </button>
      </div>
    </div>
  );
}
