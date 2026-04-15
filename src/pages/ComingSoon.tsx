import { Facebook, Instagram, Youtube } from "lucide-react";
import logo from "@/assets/techfriday-logo.png";
import ThemeToggle from "@/components/ThemeToggle";

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

const ComingSoon = () => {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div className="fixed top-6 right-6 z-50"><ThemeToggle /></div>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse-glow" />
        <div className="absolute left-1/3 top-2/3 -translate-x-1/2 h-[300px] w-[300px] rounded-full bg-accent/10 blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        <img src={logo} alt="TechFriday logo" className="w-24 h-24 mb-8" />
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Coming Soon
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed mb-10">
          TechFriday started in December 2020 as a pre-release tech news channel.
        </p>
        <div className="flex items-center gap-5">
          {socials.map(({ href, icon: Icon, label, color }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={`text-muted-foreground transition-colors ${color}`} aria-label={label}>
              <Icon className="w-6 h-6" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
