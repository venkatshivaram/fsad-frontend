import { useAppContext } from '../context/AppContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useAppContext();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`group inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg shadow-slate-200/60 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:shadow-slate-950/40 dark:hover:border-indigo-500 dark:hover:text-indigo-300 ${className}`}
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-200 group-hover:rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-200 group-hover:-rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 7.5 9 9 0 1 1-9-7.5Z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
