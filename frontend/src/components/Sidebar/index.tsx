"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VARIANTS } from "@/variants/constants";
import styles from "./styles.module.scss";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className={styles.sidebar}>
      <Link href="/" className={styles.home}>
        Chess
      </Link>
      <ul className={styles.list}>
        {VARIANTS.map((variant, index) => {
          const href = `/${variant.slug}`;
          return (
            <li key={variant.slug}>
              <Link
                href={href}
                className={`${styles.link} ${pathname === href ? styles.active : ""}`}
              >
                {index + 1}. {variant.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
