"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type VocabTheme = "light" | "dark";

interface VocabularyThemeContextType {
    theme: VocabTheme;
    toggleTheme: () => void;
    isDark: boolean;
}

const VocabularyThemeContext = createContext<VocabularyThemeContextType | undefined>(undefined);

export function VocabularyThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<VocabTheme>("light");

    // Load theme preference from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("vocab-theme") as VocabTheme;
        if (saved) {
            setTheme(saved);
        }
    }, []);

    // Save theme preference to localStorage
    useEffect(() => {
        localStorage.setItem("vocab-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    return (
        <VocabularyThemeContext.Provider
            value={{
                theme,
                toggleTheme,
                isDark: theme === "dark",
            }}
        >
            {children}
        </VocabularyThemeContext.Provider>
    );
}

export function useVocabularyTheme() {
    const context = useContext(VocabularyThemeContext);
    if (!context) {
        throw new Error("useVocabularyTheme must be used within a VocabularyThemeProvider");
    }
    return context;
}

/**
 * Theme toggle switch component
 */
export function VocabThemeToggle({ className = "" }: { className?: string }) {
    const { theme, toggleTheme, isDark } = useVocabularyTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`relative inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                isDark
                    ? "bg-graphite text-cream border border-ash"
                    : "bg-paper text-ink border border-stone"
            } ${className}`}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {/* Sun icon */}
            <svg
                className={`w-4 h-4 transition-all duration-300 ${
                    isDark ? "text-ash" : "text-amber-500"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                />
            </svg>

            {/* Toggle track */}
            <div
                className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${
                    isDark ? "bg-charcoal" : "bg-stone"
                }`}
            >
                {/* Toggle knob */}
                <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 shadow-sm ${
                        isDark
                            ? "left-5.5 bg-cream translate-x-0.5"
                            : "left-0.5 bg-white"
                    }`}
                />
            </div>

            {/* Moon icon */}
            <svg
                className={`w-4 h-4 transition-all duration-300 ${
                    isDark ? "text-cream" : "text-ash"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
        </button>
    );
}
