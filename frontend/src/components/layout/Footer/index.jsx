import Logo from "@/components/atom/Logo";
import { Link } from "react-router-dom";

const footerLinks = [
  { title: "Home", url: "/" },
  { title: "Pricing", url: "/pricing" },
  { title: "Contact", url: "/contact" },
];

const legalLinks = [
  { title: "Privacy Policy", url: "/privacy" },
  { title: "Terms of Service", url: "/terms" },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 w-full">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <Logo />
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-4 md:mt-0">
            {footerLinks.map((link) => (
              <Link
                key={link.url}
                to={link.url}
                className="text-sm text-gray-400 hover:text-primary"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
          <p>
            © 2026 eduplan. All rights reserved.{" "}
            {legalLinks.map((link, idx) => (
              <span key={link.url}>
                <Link className="hover:text-primary" to={link.url}>
                  {link.title}
                </Link>
                {idx !== legalLinks.length - 1 && " · "}
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
