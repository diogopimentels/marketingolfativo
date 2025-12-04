import { motion } from "framer-motion";
import {
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  ArrowUpRight
} from "lucide-react";

const footerLinks = {
  sections: [
    { label: "O que aprender", href: "#o-que-aprender" },
    { label: "Estatísticas", href: "#estatisticas" },
    { label: "Sobre", href: "#sobre" },
    { label: "Baixar", href: "#baixar" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-premium">
        {/* Main Footer */}
        <div className="py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Brand */}
          <div>
            <a href="#" className="flex items-center gap-3 mb-6">
              <img src="/logo.png" alt="Logo" className="h-12 w-auto object-contain" />
            </a>
            <p className="text-primary-foreground/70 mb-6 max-w-xs leading-relaxed">
              Transforme a identidade da sua marca com o poder do aroma.
            </p>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="md:justify-self-end">
            <h4 className="font-medium mb-4 text-sm uppercase tracking-wider text-primary-foreground/60">
              Navegação
            </h4>
            <ul className="space-y-3">
              {footerLinks.sections.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-300 inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/60">
            © 2024 Karui Cosméticos. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
