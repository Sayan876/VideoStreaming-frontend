import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";

    setIsAnimating(true);

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);

    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    document.startViewTransition(() => {
      setTheme(newTheme);
    });
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors duration-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    >
      <div className="relative flex h-[18px] w-[18px] items-center justify-center">
        <Sun
          size={18}
          strokeWidth={1.8}
          className={`absolute transition-all duration-500 ${
            theme === "dark"
              ? "scale-0 opacity-0"
              : "scale-100 opacity-100"
          } ${
            isAnimating ? "animate-[spin_500ms_ease-in-out]" : ""
          }`}
        />

        <Moon
          size={18}
          strokeWidth={1.8}
          className={`absolute transition-all duration-500 ${
            theme === "dark"
              ? "scale-100 opacity-100"
              : "scale-0 opacity-0"
          } ${
            isAnimating ? "animate-[spin_500ms_ease-in-out]" : ""
          }`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;