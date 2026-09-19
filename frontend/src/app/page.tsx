"use client";

import { useState } from "react";
import { Board } from "@/components/Board";
import styles from "./styles.module.scss";
import { Theme } from "./types";

export default function Home() {
  const [theme, setTheme] = useState<Theme>(Theme.Light);

  function toggleTheme() {
    const next = theme === Theme.Light ? Theme.Dark : Theme.Light;
    setTheme(next);
    // The CSS in globals.css reacts to this attribute.
    document.documentElement.dataset.theme = next;
  }

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <button type="button" className={styles.themeToggle} onClick={toggleTheme}>
        {theme === Theme.Light ? "Dark mode" : "Light mode"}
      </button>
      <Board />
    </main>
  );
}
