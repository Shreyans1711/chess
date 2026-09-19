import { VARIANTS } from "./constants";
import type { Variant } from "./types";

export function getVariant(slug: string): Variant | undefined {
  return VARIANTS.find((variant) => variant.slug === slug);
}
