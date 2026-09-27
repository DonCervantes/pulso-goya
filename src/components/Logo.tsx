import Image from "next/image";
import Link from "next/link";

// Marca de Pulso (símbolo + wordmark) para usar en headers de toda la app.
export default function Logo({
  href = "/",
  wordmark = true,
}: {
  href?: string;
  wordmark?: boolean;
}) {
  return (
    <Link href={href} className="flex items-center gap-2" aria-label="Pulso, inicio">
      <Image src="/pulso-mark.svg" alt="" width={36} height={36} priority className="h-9 w-9" />
      {wordmark && (
        <span className="text-xl font-extrabold text-[var(--color-primary)]">Pulso</span>
      )}
    </Link>
  );
}
