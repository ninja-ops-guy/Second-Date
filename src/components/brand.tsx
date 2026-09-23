import Link from "next/link";
import { TimerReset } from "lucide-react";

export function Brand({ inverse = false, href = "/" }: { inverse?: boolean; href?: string }) {
  return (
    <Link href={href} className={`brand ${inverse ? "brand-inverse" : ""}`} aria-label="Second Date home">
      <span className="brand-mark" aria-hidden="true"><TimerReset size={20} strokeWidth={2.3} /></span>
      <span className="brand-word">second<span>date</span><b>.</b></span>
    </Link>
  );
}
