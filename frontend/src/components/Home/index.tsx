import { USER_NAME } from "@/constant";
import styles from "./styles.module.scss";

export function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-4">
      <h1 className={styles.title}>Hello {USER_NAME}</h1>
      <p className={styles.subtitle}>Pick a game from the sidebar to start playing.</p>
    </main>
  );
}
