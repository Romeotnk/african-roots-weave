import { Link } from "@tanstack/react-router";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Leaf } from "lucide-react";

const colTitle = "text-white text-[11px] font-semibold uppercase tracking-[0.1em] mb-5";
const link = "block text-white/70 hover:text-[var(--brand-gold)] transition-colors text-[14px] py-1.5";

export function Footer() {
  return (
    <footer className="bg-[var(--brand-primary-dark)] text-white">
      <div className="container-iwosan py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center"><Leaf size={18} /></div>
              <span className="font-extrabold text-[20px]">IWOSAN</span>
            </div>
            <p className="text-white/70 text-[14px] leading-[1.7] mb-5">
              Plateforme panafricaine dédiée à la médecine traditionnelle, aux plantes médicinales et au patrimoine de guérison africain.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} className="w-9 h-9 rounded-full bg-white/10 hover:bg-[var(--brand-gold)] hover:text-[var(--brand-primary-dark)] flex items-center justify-center transition-colors cursor-pointer">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className={colTitle}>Navigation</h4>
            <Link className={link} to="/">Accueil</Link>
            <Link className={link} to="/marketplace">Marketplace</Link>
            <Link className={link} to="/annuaire">Annuaire</Link>
            <Link className={link} to="/agenda">Agenda</Link>
            <Link className={link} to="/formations">Formations</Link>
          </div>
          <div>
            <h4 className={colTitle}>Nos Espaces</h4>
            <Link className={link} to="/pharmacopee">Pharmacopée vivante</Link>
            <Link className={link} to="/rites-cultures">Rites & Cultures</Link>
            <Link className={link} to="/sante-quotidien">Santé au quotidien</Link>
            <Link className={link} to="/recettes-sante">Recettes santé</Link>
            <Link className={link} to="/discutons-en">Discutons-en</Link>
          </div>
          <div>
            <h4 className={colTitle}>Contact & Légal</h4>
            <a className={link} href="mailto:contact@iwosan.africa">contact@iwosan.africa</a>
            <a className={link}>WhatsApp : +221 77 000 00 00</a>
            <a className={link}>CGU</a>
            <a className={link}>Politique de confidentialité</a>
            <a className={link}>Mentions légales</a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-iwosan py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-white/60">
          <span>© 2025 Iwosan. Tous droits réservés.</span>
          <span>Fait avec ❤️ pour l'Afrique</span>
        </div>
      </div>
    </footer>
  );
}
