import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="fixed top-6 right-6 p-2.5 rounded-full bg-muted/80 backdrop-blur-sm border border-border hover:bg-muted transition-colors z-50"
      aria-label="Toggle theme"
    >
      {dark ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
    </button>
  );
};

export default ThemeToggle;
