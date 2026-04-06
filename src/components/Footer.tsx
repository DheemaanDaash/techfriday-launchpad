import { Facebook, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/techfriday-logo.png";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.21 8.21 0 0 0 4.76 1.51V6.77a4.83 4.83 0 0 1-1-.08z" />
  </svg>
);

const socials = [
  { href: "https://www.facebook.com/TechFridayBD", icon: Facebook, label: "Facebook", color: "hover:text-facebook" },
  { href: "https://www.instagram.com/techfridaybd/", icon: Instagram, label: "Instagram", color: "hover:text-instagram" },
  { href: "https://www.youtube.com/c/TechFridayBD/", icon: Youtube, label: "YouTube", color: "hover:text-youtube" },
  { href: "https://www.tiktok.com/@techfridaybd", icon: TikTokIcon, label: "TikTok", color: "hover:text-tiktok dark:hover:text-foreground" },
];

const categories = [
  { label: "Android", to: "/category/android" },
  { label: "Apple", to: "/category/apple" },
  { label: "News", to: "/category/news" },
  { label: "Samsung", to: "/category/samsung" },
  { label: "Uncategorized", to: "/category/uncategorized" },
  { label: "Videos", to: "/category/videos" },
];

const community = [
  { label: "Videos", to: "/videos" },
  { label: "Blog", to: "/blog" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Logo & Copyright */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="TechFriday" className="h-9 w-9" />
              <span className="text-lg font-bold font-display bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                TechFriday
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2020–2023 TechFriday. All rights reserved.
            </p>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h3 className="mb-3 text-sm font-semibold font-display text-foreground">Categories</h3>
            <ul className="space-y-2">
              {categories.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Community */}
          <div>
            <h3 className="mb-3 text-sm font-semibold font-display text-foreground">Community</h3>
            <ul className="space-y-2">
              {community.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: About Us */}
          <div>
            <h3 className="mb-3 text-sm font-semibold font-display text-foreground">About Us</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              TechFriday started in December 2020 as a pre-release tech news channel.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ href, icon: Icon, label, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-muted-foreground transition-colors ${color}`}
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
