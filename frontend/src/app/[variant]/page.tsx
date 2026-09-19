import { notFound } from "next/navigation";
import { VariantGame } from "@/components/VariantGame";
import { VARIANTS } from "@/variants/constants";
import { getVariant } from "@/variants/utils";

// The one route for every game: /original, /chess960, ...
// Unknown slugs 404 instead of being rendered on demand.
export const dynamicParams = false;

export function generateStaticParams() {
  return VARIANTS.map(({ slug }) => ({ variant: slug }));
}

export default async function VariantPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  const { variant } = await params;
  if (!getVariant(variant)) notFound();

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-4">
      <VariantGame slug={variant} />
    </main>
  );
}
