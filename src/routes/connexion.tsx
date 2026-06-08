import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/connexion")({
  head: () => ({ meta: [{ title: "Connexion — IWOSAN" }] }),
  component: Connexion,
});

function Connexion() {
  const [show, setShow] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--brand-bg)]">
      <div className="w-full max-w-[420px]">
        <Link to="/" className="block text-center mb-8">
          <span className="font-extrabold text-[28px] text-[var(--brand-primary)]">IWOSAN</span>
        </Link>
        <div className="bg-white rounded-[24px] shadow-iwosan-xl p-8 md:p-10">
          <h2 className="text-[28px] text-center">Bon retour !</h2>
          <p className="text-center text-[14px] text-[var(--color-text-muted)] mt-1">Connectez-vous à votre espace Iwosan</p>
          <form className="mt-7 space-y-4">
            <input type="email" placeholder="Email" className="w-full h-12 px-4 rounded-lg border border-[var(--brand-border)] outline-none focus:border-[var(--brand-primary)]" />
            <div className="relative">
              <input type={show?"text":"password"} placeholder="Mot de passe" className="w-full h-12 px-4 pr-11 rounded-lg border border-[var(--brand-border)] outline-none focus:border-[var(--brand-primary)]" />
              <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">{show?<EyeOff size={18}/>:<Eye size={18}/>}</button>
            </div>
            <div className="text-right"><a className="text-[13px] font-semibold text-[var(--brand-primary)] cursor-pointer">Mot de passe oublié ?</a></div>
            <button className="w-full h-12 rounded-full bg-[var(--brand-primary)] text-white font-semibold hover:bg-[var(--brand-primary-dark)]">Connexion</button>
          </form>
          <div className="my-6 flex items-center gap-3 text-[12px] text-[var(--color-text-muted)]">
            <div className="flex-1 h-px bg-[var(--brand-border-light)]" /> ou <div className="flex-1 h-px bg-[var(--brand-border-light)]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="h-11 rounded-lg border border-[var(--brand-border)] font-semibold text-[14px] hover:bg-[var(--brand-surface-alt)]">Google</button>
            <button className="h-11 rounded-lg bg-[#1877F2] text-white font-semibold text-[14px]">Facebook</button>
          </div>
          <p className="mt-6 text-center text-[14px] text-[var(--color-text-muted)]">Pas encore inscrit ? <Link to="/inscription" className="font-semibold text-[var(--brand-primary)]">Créer un compte →</Link></p>
        </div>
      </div>
    </div>
  );
}
