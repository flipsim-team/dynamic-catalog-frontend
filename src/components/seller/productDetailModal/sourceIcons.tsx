import {
  Instagram,
  Youtube,
  Facebook,
  Linkedin,
  Twitter,
  Globe2,
} from "lucide-react";

// Pick a small icon that matches the source platform shown in the product detail modal.
export function productSourceIcon(platform?: string) {
  if (platform === "instagram") return <Instagram className="w-3 h-3" />;
  if (platform === "youtube") return <Youtube className="w-3 h-3" />;
  if (platform === "facebook") return <Facebook className="w-3 h-3" />;
  if (platform === "linkedin") return <Linkedin className="w-3 h-3" />;
  if (platform === "twitter") return <Twitter className="w-3 h-3" />;
  return <Globe2 className="w-3 h-3" />;
}
