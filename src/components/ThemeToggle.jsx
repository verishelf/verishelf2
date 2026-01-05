import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("verishelf-theme");
    return saved || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("verishelf-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const btnClass = theme === "light"
    ? "px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
    : "px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2";

  return (
    <button
      onClick={toggleTheme}
      className={btnClass}
      title="Toggle Theme"
    >
      {theme === "dark" ? (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Light
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          Dark
        </>
      )}
    </button>
  );
}

