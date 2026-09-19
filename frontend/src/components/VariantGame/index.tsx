"use client";

import { useSyncExternalStore } from "react";
import { Board } from "@/components/Board";
import { getVariant } from "@/variants/utils";

const subscribe = () => () => {};

/**
 * Resolves a variant slug to its game. Rendered only in the browser, because
 * some starting positions are random and the server's would not match.
 */
export function VariantGame({ slug }: { slug: string }) {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const variant = getVariant(slug);

  if (!isClient || !variant) return null;
  return <Board variant={variant} />;
}
