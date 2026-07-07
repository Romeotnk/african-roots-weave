import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function AccountBackLink({
  to = "/mon-compte",
  label = "Retour au compte",
}: {
  to?: string;
  label?: string;
}) {
  return (
    <Link
      to={to as never}
      className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--brand-primary)]"
    >
      <ArrowLeft size={16} /> {label}
    </Link>
  );
}
