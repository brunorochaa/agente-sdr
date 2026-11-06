import { cn } from "@/lib/utils";

/**
 * Marca do ERP360: o rosto de óculos escuros, o "B)" do Bruno.
 * Mantenha igual ao `public/favicon.svg` (o `favicon.ico` e o `icon-256.png`
 * vêm do mesmo ícone original).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" aria-hidden="true" className={cn("h-8 w-8", className)}>
      <rect width="256" height="256" rx="56" fill="#1f7a3f" />
      <rect x="46" y="86" width="163" height="20" rx="10" fill="#181818" />
      <rect x="46" y="94" width="74" height="47" rx="22" fill="#181818" />
      <rect x="136" y="94" width="73" height="47" rx="22" fill="#181818" />
      <rect x="62" y="104" width="24" height="6" rx="3" fill="#a0a0a0" />
      <rect x="154" y="104" width="24" height="6" rx="3" fill="#a0a0a0" />
      <path
        d="M103 174q35 22 73-4"
        fill="none"
        stroke="#fff"
        strokeWidth="11"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <a
      href="#topo"
      className={cn("flex items-center gap-2.5 text-lg font-semibold tracking-tight", className)}
      aria-label="ERP360, início da página"
    >
      <LogoMark />
      <span>
        ERP<span className="text-primary">360</span>
      </span>
    </a>
  );
}
