import Logo from "@/components/atom/Logo";
import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const footerLinks = {
  product: [
    { title: "Home", url: "/" },
    { title: "Pricing", url: "/pricing" },
    { title: "Features", url: "/#features" },
  ],
  company: [
    { title: "About", url: "/about" },
    { title: "Contact", url: "/contact" },
    { title: "Careers", url: "/careers" },
  ],
  legal: [
    { title: "Privacy Policy", url: "/privacy" },
    { title: "Terms of Service", url: "/terms" },
    { title: "Cookie Policy", url: "/cookies" },
  ],
};

const socialLinks = [
  { icon: Github, url: "#", label: "GitHub" },
  { icon: Twitter, url: "#", label: "Twitter" },
  { icon: Linkedin, url: "#", label: "LinkedIn" },
  { icon: Mail, url: "#", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-slate-800/50 bg-gradient-to-b from-background to-slate-950">
      {/* Top section with links */}
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand section */}
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Empowering students with AI-powered learning tools for a better
              educational experience.
            </p>
            {/* Social links */}
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.url}
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-primary/50 flex items-center justify-center text-slate-400 hover:text-primary transition-all duration-300"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.url}>
                  <Link
                    to={link.url}
                    className="text-sm text-slate-400 hover:text-primary transition-colors duration-200"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.url}>
                  <Link
                    to={link.url}
                    className="text-sm text-slate-400 hover:text-primary transition-colors duration-200"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.url}>
                  <Link
                    to={link.url}
                    className="text-sm text-slate-400 hover:text-primary transition-colors duration-200"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="border-t border-slate-800/50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 text-center md:text-left">
              © {new Date().getFullYear()} EduPlan. All rights reserved.
            </p>
            <p className="text-sm text-slate-500">
              Made with ❤️ for students everywhere
            </p>
          </div>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
    </footer>
  );
}
